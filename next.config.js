/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: [
      'localhost',
      'wajmzidupadjhptmxnvn.supabase.co',
      'ikrzoijbhdkbmkeyuqlg.supabase.co',
      'qavtrohtyndiuaxriygz.supabase.co',
    ],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.supabase.co',
      },
    ],
  },
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET, POST, PUT, DELETE, OPTIONS' },
          { key: 'Access-Control-Allow-Headers', value: 'Content-Type, Authorization' },
        ],
      },
    ]
  },
  experimental: {
    serverComponentsExternalPackages: ['@supabase/supabase-js'],
  },
}

module.exports = nextConfig
