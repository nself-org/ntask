/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: false,
  },
  images: {
    unoptimized: true,
    domains: ['localhost', 'local.nself.org'],
  },
  // Use standalone for Docker, comment out for static export
  output: process.env.DOCKER_BUILD ? 'standalone' : undefined,
  trailingSlash: true,
};

module.exports = nextConfig;
