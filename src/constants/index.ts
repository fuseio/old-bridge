import JSBI from 'jsbi'
import { BigNumber } from 'ethers'
import { ChevronDown } from 'react-feather'
import { AbstractConnector } from '@web3-react/abstract-connector'
import { Token, ChainId, Percent } from '@voltage-finance/sdk-core'

import { WRAPPED_NATIVE_CURRENCY } from './token'
import { VOLTAGE_FINANCE_LOGOS_URL } from './lists'
import { WrappedTokenInfo } from '../state/lists/hooks'
import { injected, walletconnect, walletlink } from '../connectors'

import ArrowRight from '../assets/svg/right-arrow.svg'
import MetamaskIcon from '../assets/images/metamask.png'
import WalletLinkIcon from '../assets/images/coinbaseWalletIcon.svg'
import WalletConnectIcon from '../assets/images/walletConnectIcon.svg'

export const ONE_ETH = BigNumber.from('10').pow('18')

export const ROUTER_ADDRESS = '0xE3F85aAd0c8DD7337427B9dF5d0fB741d65EEEB5'
export const FACTORY_ADDRESS = '0x1998E4b0F1F922367d8Ec20600ea2b86df55f34E'
export const FACTORY_V3_ADDRESS = '0xaD079548b3501C5F218c638A02aB18187F62b207' // has to be checksum for subgraphs

export const FUSE_ERC20_TO_ERC677_BRIDGE_HOME_ADDRESS = '0xc2220646E1E76D5fF3a441eDd9E8EFF0e4A8EF03'
export const FUSE_ERC20_TO_ERC677_BRIDGE_FOREIGN_ADDRESS = '0xf301d525da003e874DF574BCdd309a6BF0535bb6'

export const FUSE_ERC677_TO_ERC677_BRIDGE_HOME_ADDRESS = '0xD39021DB018E2CAEadb4B2e6717D31550e7918D0'
export const FUSE_ERC677_TO_ERC677_BRIDGE_FOREIGN_ADDRESS = '0xD5D11eE582c8931F336fbcd135e98CEE4DB8CCB0'

export const FUSE_NATIVE_TO_ERC677_BRIDGE_HOME_ADDRESS = '0xd617774b9708F79187Dc7F03D3Bdce0a623F6988'
export const FUSE_NATIVE_TO_ERC677_BRIDGE_FOREIGN_ADDRESS = '0x3014ca10b91cb3D0AD85fEf7A3Cb95BCAc9c0f79'

export const BINANCE_CHAIN_ID = ChainId.BNB
export const BINANCE_ERC20_TO_ERC677_FOREIGN_BRIDGE_ADDRESS = '0xc461e59276a2B03B9ebb1289C2c9Cd020677c3A9'

export const BINANCE_ERC20_TO_ERC677_HOME_BRIDGE_ADDRESS = '0x93B477BA32092F5Db932003639DD5d875B2EfC94'

export const GOODDOLLAR_FOREIGN_TOKEN_ADDRESS = '0x67C5870b4A41D4Ebef24d2456547A03F1f3e094B'
export const GOODDOLLAR_HOME_TOKEN_ADDRESS = '0x495d133B938596C9984d462F007B676bDc57eCEC'

export const FUSE_FOREIGN_TOKEN_ADDRESS = '0x970B9bB2C0444F5E81e9d0eFb84C8ccdcdcAf84d'

export const TOKEN_MIGRATOR_ADDRESS = '0xA1277C716882066b1Ba1eF938B8F3935B198B0E9'

export const VOLT_ROLL_ADDRESS = '0x095989B3A25b3Ff045328ea62BA8060e75238616'

export const UNDER_MAINTENANCE = process.env.REACT_APP_UNDER_MAINTENANCE === 'true'

export const FUSD_ENABLED = true

export const BINANCE_TESTNET_CHAINID = 97
export const BINANCE_MAINNET_CHAINID = 56

