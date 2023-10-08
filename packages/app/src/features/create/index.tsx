'use client'

import { useLensContext } from '@/context/Lens'
import { LENS_APP_ID, TOKEN_ADDRESS } from '@/utils/lens'
import { EventData } from '@/utils/types'
import { InformationCircleIcon } from '@heroicons/react/24/outline'
import { event } from '@lens-protocol/metadata'
import { OpenActionModuleInput, SimpleCollectOpenActionModuleInput } from '@lens-protocol/client'
import dayjs from 'dayjs'
import { ChangeEvent, useState } from 'react'
import { useAccount } from 'wagmi'
import { useRouter } from 'next/navigation'
import { FileUpload } from './upload'

interface FilePreview {
  url: string
  file: File
}

export function CreateEvent() {
  const router = useRouter()
  const account = useAccount()
  const lens = useLensContext()
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [filePreview, setFilePreview] = useState<FilePreview | undefined>()
  const [collect, setCollect] = useState({
    price: 0,
    limit: 0,
    followersOnly: false,
  })
  const [eventData, setEventData] = useState<EventData>({
    appId: LENS_APP_ID,
    locale: 'en',
    title: '',
    content: '',
    startsAt: dayjs().hour(10).minute(0).second(0).format('YYYY-MM-DDTHH:mm:ss'),
    endsAt: dayjs().hour(13).minute(0).second(0).format('YYYY-MM-DDTHH:mm:ss'),
    location: '',
    links: [],
    tags: [],
  })

  async function submit() {
    console.log('Create Event with SimpleCollectAction', eventData, collect)
    if (
      !eventData.title ||
      !eventData.location ||
      !eventData.startsAt ||
      !eventData.endsAt ||
      eventData.links.length === 0
    ) {
      return setMessage('Please fill in all required fields.')
    }
    setMessage('')

    const simpleCollectOpenAction: SimpleCollectOpenActionModuleInput = {
      followerOnly: collect.followersOnly,
    }

    if (collect.limit > 0) {
      simpleCollectOpenAction.collectLimit = collect.limit.toString()
    }

    if (collect.price > 0) {
      simpleCollectOpenAction.amount = {
        currency: TOKEN_ADDRESS,
        value: collect.price.toString(),
      }
    }

    const actions: OpenActionModuleInput[] = []
    actions.push({
      collectOpenAction: {
        simpleCollectOpenAction,
      },
    })

    setLoading(true)

    if (!lens.authenticated) {
      await lens.Authenticate()
    }

    const result = await lens.CreateEvent(
      {
        ...eventData,
        startsAt: dayjs(eventData.startsAt).toISOString(),
        endsAt: dayjs(eventData.endsAt).toISOString(),
      },
      actions,
      filePreview?.file
    )
    if (result) {
      await lens.GetEvents()
      router.push('/')
      return
    }

    setLoading(false)
    setMessage('Unable to create event.')
  }

  async function handleChange(e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    if (!e.target.id) return

    if (e.target.id === 'website') {
      return setEventData((state) => {
        return {
          ...state,
          links: [e.target.value],
        }
      })
    }
    if (e.target.id === 'tags') {
      return setEventData((state) => {
        return {
          ...state,
          tags: e.target.value.split(',').map((tag) => tag.trim()),
        }
      })
    }

    setEventData((state) => {
      return {
        ...state,
        [e.target.id]: e.target.value,
      }
    })
  }

  async function handleCollectChange(e: ChangeEvent<HTMLInputElement>) {
    if (!e.target.id) return
    if (isNaN(Number(e.target.value))) return

    setCollect((state) => {
      return {
        ...state,
        [e.target.id]: e.target.value,
      }
    })
  }

  async function handleFileUpload(file: File) {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = async function () {
      setFilePreview({
        url: reader.result as string,
        file,
      })
    }
  }

  return (
    <>
      {message && (
        <div className='alert'>
          <InformationCircleIcon className='h-6 w-6 text-blue-400' />
          <span>{message}</span>
        </div>
      )}
      <form onSubmit={submit}>
        <div className='form-control w-full'>
          <label className='label' htmlFor='title'>
            <span className='label-text'>
              Title <span className='text-accent'>*</span>
            </span>
          </label>
          <input
            id='title'
            type='text'
            className='input input-sm input-bordered w-full'
            onChange={handleChange}
            required
          />
        </div>

        <div className='form-control w-full'>
          <label className='label' htmlFor='content'>
            <span className='label-text'>Content</span>
          </label>
          <textarea
            id='content'
            className='textarea textarea-sm textarea-bordered h-24 w-full'
            onChange={handleChange}
          />
        </div>

        <div className='flex flex-row justify-between form-control w-full gap-4'>
          <div className='flex-grow'>
            <label className='label' htmlFor='startsAt'>
              <span className='label-text'>
                Start <span className='text-accent'>*</span>
              </span>
            </label>
            <input
              id='startsAt'
              type='datetime-local'
              className='input input-sm input-bordered w-full'
              value={eventData.startsAt}
              onChange={handleChange}
            />
          </div>
          <div className='flex-grow'>
            <label className='label' htmlFor='endsAt'>
              <span className='label-text'>
                End <span className='text-accent'>*</span>
              </span>
            </label>
            <input
              id='endsAt'
              type='datetime-local'
              className='input input-sm input-bordered w-full'
              value={eventData.endsAt}
              onChange={handleChange}
            />
          </div>
        </div>

        <div className='form-control w-full'>
          <label className='label' htmlFor='location'>
            <span className='label-text'>
              Location <span className='text-accent'>*</span>
            </span>
          </label>
          <input id='location' type='text' className='input input-sm input-bordered w-full' onChange={handleChange} />
        </div>

        <div className='form-control w-full'>
          <label className='label' htmlFor='website'>
            <span className='label-text'>
              Website <span className='text-accent'>*</span>
            </span>
          </label>
          <input id='website' type='text' className='input input-sm input-bordered w-full' onChange={handleChange} />
        </div>

        <h3 className='text-lg font-bold my-4'>
          Cover{' '}
          {filePreview?.url && (
            <button className='btn btn-xs ml-4' onClick={() => setFilePreview(undefined)}>
              clear
            </button>
          )}
        </h3>
        {filePreview?.url && (
          <div className='w-full h-64'>
            <img src={filePreview.url} alt='Image preview' className='rounded-lg w-full h-full object-cover' />
          </div>
        )}
        {!filePreview && <FileUpload onFileUpload={handleFileUpload} />}

        <h3 className='text-lg font-bold mt-4'>Tickets</h3>
        <p className='text-sm text-gray-500 mb-4'>Allow attendees to buy tickets using Lens Collect modules</p>

        <div className='form-control w-full max-w-xs'>
          <label className='label cursor-pointer'>
            <span className='label-text'>Followers Only</span>
            <input
              type='checkbox'
              className='toggle'
              onChange={() => setCollect((state) => ({ ...state, followersOnly: !state.followersOnly }))}
            />
          </label>
        </div>

        <div className='form-control w-full'>
          <label className='label' htmlFor='price'>
            <span className='label-text w-96'>Ticket Price (in $ USDC)</span>
            <input
              id='price'
              type='text'
              className='input input-sm input-bordered w-full'
              value={collect.price}
              onChange={handleCollectChange}
            />
          </label>
        </div>

        <div className='form-control w-full'>
          <label className='label' htmlFor='limit'>
            <span className='label-text w-96'>Max. limit</span>
            <input
              id='limit'
              type='text'
              className='input input-sm input-bordered w-full'
              value={collect.limit}
              onChange={handleCollectChange}
            />
          </label>
        </div>

        <button className='btn btn-primary btn-sm mt-4' type='button' onClick={submit} disabled={loading}>
          {loading && (
            <>
              Loading
              <span className='loading loading-spinner h-4 w-4' />
            </>
          )}
          {!loading && <>Submit</>}
        </button>
      </form>
    </>
  )
}
