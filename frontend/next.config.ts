import type { NextConfig } from 'next'
import path from 'path'

const nextConfig: NextConfig = {
  // Tell Next.js not to bundle Prisma — use native Node.js require at runtime
  serverExternalPackages: ['@prisma/client', 'prisma'],

  webpack: (config) => {
    // Resolve @backend and @shared imports from outside the frontend directory
    config.resolve.alias = {
      ...config.resolve.alias,
      '@backend': path.resolve(__dirname, '../backend'),
      '@shared': path.resolve(__dirname, '../shared'),
    }
    return config
  },
}

export default nextConfig