export const BSC_NATIVE_TO_ERC677_BRIDGE_HOME_ADDRESS = '0xf9b276A1A05934ccD953861E8E59c6Bc428c8cbD'
export const BSC_NATIVE_TO_ERC677_BRIDGE_FOREIGN_ADDRESS = '0x61A8287fA7a9f4D10F4699BC2aE77f962DC508B6'

export const WRAPPED_FUSE_ON_ETH_ADDRESS = '0x970B9bB2C0444F5E81e9d0eFb84C8ccdcdcAf84d'
export const WRAPPED_FUSE_ON_BSC_ADDRESS = '0x5857c96DaE9cF8511B08Cb07f85753C472D36Ea3'

export const BSC_FUSE_TOKEN_ADDRESS = '0x5857c96DaE9cF8511B08Cb07f85753C472D36Ea3'
export const PEG_SWAP_ADDRESS = '0xdfE016328E7BcD6FA06614fE3AF3877E931F7e0a'
export const FUSD_MIGRATION_PEGSWAP_ADDRESS = '0xd7AD6F7a420b89F34DbB78A1C17634599500a094'
export const LAYERZERO_PEGSWAP_ADDRESS = '0x56eE525bB9056BeD23A6055E60b2A2C5C225D1db'
export const BUSD_USDT_V2_PEGSWAP_ADDRESS = '0x9a9bE0479152B09B5F85a5Ad81a7cc492d549557'

export const FUSD_DEPRECATED_ADDRESS = '0x249BE57637D8B013Ad64785404b24aeBaE9B098B'

export const BSC_BNB_NATIVE_TO_ERC20_BRIDGE_HOME_ADDRESS = '0x51849F05090b222FFc329DC8825de0D7e26F84A1'
export const BSC_BNB_NATIVE_TO_ERC20_BRIDGE_FOREIGN_ADDRESS = '0xA3C59198c10cB1ba9A3Ab924A23253072b393f25'
export const BNB_FOREIGN_TOKEN_ADDRESS = '0x6acb34b1Df86E254b544189Ec32Cf737e2482058'

export const COMPTROLLER_ADDRESS = '0x26a562B713648d7F3D1E1031DCc0860A4F3Fa340'
export const COMPOUND_LENS_ADDRESS = '0x658aA3a6844517FB52b59847829796CAd90231e4'

export const NATIVE_ADDRESS = '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE'

export const FUSE_MARKET = '0x025B0ff0920298e087308F3b2de0CF6399685909'

export const FUSE_BLOCKS_PER_MINUTE = 12
export const FUSE_BLOCK_PER_YEAR = FUSE_BLOCKS_PER_MINUTE * 60 * 24 * 365

export const ETH_FUSE_FOREIGN_AMB = '0x63C47c296B63bE888e9af376bd927C835014039f'

export const MERKLE_DISTRIBUTOR_ADDRESS = '0x3Fff27BC5cC97dCF37180a3c47578966881fE196'

export const VOLT_ADDRESS = '0x34Ef2Cc892a88415e9f02b91BfA9c91fC0bE6bD4'
export const ZAP_ADDRESS = '0x28bd1C2cabc98d5eD7073B91218538DEAbf8a7F0'
export const S_FUSE_LIQUID_STAKING_ADDRESS = '0xa3dc222eC847Aac61FB6910496295bF344Ea46be'
export const FUSD_ADDRESS = '0xd0ce1b4A349C35e61Af02f5971e71ac502441E49'
export const FUSD_ADDRESS_V3 = '0xCE86a1cf3cFf48139598De6bf9B1dF2E0f79F86F'

export const CONSENSUS_CONTRACT_ADDRESS = '0x3014ca10b91cb3D0AD85fEf7A3Cb95BCAc9c0f79'
export const BLOCK_REWARD_CONTRACT_ADDRESS = '0x63D4efeD2e3dA070247bea3073BCaB896dFF6C9B'

// a list of tokens by chain
type ChainTokenList = {
  readonly [chainId in number]: Token[]
}

