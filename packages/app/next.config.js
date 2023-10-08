/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
      },
      {
        protocol: 'https',
        hostname: 'gw.ipfs-lens.dev',
        port: '',
      },
      {
        protocol: 'https',
        hostname: 'gw.ipfs-lens.com',
        port: '',
      },
    ],
  },
}

module.exports = nextConfig
