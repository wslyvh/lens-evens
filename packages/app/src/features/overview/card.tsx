import dayjs from 'dayjs'
import { MapPinIcon } from '@heroicons/react/24/outline'
import Link from 'next/link'
import { EventPublication } from '@/utils/types'
import Image from 'next/image'

interface Props {
  event: EventPublication
}

export function Card(props: Props) {
  return (
    <Link href={`/events/${props.event.id}`}>
      <div className='flex rounded-lg bg-neutral text-neutral-content p-4 hover:ring hover:ring-1'>
        <div className='w-full'>
          <p className='uppercase text-secondary text-sm'>{dayjs(props.event.startsAt).format('ddd MMM DD · HH:mm')}</p>
          <h2 className='text-xl font-bold mt-2'>{props.event.title}</h2>
          <div className='flex flex-row items-center gap-1 text-sm mt-4'>
            <MapPinIcon className='h-5 w-5' /> {props.event.location}
          </div>
        </div>

        <div>
          <div className='w-[160px] h-[80px]'>
            <Image
              width='160'
              height='80'
              src={props.event.imageURI}
              alt='Event Image'
              className='rounded-lg w-full h-full object-cover'
            />
          </div>
        </div>
      </div>
    </Link>
  )
}