export const DAI = new Token(ChainId.MAINNET, '0x6B175474E89094C44Da98b954EedeAC495271d0F', 18, 'DAI', 'Dai Stablecoin')
export const USDC = new Token(ChainId.MAINNET, '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', 6, 'USDC', 'USD//C')
export const USDT = new Token(ChainId.MAINNET, '0xdAC17F958D2ee523a2206206994597C13D831ec7', 6, 'USDT', 'Tether USD')
export const COMP = new Token(ChainId.MAINNET, '0xc00e94Cb662C3520282E6f5717214004A7f26888', 18, 'COMP', 'Compound')
export const MKR = new Token(ChainId.MAINNET, '0x9f8F72aA9304c8B593d555F12eF6589cC3A579A2', 18, 'MKR', 'Maker')
export const AMPL = new Token(ChainId.MAINNET, '0xD46bA6D942050d489DBd938a2C909A5d5039A161', 9, 'AMPL', 'Ampleforth')

export const FUSE_DAI = new Token(
  ChainId.FUSE,
  '0x94Ba7A27c7A95863d1bdC7645AC2951E0cca06bA',
  18,
  'DAI',
  'Dai Stablecoin on Fuse'
)
export const FUSE_USDC = new Token(
  ChainId.FUSE,
  '0x620fd5fa44BE6af63715Ef4E65DDFA0387aD13F5',
  6,
  'USDC',
  'USD Coin on Fuse'
)
export const FUSE_USDC_V2 = new Token(
  ChainId.FUSE,
  '0x28c3d1cd466ba22f6cae51b1a4692a831696391a',
  6,
  'USDC V2',
  'USD Coin on Fuse'
)

export const FUSE_USDT = new Token(
  ChainId.FUSE,
  '0xFaDbBF8Ce7D5b7041bE672561bbA99f79c532e10',
  6,
  'USDT',
  'Tether USD on Fuse'
)
export const FUSE_USDT_V2 = new Token(
  ChainId.FUSE,
  '0x68c9736781e9316ebf5c3d49fe0c1f45d2d104cd',
  6,
  'USDT V2',
  'Tether USD on Fuse'
)
export const FUSE_WBTC = new Token(
  ChainId.FUSE,
  '0x33284f95ccb7B948d9D352e1439561CF83d8d00d',
  8,
  'WBTC',
  'Wrapped BTC on Fuse'
)
export const FUSE_WETH = new Token(
  ChainId.FUSE,
  '0xa722c13135930332eb3d749b2f0906559d2c5b99',
  18,
  'WETH',
  'Wrapped Ether on Fuse'
)
export const FUSD_DEPRECATED = new Token(ChainId.FUSE, FUSD_DEPRECATED_ADDRESS, 18, 'fUSD', 'Fuse Dollar')
export const FUSE_DIA_ADDRESS = '0x94Ba7A27c7A95863d1bdC7645AC2951E0cca06bA'

export const FUSE_BUSD = new Token(
  ChainId.FUSE,
  '0x6a5F6A8121592BeCd6747a38d67451B310F7f156',
  18,
  'BUSD',
  'Binance USD on Fuse'
)

export const FUSE_UST = new Token(
  ChainId.FUSE,
  '0x0D58a44be3dCA0aB449965dcc2c46932547Fea2f',
  18,
  'atUST',
  'UST Terra on Fuse'
)

export const USDC_V2 = new Token(
  ChainId.FUSE,
  '0x28C3d1cD466Ba22f6cae51b1a4692a831696391A',
  6,
  'USDC V2',
  'USD Coin V2'
)

export const WETH_V2 = new Token(
  ChainId.FUSE,
  '0x5622F6dC93e08a8b717B149677930C38d5d50682',
  18,
  'WETH V2',
  'Wrapped Ether V2'
)

export const BNB_V2 = new Token(
  ChainId.FUSE,
  '0x117C0419352DDB6FE575A67FAa70315BDc4a93f3',
  18,
  'BNB V2',
  'BNB'
)

