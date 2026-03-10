const createNextIntlPlugin = require('next-intl/plugin');
const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

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
  output: process.env.DOCKER_BUILD ? 'standalone' : undefined,
  trailingSlash: true,
};

module.exports = withNextIntl(nextConfig);
