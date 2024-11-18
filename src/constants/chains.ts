import { isProduction } from '../utils'

import FuseIcon from '../assets/svg/logos/fuse-small-logo.svg'
import EthIcon from '../assets/svg/logos/ethereum-small-logo.svg'
import BinanceIcon from '../assets/svg/logos/binance-small-logo.svg'

export const ChainId = {
  FUSE: 122,
  SPARK: 123,
  MAINNET: 1,
  ROPSTEN: 3,
  RINKEBY: 4,
  GÖRLI: 5,
  KOVAN: 42,
  BINANCE_MAINNET: 56,
  BINANCE_TESTNET: 97,
}

export interface Chain {
  chainId: string
  chainName: string
  nativeCurrency: {
    name: string
    symbol: string
    decimals: number
  }
  icon: any
  rpc: string
  explorer?: string
}

export const FUSE_CHAIN: Chain = {
  chainId: '0x7a',
  chainName: 'Fuse Network',
  nativeCurrency: {
    name: 'Fuse',
    symbol: 'FUSE',
    decimals: 18,
  },
  icon: FuseIcon,
  rpc: 'https://fuse.liquify.com',
  explorer: 'https://explorer.fuse.io',
}

export const SPARK_CHAIN: Chain = {
  chainId: '0x7b',
  chainName: 'Fuse Spark Testnet',
  nativeCurrency: {
    name: 'Spark',
    symbol: 'SPARK',
    decimals: 18,
  },
  icon: FuseIcon,
  rpc: 'https://rpc.fusespark.io',
  explorer: 'https://explorer.fusespark.io',
}

export const BSC_CHAIN: Chain = {
  chainId: '0x38',
  chainName: 'Binance',
  nativeCurrency: {
    name: 'Binance',
    symbol: 'BNB',
    decimals: 18,
  },
  icon: BinanceIcon,

  rpc: 'https://bsc-dataseed.binance.org',
  explorer: 'https://bscscan.com',
}

export const ETH_CHAIN: Chain = {
  chainId: '0x1',
  chainName: 'Ethereum',
  nativeCurrency: {
    name: 'Ethereum',
    symbol: 'ETH',
    decimals: 18,
  },
  icon: EthIcon,
  rpc: 'https://mainnet.infura.io/v3/2ba4786ec53f4b4aadd7ef61f37e5080',
  explorer: 'https://etherscan.io',
}

export const BINANCE_TESTNET: Chain = {
  chainId: '0x61',
  chainName: 'Smart Chain Testnet',
  nativeCurrency: {
    name: 'Binance',
    symbol: 'BNB',
    decimals: 18,
  },
  icon: BinanceIcon,
  rpc: 'https://data-seed-prebsc-1-s1.binance.org:8545/',
  explorer: 'https://testnet.bscscan.com',
}

export const CHAIN_MAP: { [key: number]: Chain } = {
  [ChainId.FUSE]: FUSE_CHAIN,
  [ChainId.BINANCE_MAINNET]: BSC_CHAIN,
  [ChainId.MAINNET]: ETH_CHAIN,
  [ChainId.SPARK]: SPARK_CHAIN,
}

export const getChains = () => {
  const TEST_NETS = [SPARK_CHAIN]
  const NETWORKS = [FUSE_CHAIN, BSC_CHAIN, ETH_CHAIN]

  return [...NETWORKS, ...(isProduction() ? [] : TEST_NETS)].map((chain) => ({
    id: chain?.chainId,
    icon: chain?.icon,
    token: chain?.nativeCurrency?.symbol,
    label: chain?.chainName,
    rpcUrl: chain?.rpc,
    blockExplorerUrl: chain?.explorer,
  }))
}