export const FUSE_BNB = new Token(ChainId.FUSE, BNB_FOREIGN_TOKEN_ADDRESS, 18, 'BNB', 'BNB on Fuse')

export const FUSD = new Token(ChainId.FUSE, FUSD_ADDRESS, 18, 'fUSD', 'Fuse Dollar')
export const FUSD_V3 = new Token(ChainId.FUSE, FUSD_ADDRESS_V3, 18, 'fUSD', 'Fuse Dollar')

export const XVOLT_ADDRESS = '0x97a6e78c9208c21afaDa67e7E61d7ad27688eFd1'
export const USDC_BUSD_USDT_ADDRESS = '0xa3c1046290b490e629e11ace35863cb0cae382ab'

export const VOLT = new Token(ChainId.FUSE, VOLT_ADDRESS, 18, 'VOLT', 'Volt')
export const xVOLT = new Token(ChainId.FUSE, XVOLT_ADDRESS, 18, 'xVOLT', 'xVolt')
export const sFUSE = new Token(ChainId.FUSE, '0xb1dd0b683d9a56525cc096fbf5eec6e60fe79871', 18, 'sFUSE', 'sFUSE')
export const wFUSE = new Token(ChainId.FUSE, '0x0BE9e53fd7EDaC9F859882AfdDa116645287C629', 18, 'WFUSE', 'WFUSE')
export const FUSE_GRAPH_TOKEN = new Token(
  ChainId.FUSE,
  '0x0be9e53fd7edac9f859882afdda116645287c629',
  18,
  'FUSE',
  'Fuse'
)

export const wrappedVOLT = new WrappedTokenInfo(
  { logoURI: 'https://fuselogo.s3.eu-central-1.amazonaws.com/volt_icon.png', ...VOLT },
  []
)
export const wrappedXVOLT = new WrappedTokenInfo({ logoURI: 'https://i.ibb.co/kqdxmtf/xVOLT.png', ...xVOLT }, [])
export const getStaticLogoUrl = (address: string) => `${VOLTAGE_FINANCE_LOGOS_URL}/${address}/logo.png`

const WRAPPED_NATIVE_CURRENCIES_ONLY: ChainTokenList = Object.fromEntries(
  Object.entries(WRAPPED_NATIVE_CURRENCY)
    .map(([key, value]) => [key, [value]])
    .filter(Boolean)
)

// used to construct intermediary pairs for trading
export const BASES_TO_CHECK_TRADES_AGAINST: ChainTokenList = {
  ...WRAPPED_NATIVE_CURRENCIES_ONLY,
  [ChainId.MAINNET]: [...WRAPPED_NATIVE_CURRENCIES_ONLY[ChainId.MAINNET], DAI, USDC, USDT, COMP, MKR],
  [ChainId.FUSE]: [
    ...WRAPPED_NATIVE_CURRENCIES_ONLY[ChainId.FUSE],
    FUSE_USDC,
    FUSE_USDT,
    FUSE_WBTC,
    FUSE_WETH,
    FUSD_DEPRECATED,
  ],
}

// used for display in the default list when adding liquidity
export const SUGGESTED_BASES: ChainTokenList = {
  ...WRAPPED_NATIVE_CURRENCIES_ONLY,
  [ChainId.MAINNET]: [...WRAPPED_NATIVE_CURRENCIES_ONLY[ChainId.MAINNET], DAI, USDC, USDT],
  [ChainId.FUSE]: [
    ...WRAPPED_NATIVE_CURRENCIES_ONLY[ChainId.FUSE],
    FUSE_USDC,
    FUSE_USDT,
    FUSE_WBTC,
    FUSE_WETH,
    FUSD_DEPRECATED,
  ],
}

