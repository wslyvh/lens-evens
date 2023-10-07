import { EventDetails } from '@/features/event'

export default function Page({ params }: { params: { id: string } }) {
  return <EventDetails id={params.id} />
}
