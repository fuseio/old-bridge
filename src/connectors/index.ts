import { PortisConnector } from '@web3-react/portis-connector'
import { InjectedConnector } from '@web3-react/injected-connector'
import { WalletLinkConnector } from '@web3-react/walletlink-connector'
import { Web3Provider, JsonRpcProvider } from '@ethersproject/providers'
import { WalletConnectConnector } from '@fuseio/web3-react-walletconnect-connector'

import { isProduction } from '../utils'
import { NetworkConnector } from './NetworkConnector'
import { BSC_CHAIN, ChainId, ETH_CHAIN, FUSE_CHAIN } from '../constants/chains'

const PORTIS_ID = process.env.REACT_APP_PORTIS_ID
const WALLETCONNECT_BRIDGE = process.env.REACT_APP_WALLETCONNECT_BRIDGE

export const sparkProvider = new JsonRpcProvider('https://rpc.fusespark.io')

export const network = new NetworkConnector({
  urls: { [ChainId.FUSE]: FUSE_CHAIN.rpc },
})

let networkLibrary: Web3Provider | undefined
export function getNetworkLibrary(): Web3Provider {
  return (networkLibrary = networkLibrary ?? new Web3Provider(network.provider as any))
}

function buildNetworkLibrary(url: string, chainId: number) {
  const network = new NetworkConnector({
    urls: { [chainId]: url },
  })
  return new Web3Provider(network.provider as any)
}

export const getChainNetworkLibrary = (chainId: number) => {
  switch (chainId) {
    case ChainId.MAINNET:
      return buildNetworkLibrary(ETH_CHAIN.rpc, chainId)
    case ChainId.BINANCE_MAINNET:
      return buildNetworkLibrary(BSC_CHAIN.rpc, chainId)
    default:
      // fuse network library
      return getNetworkLibrary()
  }
}

export const fuseReadProvider = new JsonRpcProvider(FUSE_CHAIN.rpc)

export const mainnetReadProvider = new JsonRpcProvider(ETH_CHAIN.rpc)

export const bscReadProvider = new JsonRpcProvider(BSC_CHAIN.rpc)

export const injectedSupportedChainIds = isProduction()
  ? [ChainId.MAINNET, 122, ChainId.BINANCE_MAINNET]
  : [ChainId.MAINNET, 122, ChainId.BINANCE_MAINNET, 123]

export const injected = new InjectedConnector({
  supportedChainIds: injectedSupportedChainIds,
})

// mainnet only
export const walletconnect = new WalletConnectConnector({
  rpc: {
    [ChainId.MAINNET]: ETH_CHAIN.rpc,
    [ChainId.FUSE]: FUSE_CHAIN.rpc,
    [ChainId.BINANCE_MAINNET]: BSC_CHAIN.rpc,
  },

  qrcodeModalOptions: {
    desktopLinks: ['volt', 'argent', 'safepal', 'trust', 'rainbow'],
    mobileLinks: ['volt', 'metamask', 'safepal', 'trust', 'argent', 'rainbow'],
  },
  bridge: WALLETCONNECT_BRIDGE,
  qrcode: true,
})

//metmask
export const metamaskConnect = new WalletConnectConnector({
  rpc: {
    [ChainId.MAINNET]: ETH_CHAIN.rpc,
    [ChainId.FUSE]: FUSE_CHAIN.rpc,
    [ChainId.BINANCE_MAINNET]: BSC_CHAIN.rpc,
  },
  bridge: WALLETCONNECT_BRIDGE,
  qrcode: true,
})

// mainnet only
export const portis = new PortisConnector({
  dAppId: PORTIS_ID ?? '',
  networks: [1],
})

// mainnet only
export const walletlink = new WalletLinkConnector({
  url: ETH_CHAIN.rpc,
  appName: 'Voltage.finance',
  appLogoUrl: 'images/android-chrome-192x192.png',
  supportedChainIds: [122, 1, 56],
})