// used to construct the list of all pairs we consider by default in the frontend
export const BASES_TO_TRACK_LIQUIDITY_FOR: ChainTokenList = {
  ...WRAPPED_NATIVE_CURRENCIES_ONLY,
  [ChainId.MAINNET]: [...WRAPPED_NATIVE_CURRENCIES_ONLY[ChainId.MAINNET], DAI, USDC, USDT],
  [ChainId.FUSE]: [
    ...WRAPPED_NATIVE_CURRENCIES_ONLY[ChainId.FUSE],
    FUSE_DAI,
    FUSE_USDC,
    FUSE_USDT,
    FUSE_WBTC,
    FUSE_WETH,
    FUSD_DEPRECATED,
  ],
}

export const PINNED_PAIRS: { readonly [chainId in ChainId]?: [Token, Token][] } = {
  [ChainId.MAINNET]: [
    [
      new Token(ChainId.MAINNET, '0x5d3a536E4D6DbD6114cc1Ead35777bAB948E3643', 8, 'cDAI', 'Compound Dai'),
      new Token(ChainId.MAINNET, '0x39AA39c021dfbaE8faC545936693aC917d5E7563', 8, 'cUSDC', 'Compound USD Coin'),
    ],
    [USDC, USDT],
    [DAI, USDT],
  ],
  [ChainId.FUSE]: [
    [FUSE_USDC, FUSE_USDT],
    [FUSE_DAI, FUSE_USDT],
  ],
}

export const MASTERCHEF_V2_ADDRESS: { readonly [chainId in ChainId]?: string } = {
  [ChainId.FUSE]: '0xc71E27C7e128d9CAEb2b8cA756647f7F199cF39e',
}

export const MASTERCHEF_V3_ADDRESS: { readonly [chainId in ChainId]?: string } = {
  [ChainId.FUSE]: '0xE3e184a7b75D0Ae6E17B58F5283b91B4E0A2604F',
}

export interface WalletInfo {
  connector?: AbstractConnector
  name: string
  icon: string
  description: string
  href: string | null
  color: string
  primary?: true
  mobile?: true
  mobileOnly?: true
}

export const SUPPORTED_WALLETS: { [key: string]: WalletInfo } = {
  INJECTED: {
    connector: injected,
    name: 'Injected',
    icon: ArrowRight,
    description: 'Injected web3 provider.',
    href: null,
    color: '#010101',
    primary: true,
  },
  METAMASK: {
    connector: injected,
    name: 'MetaMask',
    icon: MetamaskIcon,
    description: 'Easy-to-use browser extension.',
    href: null,
    color: '#E8831D',
    mobile: true,
  },
  WALLET_CONNECT: {
    connector: walletconnect,
    name: 'WalletConnect',
    icon: WalletConnectIcon,
    description: 'Connect to Trust Wallet, Rainbow Wallet and more...',
    href: null,
    color: '#4196FC',
    mobile: true,
  },
  WALLET_LINK: {
    connector: walletlink,
    name: 'CoinbaseWallet',
    icon: WalletLinkIcon,
    description: 'Use Coinbase Wallet app on mobile device',
    href: null,
    color: '#315CF5',
    mobile: true,
  },
}

export const NetworkContextName = 'NETWORK'

// default allowed slippage, in bips
export const INITIAL_ALLOWED_SLIPPAGE = 50
// default allowed slippage, in bips
export const INITIAL_STABLESWAP_SLIPPAGE = 100
// 20 minutes, denominated in seconds
export const DEFAULT_DEADLINE_FROM_NOW = 60 * 20

export const SECONDS_IN_DAY = 86400

export const VALIDATTOR_FEE = 0.15

// one basis point
export const ONE_BIPS = new Percent(JSBI.BigInt(1), JSBI.BigInt(10000))
export const BIPS_BASE = JSBI.BigInt(10000)
export const ZERO_PERCENT = new Percent('0', '100')
// used for warning states
export const ALLOWED_PRICE_IMPACT_LOW: Percent = new Percent(JSBI.BigInt(100), BIPS_BASE) // 1%
export const ALLOWED_PRICE_IMPACT_MEDIUM: Percent = new Percent(JSBI.BigInt(300), BIPS_BASE) // 3%
export const ALLOWED_PRICE_IMPACT_HIGH: Percent = new Percent(JSBI.BigInt(500), BIPS_BASE) // 5%
// if the price slippage exceeds this number, force the user to type 'confirm' to execute
export const PRICE_IMPACT_WITHOUT_FEE_CONFIRM_MIN: Percent = new Percent(JSBI.BigInt(1000), BIPS_BASE) // 10%
// for non expert mode disable swaps above this
export const BLOCKED_PRICE_IMPACT_NON_EXPERT: Percent = new Percent(JSBI.BigInt(1500), BIPS_BASE) // 15%

