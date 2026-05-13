/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: '*.supabase.co',
      },
    ],
    deviceSizes: [640, 750, 828, 1080],
    imageSizes: [128, 256, 384, 512],
  },
}

module.exports = nextConfig
