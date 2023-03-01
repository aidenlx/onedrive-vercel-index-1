const withNextIntl = require('next-intl/plugin')(
  // This is the default (also the `src` folder is supported out of the box)
  './src/i18n.ts'
)

const withBundleAnalyzer =
  process.env.ANALYZE === 'true' ? require('@next/bundle-analyzer')({ enabled: true }) : cfg => cfg

const isDev = process.env.NODE_ENV !== 'production'

const withPWA = require('@ducanh2912/next-pwa').default({
  dest: 'public',
  scope: '/api/batch/',
  register: false,
})

module.exports = withPWA(
  withBundleAnalyzer(
    withNextIntl({
      typescript: {
        ignoreBuildErrors: true,
      },
      eslint: {
        ignoreDuringBuilds: true,
      },
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
    })
  )
)
