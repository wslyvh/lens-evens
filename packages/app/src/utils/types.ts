export interface State<T> {
  loading: boolean
  data?: T
  error?: string
}

export interface EventPublication {
  id: string
  title: string
  content: string
  createdAt: string
  publishedOn: string
  profile: Profile

  collectLimit?: number
  followerOnly?: boolean

  startsAt: string
  endsAt: string
  links: string[]
  tags: string[]
  location: string | any
  geographic: string | any
  contentURI: string
  imageURI: string
  rawImageURI: string

  attendees: Profile[]
}

export interface Profile {
  id: string
  handle: string
  ownedBy: string
  createdAt: string
}

export interface EventData {
  appId: string
  locale: string
  title: string
  content: string
  startsAt: string
  endsAt: string
  location: string
  links: string[]
  tags: string[]
}
