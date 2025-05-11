import type { NextConfig } from 'next';

/** Next.js 配置 */
const nextConfig: NextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  env: {
    BASE_URL: process.env.VITE_BASE_URL,
  },
  images: {
    domains: ['localhost', 'lh3.googleusercontent.com', 'auscoolstuff.com.au'],
    unoptimized: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
