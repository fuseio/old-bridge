const path = require('path')
const webpack = require('webpack')
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer')

module.exports = function override(config, env) {
  const fallback = config.resolve.fallback || {}
  Object.assign(fallback, {
    url: require.resolve('url'),
    util: require.resolve('util'),
    assert: require.resolve('assert'),
    buffer: require.resolve('buffer'),
    vm: require.resolve('vm-browserify'),
    http: require.resolve('stream-http'),
    https: require.resolve('https-browserify'),
    process: require.resolve('process/browser'),
    os: require.resolve('os-browserify/browser'),
    crypto: require.resolve('crypto-browserify'),
    stream: require.resolve('stream-browserify'),
  })

  config.resolve.fallback = fallback

  config.resolve.alias = {
    ...config.resolve.alias,
    'bn.js': path.resolve(__dirname, 'node_modules/bn.js'),
    'magic-sdk': path.resolve(__dirname, 'node_modules/magic-sdk/dist/cjs/index.js'),
  }

  config.plugins = (config.plugins || []).concat([
    new webpack.ProvidePlugin({
      process: 'process/browser',
      Buffer: ['buffer', 'Buffer'],
    }),
    new webpack.IgnorePlugin({
      resourceRegExp: /genesisStates\/[a-z]*\.json$/,
      contextRegExp: /@ethereumjs\/common/,
    }),
    new BundleAnalyzerPlugin({
      analyzerMode: 'disabled',
    }),
  ])

  config.ignoreWarnings = [/Failed to parse source map/]

  config.module.rules.push({
    test: /\.(js|mjs|jsx)$/,
    enforce: 'pre',
    loader: require.resolve('source-map-loader'),
    resolve: {
      fullySpecified: false,
    },
  })

  if (env === 'production') {
    config.devtool = false
  }

  return config
}
