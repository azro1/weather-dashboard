/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: { 
    unoptimized: true,
    domains: ['openweathermap.org']
  },
  experimental: {
    optimizePackageImports: ['lucide-react']
  },
  swcMinify: false,
  compiler: {
    removeConsole: false,
  }
};

module.exports = nextConfig;