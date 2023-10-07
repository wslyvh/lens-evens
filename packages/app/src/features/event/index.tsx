'use client'

import { useLensContext } from '@/context/Lens'
import { DateCard } from './date'
import { CalendarDaysIcon, MapPinIcon, UserIcon } from '@heroicons/react/24/outline'
import Image from 'next/image'
import dayjs from 'dayjs'
import { useAccount } from 'wagmi'
import { useState } from 'react'

interface Props {
  id: string
}

export function EventDetails(props: Props) {
  const account = useAccount()
  const [loading, setLoading] = useState(false)
  const lens = useLensContext()
  const event = lens.events.find((event) => event.id === props.id)
  if (!event) return null

  const isAttending = event.attendees.find((attendee) => attendee.ownedBy === account.address)
  const sameDay = dayjs(event.startsAt).isSame(event.endsAt, 'day')

  async function attend() {
    setLoading(true)
    if (!lens.authenticated) {
      await lens.Authenticate()
    }
    await lens.AttendEvent(props.id)
    setLoading(false)
  }

  return (
    <>
      <div className='flex flex-col bg-neutral rounded-lg'>
        <div className='w-full h-[240px]'>
          <Image
            width={0}
            height='140'
            src='https://images.unsplash.com/photo-1475721027785-f74eccf877e2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80'
            alt='Event Image'
            sizes='100vw'
            className='rounded-t-lg w-full h-full object-cover'
          />
        </div>

        <div className='relative'>
          <div className='absolute right-16 -top-8'>
            <DateCard date={event.startsAt} />
          </div>
        </div>

        <div className='mt-2 p-8'>
          <h1 className='text-xl text-white font-bold'>{event.title ?? `Event ${event.id}`}</h1>
          <div className='flex flex-col mt-4 gap-2'>
            <p className='flex flex-row items-center gap-2'>
              <CalendarDaysIcon className='h-5 w-5 text-info' /> {dayjs(event.startsAt).format('ddd MMM DD · HH:mm')} -{' '}
              {dayjs(event.endsAt).format(sameDay ? 'HH:mm' : 'ddd MMM DD · HH:mm')}
            </p>
            <p className='flex flex-row items-center gap-2'>
              <MapPinIcon className='h-5 w-5 text-info' /> {event.location}
            </p>
            <p className='flex flex-row items-center gap-2'>
              <UserIcon className='h-5 w-5  text-info' /> {event.attendees.length} going{' '}
              {event.collectLimit && (
                <>
                  {' '}
                  · <span className='text-accent'>{event.collectLimit - event.attendees.length} left</span>
                </>
              )}
            </p>
          </div>

          <div className='relative'>
            <div className='absolute right-8 -top-8'>
              {isAttending && <span className='text-accent'>Attending</span>}
              {!isAttending && (
                <button
                  onClick={attend}
                  type='button'
                  className='btn btn-accent btn-outline btn-sm'
                  disabled={!account.address || loading}>
                  {loading && (
                    <>
                      Loading
                      <span className='loading loading-spinner h-4 w-4' />
                    </>
                  )}
                  {!loading && <>&nbsp;Attend&nbsp;</>}
                </button>
              )}
            </div>
          </div>

          {event.content && <p className='mt-8'>{event.content}</p>}
        </div>
      </div>

      <div className='px-10'>
        <ol className='relative border-l border-gray-700 pt-8'>
          <li className='mb-4 ml-4'>
            <div className='absolute w-3 h-3 bg-gray-200 rounded-full mt-1.5 -left-1.5 border border-gray-900 bg-neutral'></div>
            <time className='mb-1 text-sm font-normal leading-none text-neutral-100'>
              {dayjs(event.startsAt).format('ddd MMM DD YYYY · hh:mm')}
            </time>
            <p className='text-base font-normal text-gray-400'>Start Event</p>
          </li>
          {event.attendees.map((attendee) => (
            <li key={attendee.id} className='mb-4 ml-4'>
              <div className='absolute w-3 h-3 bg-gray-200 rounded-full mt-1.5 -left-1.5 border border-gray-900 bg-gray-700'></div>
              <time className='mb-1 text-sm font-normal leading-none text-gray-500'>
                {dayjs(attendee.createdAt).format('DD MMM YYYY · hh:mm')}
              </time>
              <p className='text-base font-normal text-gray-400'>{attendee.handle} is attending</p>
            </li>
          ))}
          <li className='mb-4 ml-4'>
            <div className='absolute w-3 h-3 bg-gray-200 rounded-full mt-1.5 -left-1.5 border border-gray-900 bg-accent'></div>
            <time className='mb-1 text-sm font-normal leading-none text-accent'>
              {dayjs(event.createdAt).format('DD MMM YYYY · hh:mm')}
            </time>
            <p className='text-base font-normal text-gray-400'>Event created</p>
          </li>
        </ol>
      </div>
    </>
  )
}
