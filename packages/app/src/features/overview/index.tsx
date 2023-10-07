'use client'

import { useLensContext } from '@/context/Lens'
import { Card } from './card'

export function Overview() {
  const lens = useLensContext()

  return (
    <div className='flex flex-col gap-2'>
      {lens.events.map((event) => {
        return <Card key={event.id} event={event} />
      })}
    </div>
  )
}
