/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  logging: {
    fetches: {
      fullUrl: true,
    },
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'awaas-hub.bf05a50045c377e8ceee2889ef31765e.r2.cloudflarestorage.com',
      },
    ],
  },
}

export default nextConfig