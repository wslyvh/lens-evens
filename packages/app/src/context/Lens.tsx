'use client'

import {
  EventMetadataV3Fragment,
  LensClient,
  LimitType,
  OpenActionModuleInput,
  PublicationMetadataMainFocusType,
  PublicationType,
  isRelaySuccess,
} from '@lens-protocol/client'
import { PropsWithChildren, createContext, useCallback, useContext, useEffect, useState } from 'react'
import { useAccount } from 'wagmi'
import { signMessage, signTypedData } from '@wagmi/core'
import { EventMetadata } from '@lens-protocol/metadata'
import { LENS_APP_ID, LENS_ENVIRONMENT } from '@/utils/lens'
import { EventPublication } from '@/utils/types'

interface LensState {
  loading: boolean
  authenticated: boolean
  client: LensClient
  events: EventPublication[]
  profileId?: string
}

interface LensStateContext extends LensState {
  Authenticate: () => Promise<void>
  CreateProfile: (handle: string) => Promise<boolean>
  CreateEvent: (data: EventMetadata, actions: OpenActionModuleInput[]) => Promise<boolean>
  AttendEvent: (id: string) => Promise<boolean>
  DeleteEvent: (id: string) => Promise<boolean>
  GetEvents: () => Promise<void>
}

const defaultState: LensStateContext = {
  loading: true,
  authenticated: false,
  client: new LensClient({ environment: LENS_ENVIRONMENT }),
  events: [],
  Authenticate: async () => { },
  CreateProfile: async (handle: string) => true,
  CreateEvent: async (data: EventMetadata, actions: OpenActionModuleInput[]) => true,
  AttendEvent: async (id: string) => true,
  DeleteEvent: async (id: string) => true,
  GetEvents: async () => { },
}

const LensContext = createContext(defaultState)

export const useLensContext = () => useContext(LensContext)

