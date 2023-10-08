'use client'

import React from 'react'
import { LinkComponent } from './LinkComponent'
import { SITE_NAME } from '@/utils/site'
import { Connect } from './Connect'
import Link from 'next/link'
import { PlusIcon } from '@heroicons/react/24/outline'
import { useLensContext } from '@/context/Lens'

export function Header() {
  const lens = useLensContext()

  async function Auth() {
    await lens.Authenticate()
  }
  async function CreateProfile() {
    const username = new Date().valueOf().toString()
    await lens.CreateProfile(username)
  }
  async function ProfileManager() {
    const username = new Date().valueOf().toString()
    await lens.SetProfileManager()
  }

  return (
    <header className='navbar flex justify-between p-4 pt-0'>
      <LinkComponent href='/'>
        <h1 className='text-lg font-bold'>{SITE_NAME}</h1>
      </LinkComponent>

      <div className='flex gap-4'>
        {/* <button className='btn btn-xs' onClick={Auth}>
          AUTH
        </button>
        <button className='btn btn-xs' onClick={CreateProfile}>
          CREATE PROFILE
        </button>
        <button className='btn btn-xs' onClick={ProfileManager}>
          SET MANAGER
        </button> */}

        <Connect />

        <Link href='/create'>
          <button className='btn glass btn-square btn-sm'>
            <PlusIcon className='h-4 w-4' />
          </button>
        </Link>
      </div>
    </header>
  )
}
