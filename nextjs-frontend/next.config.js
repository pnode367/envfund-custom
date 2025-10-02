/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Allow mixed JS/TS
  typescript: {
    ignoreBuildErrors: false,
  },
  // Image optimization config
  images: {
    domains: [],
  },
  // Support for older browsers if needed
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
};

module.exports = nextConfig;
