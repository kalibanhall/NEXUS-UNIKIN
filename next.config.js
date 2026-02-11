/** @type {import('next').NextConfig} */
const nextConfig = {
  // Désactiver le cache en développement et forcer la revalidation en production
  generateBuildId: async () => {
    return `build-${Date.now()}`
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
      },
      {
        protocol: 'https',
        hostname: 'ui-avatars.com',
      },
    ],
  },
  experimental: {
    serverActions: {
      allowedOrigins: [
        process.env.NEXT_PUBLIC_APP_URL 
          ? new URL(process.env.NEXT_PUBLIC_APP_URL).host 
          : 'localhost:3000',
      ],
    },
  },
  poweredByHeader: false,
  async headers() {
    return [
      {
        // Empêcher le cache sur les pages HTML pour avoir toujours la dernière version
        source: '/((?!_next/static|_next/image|images/).*)',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-XSS-Protection', value: '1; mode=block' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
          { key: 'Cache-Control', value: 'no-cache, no-store, must-revalidate' },
          { key: 'Pragma', value: 'no-cache' },
          { key: 'Expires', value: '0' },
        ],
      },
      {
        // Les assets statiques (JS/CSS/images) bundlés peuvent être cachés longtemps
        source: '/_next/static/(.*)',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
    ]
  },
}

module.exports = nextConfig
