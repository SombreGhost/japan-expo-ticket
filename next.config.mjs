/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '5mb', // Autorise les screenshots jusqu'à 5 Mo
    },
  },
}

export default nextConfig