export const DEFAULT_MAX_SLIPPAGE = 50

// used to ensure the user doesn't send so much ETH so they end up with <.01
export const MIN_ETH: JSBI = JSBI.exponentiate(JSBI.BigInt(10), JSBI.BigInt(16)) // .01 ETH
export const BETTER_TRADE_LINK_THRESHOLD = new Percent(JSBI.BigInt(75), JSBI.BigInt(10000))

export const UNSUPPORTED_BRIDGE_TOKENS = ['WFUSE']

export const GAS_PRICE = '20000000000'

export const VEVOLT_MAX_LOCK_MONTHS = 24

export const VEVOLT_MAX_LOCK_TIMESTAMP = 2 * 365 * 86400

export const WEEK_IN_SECONDS = 604800

export const WEEKS_IN_MONTH = 4.348

// stableswap configurations

export interface StableSwapPool {
  name: string
  address: string
  lpToken: Token
  tokenList: Token[]
}

export type StableSwapPoolsMap = { [address: string]: StableSwapPool }

export const VUSD1 = new Token(
  ChainId.FUSE,
  '0xa3c1046290B490e629E11AcE35863CB0CAe382aB',
  18,
  'vUSD1',
  'vUSD1 LP Token'
)

export const VUSD2 = new Token(
  ChainId.FUSE,
  '0xC71CAb88c1674A39A3e2841274E54e34D709Af91',
  18,
  'vUSD2',
  'vUSD2 LP Token'
)

export const BUSD_USDC_USDT_POOL = '0x2a68D7C6Ea986fA06B2665d08b4D08F5e7aF960c'

export const STABLESWAP_POOLS: StableSwapPoolsMap = {
  [BUSD_USDC_USDT_POOL]: {
    name: 'vUSD1',
    address: BUSD_USDC_USDT_POOL,
    lpToken: VUSD1,
    tokenList: [FUSE_BUSD, FUSE_USDC, FUSE_USDT],
  },
  '0x83D158Beadbb3445AC901cFd0ca33FB30CCC8f53': {
    name: 'vUSD2',
    address: '0x83D158Beadbb3445AC901cFd0ca33FB30CCC8f53',
    lpToken: VUSD2,
    tokenList: [FUSD_DEPRECATED, FUSE_USDT, FUSE_UST],
  },
}

export const EXPIRED_STABLESWAP_POOLS = ['0x83D158Beadbb3445AC901cFd0ca33FB30CCC8f53']

export const USDT_ADDRESS = '0x3401642F9c24dc55795940ea7E7929A129f4Ec77'

export const USDC_ADDRESS = '0xB268a4c2EE1B91b360B0533100E4bE4B155fA3F3'

export const BUSD_ADDRESS = '0xf5b2F800435967dA079E89Aad44bccF4F841cf1B'

export const MOCK_USDT = new Token(ChainId.FUSE, USDT_ADDRESS, 18, 'USDT', 'Tether USD')

export const MOCK_USDC = new Token(ChainId.FUSE, USDC_ADDRESS, 18, 'USDT', 'Tether USD')

export const MOCK_BUSD = new Token(ChainId.FUSE, BUSD_ADDRESS, 18, 'USDT', 'Tether USD')

export const VAULT_ADDRESS = '0x9bA49Aba193EdEe39276BC38c719577B061fB3d4'

export const MASSET_ADDRESS = '0x6b3898BE8A6aC84dBfbbb6f441B5cB474cA7dCF4'

