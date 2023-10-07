import dayjs from 'dayjs'
import { MapPinIcon } from '@heroicons/react/24/outline'
import Link from 'next/link'
import { EventPublication } from '@/utils/types'

interface Props {
  event: EventPublication
}

export function Card(props: Props) {
  return (
    <Link href={`/events/${props.event.id}`}>
      <div className='flex rounded-lg bg-neutral text-neutral-content p-4 hover:ring hover:ring-1'>
        <div className='w-full'>
          <p className='uppercase text-secondary text-sm'>{dayjs(props.event.startsAt).format('ddd MMM DD · HH:mm')}</p>
          <h2 className='text-xl font-bold mt-2'>Event {props.event.id}</h2>
          <div className='flex flex-row items-center gap-1 text-sm mt-4'>
            <MapPinIcon className='h-5 w-5' /> {props.event.location}
          </div>
        </div>

        <div>
          <div className='w-[160px] h-[80px]'>
            <img
              src='https://images.unsplash.com/photo-1475721027785-f74eccf877e2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80'
              alt='Event Image'
              className='rounded-lg w-full h-full object-cover'
            />
          </div>
        </div>
      </div>
    </Link>
  )
}
