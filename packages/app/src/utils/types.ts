export interface State<T> {
  loading: boolean
  data?: T
  error?: string
}

export interface EventPublication {
  id: string
  createdAt: string
  handle: string
  profileId: string
  ownedBy: string
  publishedOn: string

  startsAt: string
  endsAt: string
  links: string[]
  tags: string[]
  location: string | any
  geographic: string | any
  contentURI: string
}