export const TOKENS: {
  [key: string]: {
    symbol: string
    decimals: number
  }
} = {
  [USDT_ADDRESS]: {
    symbol: 'USDT',
    decimals: 6,
  },
  [BUSD_ADDRESS]: {
    symbol: 'BUSD',
    decimals: 18,
  },
  [USDC_ADDRESS]: {
    symbol: 'USDC',
    decimals: 6,
  },
}

export const PRIMARY_MENU = [
  { to: '/swap', name: 'Swap', additional: ['/fusd/MultiMint', '/fusd/MultiRedeem', '/stableswap'] },
  { to: '/stake', additional: ['sfuse', 'xVolt'], name: 'Stake' },
  { to: '/farms', name: 'Farms' },
  { to: '/pool', additional: ['pool', 'add', 'remove', 'zap'], name: 'Pool' },
  { to: '/bridge', name: 'Bridge' },
  { to: '/mobile', name: 'Volt App' },
  { to: '/launch', additional: ['sfuse', 'xVolt'], name: 'Launchpad' },
  { to: '/analytics', name: 'Analytics' },
]

export const MENU = [
  {
    name: 'Swap',
    to: '/swap',
    additional: ['/fusd/MultiMint', '/fusd/MultiRedeem', '/stableswap'],
  },
  {
    name: 'Earn',
    Icon: ChevronDown,
    sub: [
      { to: '/stake', additional: ['sfuse', 'xVolt'], name: 'Stake' },
      { to: '/farms', name: 'Farms' },
      { to: '/pool', additional: ['pool', 'add', 'remove', 'zap', 'mint'], name: 'Pools' },
    ],
  },
  {
    to: '/bridge',
    name: 'Bridge',
  },
  {
    name: 'More',
    Icon: ChevronDown,
    sub: [
      { to: '/mobile', name: 'Volt App' },
      { to: '/launch', name: 'Launchpad' },
      { to: '/analytics', name: 'Analytics' },
      { to: 'https://forum.voltage.finance/', name: 'Discussion' },
      { to: 'https://snapshot.org/#/voltagefinance.eth', name: 'Voting' },
      { to: 'https://info.voltage.finance/', name: 'Analytics V2' },
      { to: 'https://docs.voltage.finance/voltage/welcome/introduction', name: 'Docs' },
      { to: 'https://app-v2.voltage.finance/', name: 'Old Version (V2)' },
    ],
  },
]

export const SECONDARY_MENU = [
  { to: 'https://forum.voltage.finance/', name: 'Discussion' },
  { to: 'https://snapshot.org/#/voltagefinance.eth', name: 'Voting' },
  { to: 'https://info.voltage.finance/', name: 'Analytics' },
  { to: 'https://docs.voltage.finance/voltage/welcome/introduction', name: 'Docs' },
  { to: 'https://app-v2.voltage.finance/', name: 'Old Version (V2)' },
]

export const BIG_INT_ZERO = JSBI.BigInt(0)

export const SUBGRAPH_WHITELIST = [
  wFUSE.address.toLowerCase(), // WFUSE
  FUSE_USDC.address.toLowerCase(), // USDC V1
  USDC_V2.address.toLowerCase(), // USDC V2
  FUSE_USDT.address.toLowerCase(), // USDT V1
  FUSE_USDT_V2.address.toLowerCase(), // USDT V2
  FUSE_WBTC.address.toLowerCase(), // WBTC
  FUSE_WETH.address.toLowerCase(), // WETH V1
  FUSE_BUSD.address.toLowerCase(), // BUSD V1
  WETH_V2.address.toLowerCase(), // WETH V2
  FUSD_V3.address.toLowerCase(), // FUSD V3
  VOLT.address.toLowerCase(), // VOLT
  '0x4447863cddabbf2c3dac826f042e03c91927a196', // USDM
  '0x861bf3d382593ed848972cadfacba9749adce101', // MATIC
  BNB_V2.address.toLowerCase(), // BNB V2
]

export const USDC_FARM_PID = '29'
export const WETH_FARM_PID = '30'
