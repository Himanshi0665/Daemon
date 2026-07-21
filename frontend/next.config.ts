import type { NextConfig } from 'next'
import path from 'path'

const nextConfig: NextConfig = {
  // Tell Next.js not to bundle Prisma — use native Node.js require at runtime
  serverExternalPackages: ['@prisma/client', 'prisma', 'googleapis'],

  // Set the workspace root to the monorepo root
  outputFileTracingRoot: path.resolve(__dirname, '..'),

  webpack: (config) => {
    // Resolve @backend and @shared imports from outside the frontend directory
    config.resolve.alias = {
      ...config.resolve.alias,
      '@backend': path.resolve(__dirname, '../backend'),
      '@shared': path.resolve(__dirname, '../shared'),
    }

    // Ensure modules from backend can resolve dependencies from frontend's node_modules
    config.resolve.modules = [
      ...(config.resolve.modules || []),
      path.resolve(__dirname, 'node_modules'),
      'node_modules',
    ]

    return config
  },
}

export default nextConfig
