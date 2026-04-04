import path from 'node:path'

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  outputFileTracingRoot: path.join(import.meta.dirname, '..'),
  async rewrites() {
    if (process.env.NODE_ENV !== 'development') {
      return []
    }

    const baseUrl = process.env.CORE_API_BASE_URL || 'http://localhost:3000'

    return [
      {
        source: '/api/:path*',
        destination: `${baseUrl.replace(/\/$/, '')}/api/:path*`,
      },
    ]
  },
}

export default nextConfig
