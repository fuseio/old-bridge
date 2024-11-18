import walletConnectModule from '@web3-onboard/walletconnect'
import coinbaseWalletModule from '@web3-onboard/coinbase'
import enrkypt from '@web3-onboard/enkrypt'
import gnosisModule from '@web3-onboard/gnosis'
import injectedModule from '@web3-onboard/injected-wallets'
import mewWallet from '@web3-onboard/mew-wallet'
import trezorModule from '@web3-onboard/trezor'

const METAMASK_ID = 'c57ca95b47569778a828d19178114f4db188b89b763c899ba0be274e97267d96'
const TRUST_WALLET_ID = '4622a2b2d6af1c9844944291e5e7351a6aa24cd7b23099efac1b2fd875da31a0'
const RAINBOW_ID = '1ae92b26df02f0abca6304df07debccd18262fdf5fe82daa81593582dac9a369'
const SAFE_PAL_ID = '0b415a746fb9ee99cce155c2ceca0c6f6061b1dbca2d722b3ba16381d0562150'
const WALLET_CONNECT_PROJECT_ID = '870dd85324fc36bd112c99a8c22c12f7'

export const coinbaseWalletSdk = coinbaseWalletModule()
export const gnosis = gnosisModule()
export const mewWalletModule = mewWallet()
export const enrkyptModule = enrkypt()

export const trezor = trezorModule({
  email: 'ariel@fuse.io',
  appUrl: 'https://app.voltage.finance/',
})

export const injected = injectedModule()

export const walletConnect = walletConnectModule({
  version: 2,
  requiredChains: [1],
  projectId: WALLET_CONNECT_PROJECT_ID,
  dappUrl: 'https://app.voltage.finance',
  additionalOptionalMethods: ['wallet_switchEthereumChain', 'wallet_addEthereumChain'],
  qrModalOptions: {
    enableExplorer: true,
    explorerExcludedWalletIds: 'ALL',
    explorerRecommendedWalletIds: [METAMASK_ID, TRUST_WALLET_ID, SAFE_PAL_ID, RAINBOW_ID],
    mobileWallets: [
      {
        id: 'Volt',
        name: 'Volt',
        links: {
          native: 'volt:',
          universal: 'https://get.voltage.finance',
        },
      },
    ],
  },
})
