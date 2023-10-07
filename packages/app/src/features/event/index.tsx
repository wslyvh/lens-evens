'use client'

import { useLensContext } from '@/context/Lens'
import { DateCard } from './date'
import { CalendarDaysIcon, MapPinIcon, UserIcon } from '@heroicons/react/24/outline'
import dayjs from 'dayjs'

interface Props {
  id: string
}

export function EventDetails(props: Props) {
  const lens = useLensContext()
  const event = lens.events.find((event) => event.id === props.id)

  if (!event) return null

  const sameDay = dayjs(event.startsAt).isSame(event.endsAt, 'day')

  return (
    <div className='flex flex-col'>
      <div className='w-full h-[240px]'>
        <img
          src='https://images.unsplash.com/photo-1475721027785-f74eccf877e2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80'
          alt='Event Image'
          className='rounded-lg w-full h-full object-cover'
        />
      </div>
      <div className='relative h-8'>
        <div className='absolute right-12 -top-8'>
          <DateCard date={event.startsAt} />
        </div>
      </div>
      <h1 className='text-xl font-bold'>Event {event.id}</h1>
      <div className='flex flex-col mt-4 gap-2'>
        <p className='flex flex-row items-center gap-2'>
          <CalendarDaysIcon className='h-5 w-5' /> {dayjs(event.startsAt).format('ddd MMM DD · HH:mm')} -{' '}
          {dayjs(event.endsAt).format(sameDay ? 'HH:mm' : 'ddd MMM DD · HH:mm')}
        </p>
        <p className='flex flex-row items-center gap-2'>
          <MapPinIcon className='h-5 w-5' /> {event.location}
        </p>
        <p className='flex flex-row items-center gap-2'>
          <UserIcon className='h-5 w-5' /> 42 going
        </p>
      </div>
    </div>
  )
}
