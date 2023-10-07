import { Web3Storage } from 'web3.storage'

if (!process.env.NEXT_PUBLIC_WEB3_STORAGE_API_KEY) {
  console.error('NEXT_PUBLIC_WEB3_STORAGE_API_KEY is not defined')
}

const client = new Web3Storage({ token: process.env.NEXT_PUBLIC_WEB3_STORAGE_API_KEY ?? '' })

export async function Store(name: string, serialized: string) {
  console.log('Store on web3.storage', name)

  const buffer = Buffer.from(serialized)
  const files = [new File([buffer], name)]
  const cid = await client.put(files, {
    wrapWithDirectory: false,
  })

  return cid
}

export async function List() {
  console.log('Listing files..')

  for await (const item of client.list({ maxResults: 10 })) {
    console.log(item.cid, item.name, item.created)
  }
}

export async function GetFile(cid: string) {
  const res = await client.get(cid)
  if (res) {
    const files = await res.files()
    if (files && files.length > 0) {
      const file = files[0]
      const content = await file.text()

      return content
    }
  }
}

export async function Verify(cid: string, includeGateways: boolean = false) {
  console.log('web3.storage Verify', cid, includeGateways)
  const post = await GetFile(cid)
  if (!post) console.error('Unable to fetch from Web3Storage SDK')

  if (includeGateways) {
    const ipfs = await fetch(`https://ipfs.io/ipfs/${cid}`)
    if (ipfs.status !== 200) console.error('Unable to fetch from IPFS IO')
    const cloudflare = await fetch(`https://cloudflare-ipfs.com/ipfs/${cid}`)
    if (cloudflare.status !== 200) console.error('Unable to fetch from Cloudflare')
  }

  return true
}
