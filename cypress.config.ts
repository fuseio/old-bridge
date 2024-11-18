import { defineConfig } from 'cypress'

export default defineConfig({
  fixturesFolder: false,
  video: false,
  defaultCommandTimeout: 10000,
  env: {
    ropsten_network_url:
      'https://ropsten.infura.io/v3/2ba4786ec53f4b4aadd7ef61f37e5080',
    fuse_network_url: 'https://fuse.liquify.com/',
  },
  e2e: {
    setupNodeEvents(on, config) {},
    baseUrl: 'http://localhost:3000',
  },
})