export function LensV2Provider(props: PropsWithChildren) {
  const account = useAccount()
  const [state, setState] = useState<LensStateContext>({
    ...defaultState,
    Authenticate,
    CreateProfile,
    CreateEvent,
    DeleteEvent,
    AttendEvent,
    GetEvents,
  })

  const GetEventsCallback = useCallback(async () => {
    const result = await state.client.publication.fetchAll({
      limit: LimitType.Fifty,
      where: {
        publicationTypes: [PublicationType.Post],
        metadata: {
          mainContentFocus: [PublicationMetadataMainFocusType.Event],
          publishedOn: [LENS_APP_ID],
        },
      },
    })

    const events = result.items.map((item: any) => {
      const metadata = item.metadata as EventMetadataV3Fragment

      return {
        id: item.id,
        createdAt: item.createdAt,
        handle: item.by.handle,
        profileId: item.by.id,
        ownedBy: item.by.ownedBy.address,
        publishedOn: item.publishedOn?.id,

        startsAt: metadata.startsAt,
        endsAt: metadata.endsAt,
        links: metadata.links,
        tags: metadata.tags,
        location: metadata.location,
        geographic: metadata.geographic,
        contentURI: metadata.rawURI,
      } as EventPublication
    })

    setState((state) => ({ ...state, events, loading: false }))
  }, [state.client])

  const AuthenticateCallback = useCallback(async () => {
    if (!account.address) {
      console.error('Unable to authenticate: no account address')
      return
    }

    // Check if client is authenticated
    const isAuthenticated = await state.client.authentication.isAuthenticated()
    let profileId = await state.client.authentication.getProfileId()
    if (isAuthenticated && profileId) {
      console.error('Client already authenticated. Set profile id', profileId)
      const accessTokenResult = await state.client.authentication.getAccessToken()
      const accessToken = accessTokenResult.unwrap()
      console.log('Access Token', accessToken)

      setState((state) => ({ ...state, authenticated: true, profileId: profileId as string }))
    } else {
      // Check if account has profiles
      const ownedProfilesResult = await state.client.profile.fetchAll({
        where: { ownedBy: [account.address] },
      })

      if (ownedProfilesResult.items.length === 0) {
        console.error('No Profiles found for account address')
        return
      }

      profileId = ownedProfilesResult.items[0].id
    }

    try {
      console.log(`Generate challenge for ${profileId} signed by ${account.address}`)
      const challenge = await state.client.authentication.generateChallenge({
        for: profileId,
        signedBy: account.address,
      })
      console.log('Sign message', challenge.text)
      const signature = await signMessage({
        message: challenge.text,
      })

      console.log('Authenticate Lens Client with signature', signature)
      await state.client.authentication.authenticate({
        id: challenge.id,
        signature,
      })

      console.log('Authenticated Lens Client.')
      setState((state) => ({ ...state, authenticated: true, profileId: profileId as string }))
    } catch (e) {
      console.log('Unable to authenticate', e)
      console.error(e)
    }
  }, [account.address, state.client])

  useEffect(() => {
    console.log('LensProvider.Initialize GetEvents')
    GetEventsCallback()
  }, [GetEventsCallback])

  useEffect(() => {
    console.log('LensProvider.Initialize Authenticate')

    AuthenticateCallback() // TODO: Handle state properly / Auto Reconnect
  }, [AuthenticateCallback, account.address])

  async function Authenticate() {
    console.log('LensProvider.Authenticate')
    await AuthenticateCallback()
  }

  async function CreateProfile(handle: string) {
    if (!account.address) {
      console.error('Unable to create profile: no account address')
      return false
    }

    console.log('LensProvider.CreateProfile', handle)
    const createProfileResult = await state.client.profile.create({
      handle: handle,
      to: account.address,
    })

    if (isRelaySuccess(createProfileResult)) {
      console.log('Waiting for transaction', createProfileResult.txHash)
      await state.client.transaction.waitUntilComplete({ forTxId: createProfileResult.txId })

      console.log('Authenticate with newly created profile')
      await AuthenticateCallback()

      console.log('Create Profile Manager Typed Data')
      const typedProfileManagerResult = await state.client.profile.createChangeProfileManagersTypedData({
        approveLensManager: true,
      })

      console.log('Sign Profile Manager')
      const { id, typedData } = typedProfileManagerResult.unwrap()
      const signedTypedData = await signTypedData({
        domain: typedData.domain as any,
        primaryType: 'ChangeDelegatedExecutorsConfig',
        message: typedData.value as any,
        types: typedData.types as any,
      })

      console.log('Broadcast Profile Manager Transaction')
      const profileManagerResult = await state.client.transaction.broadcastOnchain({
        id,
        signature: signedTypedData,
      })

      console.log('Profile Manager Result', profileManagerResult)
      const profileManagerValue = profileManagerResult.unwrap()
      if (isRelaySuccess(profileManagerValue)) {
        console.log('Profile Manager Transaction', profileManagerValue.txId)
        return true
      }
    } else {
      console.log('Unable to create profile')
      console.error(createProfileResult)
    }

    return false
  }

  async function CreateEvent(data: EventMetadata, actions: OpenActionModuleInput[] = []) {
    console.log('LensProvider.CreateEvent', data)

    const content = JSON.stringify(data)
    const contentURI = await uploadToIPFS(content)

    console.log('Post Content to Lens', contentURI, actions)
    const result = await state.client.publication.postOnchain({
      contentURI: contentURI,
      openActionModules: actions,
    })

    console.log('Waiting for transaction', result)
    const value = result.unwrap()
    if (isRelaySuccess(value)) {
      try {
        await state.client.transaction.waitUntilComplete({ forTxId: value.txId })

        return true
      } catch (ex) {
        console.error(ex)
        console.log('Unable to wait for tx..')
        return false
      }
    }

    return false
  }

  async function AttendEvent(id: string) {
    console.log('LensProvider.AttendEvent', id)

    try {
      const result = await state.client.publication.actions.actOn({
        actOn: {
          simpleCollectOpenAction: true,
        },
        for: id,
      })
      console.log('RESULT', result)
    } catch (e) {
      console.log('Unable to attend publication')
      console.error(e)
      return false
    }

    return true
  }

  async function DeleteEvent(id: string) {
    console.log('LensProvider.DeleteEvent', id)

    try {
      const result = await state.client.publication.hide({
        for: id,
      })
      console.log('RESULT', result)
    } catch (e) {
      console.log('Unable to hide publication')
      console.error(e)
      return false
    }

    return true
  }

  async function GetEvents() {
    console.log('LensProvider.GetEvents')
    await GetEventsCallback()
  }

  async function uploadToIPFS(data: string) {
    console.log('Upload to IPFS', data)
    // const cid = await Store('post.json', data)
    // const status = await Verify(cid, true)
    // if (!status) console.error('Unable to verify CID', cid)

    return `ipfs://${data}`
  }

  return <LensContext.Provider value={state}>{props.children}</LensContext.Provider>
}
