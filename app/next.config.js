const withNextIntl = require('next-intl/plugin')(
  // This is the default (also the `src` folder is supported out of the box)
  './src/i18n.ts'
)

const withBundleAnalyzer =
  process.env.ANALYZE === 'true' ? require('@next/bundle-analyzer')({ enabled: true }) : cfg => cfg

module.exports = withBundleAnalyzer(
  withNextIntl({
    reactStrictMode: true,
    // Required by Next i18n with API routes, otherwise API routes 404 when fetching without trailing slash
    trailingSlash: true,
    webpack: config => {
      config.resolve.fallback = { ...config.resolve.fallback, buffer: false }
      return config
    },
    experimental: {
      appDir: true,
      fontLoaders: [{ loader: '@next/font/google', options: { subsets: ['latin'] } }],
    },
  }/** @type {import('next').NextConfig} */)
)
