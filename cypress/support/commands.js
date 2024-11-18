// ***********************************************
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
import { JsonRpcProvider } from '@ethersproject/providers'
import { Wallet } from '@ethersproject/wallet'
import { Eip1193Bridge } from '@ethersproject/experimental/lib/eip1193-bridge'

// never send real ether to this, obviously
const PRIVATE_KEY_TEST_NEVER_USE = '0xab444ccca30f8a8e17bfb68f77eba30504e52ce49045d3b928e2450b5ce81e59'

// address of the above key
export const TEST_ADDRESS_NEVER_USE = '0x48C738d84415E5504346d6426a9e7fB7dff51Fb6'

export const TEST_ADDRESS_NEVER_USE_SHORTENED = '0x0fF2...F4a5'

class CustomizedBridge extends Eip1193Bridge {
  constructor(signer, provider, chainId) {
    super(signer, provider)
    this.chainId = chainId
  }

  async sendAsync(...args) {
    console.debug('sendAsync called', ...args)
    return this.send(...args)
  }
  async send(...args) {
    console.debug('send called', ...args)
    const isCallbackForm = typeof args[0] === 'object' && typeof args[1] === 'function'
    let callback
    let method
    let params
    if (isCallbackForm) {
      callback = args[1]
      method = args[0].method
      params = args[0].params
    } else {
      method = args[0]
      params = args[1]
    }
    console.debug('send called', { method, params, callback })
    if (method === 'eth_requestAccounts' || method === 'eth_accounts') {
      if (isCallbackForm) {
        callback({ result: [TEST_ADDRESS_NEVER_USE] })
      } else {
        return Promise.resolve([TEST_ADDRESS_NEVER_USE])
      }
    }
    if (method === 'eth_chainId') {
      if (isCallbackForm) {
        callback(null, { result: this.chainId })
      } else {
        return Promise.resolve(this.chainId)
      }
    }
    try {
      if (params && params.length && params[0].from && method === 'eth_call') delete params[0].from

      const result = await super.send(method, params)
      console.debug('result received', method, params, result)
      if (isCallbackForm) {
        callback(null, { result })
      } else {
        return result
      }
    } catch (error) {
      console.error(`CustomizedBridge: ${error?.message}`)
      if (isCallbackForm) {
        callback(error, null)
      } else {
        throw error
      }
    }
  }
}

Cypress.Commands.overwrite('visit', (original, url, options) => {
  return original(url, {
    ...options,
    onBeforeLoad(win) {
      options && options.onBeforeLoad && options.onBeforeLoad(win)
      win.localStorage.clear()

      let args, chainId

      if (options && options.networkName == 'ropsten') {
        chainId = '0x3'
        args = [Cypress.env('ropsten_network_url'), 3]
      } else {
        chainId = '0x7A'
        args = [Cypress.env('fuse_network_url'), 122]
      }

      const provider = new JsonRpcProvider(...args)
      const signer = new Wallet(PRIVATE_KEY_TEST_NEVER_USE, provider)
      win.ethereum = new CustomizedBridge(signer, provider, chainId)
    }
  })
})

Cypress.on('uncaught:exception', () => {
  // returning false here prevents Cypress from failing the test
  return false
})
