import JSBI from 'jsbi'
import moment from 'moment'
import Numeral from 'numeral'
import { utils } from 'ethers'
import BigNumberJS from 'bignumber.js'
import { getAddress } from '@ethersproject/address'
import { Contract } from '@ethersproject/contracts'
import { BigNumber } from '@ethersproject/bignumber'
import { isString, isUndefined, isNaN } from 'lodash'
import { AddressZero } from '@ethersproject/constants'
import { SqrtPriceMath, TickMath } from '@voltage-finance/v3-sdk'
import { isIOS, isMacOs, isMobile, isTablet } from 'react-device-detect'
import IVoltageRouterABI from '@voltage-finance/periphery/build/IVoltageRouter.json'
import { JsonRpcSigner, Web3Provider, JsonRpcProvider } from '@ethersproject/providers'
import { ChainId, Percent, Token, CurrencyAmount, Currency, Price } from '@voltage-finance/sdk-core'

import { BNB, FUSE } from '../data/Currency'
import { Bound } from '../state/mint/v3/actions'
import { ERC20_ABI } from '../constants/abis/erc20'
import Erc677TokenABI from '../constants/abis/erc677.json'
import { BridgeTransaction } from '../state/bridge/reducer'
import { DOWNLOAD_LINKS } from '../wrappers/DownloadButton'
import ForeignAmbABI from '../constants/abis/foreignAmb.json'
import { APP_MODE, APP_MODE_TYPES } from '../constants/config'
import { ethFuseNativeSubgraphClient } from '../graphql/client'
import { HOME_TO_FOREIGN_FEE_TYPE_HASH } from '../constants/bridge'
import NativeToErcBridge from '../state/bridge/bridges/nativeToErc'
import { BridgeDirection, BridgeType } from '../state/bridge/actions'
import Erc20ToErc677Bridge from '../state/bridge/bridges/erc20Toerc677'
import { TokenAddressMap, WrappedTokenInfo } from '../state/lists/hooks'
import AMBErc677To677ABI from '../constants/abis/ambErc677ToErc677.json'
import BscNativeToErcBridge from '../state/bridge/bridges/bscNativeToErc'
import Erc677ToErc677Bridge from '../state/bridge/bridges/erc677Toerc677'
import { formatUnits, Interface, id, formatEther } from 'ethers/lib/utils'
import { getChainNetworkLibrary, getNetworkLibrary } from '../connectors'
import { getForeignAmbSubgraph, getHomeAmbSubgraph } from '../graphql/utils'
import BscErc20ToErc677Bridge from '../state/bridge/bridges/bscErc20ToErc677'
import HomeBridgeNativeToErc from '../constants/abis/homeBridgeNativeToErc.json'
import HomeAMBNativeToErc20ABI from '../constants/abis/homeAMBNativeToErc20.json'
import BscBnbNativeToErc20Bridge from '../state/bridge/bridges/bscBnbNativeToErc20'
import BRIDGED_TOKENS_MIGRATOR_ABI from '../constants/abis/bridgedTokenMigrator.json'
import ForeignAMBNativeToErc20ABI from '../constants/abis/foreignAMBNativeToErc20.json'
import ForeignBriddgeNativeToErc from '../constants/abis/foreignBridgeNativeToErc.json'
import FeeManagerAMBNativetoErc20 from '../constants/abis/feeManagerAMBNativeToErc20.json'
import HomeMultiAMBErc20ToErc677ABI from '../constants/abis/homeMultiAMBErc20ToErc677.json'
import ForeignMultiAMBErc20ToErc677ABI from '../constants/abis/foreignMultiAMBErc20ToErc677.json'
import { getMessageFromTxHash, getNativeStatusFromTxHash, getStatusFromTxHash } from '../graphql/queries'
import {
  ROUTER_ADDRESS,
  BINANCE_ERC20_TO_ERC677_FOREIGN_BRIDGE_ADDRESS,
  FUSE_ERC20_TO_ERC677_BRIDGE_FOREIGN_ADDRESS,
  FUSE_FOREIGN_TOKEN_ADDRESS,
  GOODDOLLAR_HOME_TOKEN_ADDRESS,
  GOODDOLLAR_FOREIGN_TOKEN_ADDRESS,
  FUSE_NATIVE_TO_ERC677_BRIDGE_FOREIGN_ADDRESS,
  FUSE_ERC677_TO_ERC677_BRIDGE_FOREIGN_ADDRESS,
  TOKEN_MIGRATOR_ADDRESS,
  BINANCE_TESTNET_CHAINID,
  BINANCE_MAINNET_CHAINID,
  BSC_FUSE_TOKEN_ADDRESS,
  BSC_NATIVE_TO_ERC677_BRIDGE_FOREIGN_ADDRESS,
  BSC_NATIVE_TO_ERC677_BRIDGE_HOME_ADDRESS,
  BINANCE_CHAIN_ID,
  BNB_FOREIGN_TOKEN_ADDRESS,
  BSC_BNB_NATIVE_TO_ERC20_BRIDGE_HOME_ADDRESS,
  BSC_BNB_NATIVE_TO_ERC20_BRIDGE_FOREIGN_ADDRESS,
  FUSE_BLOCK_PER_YEAR,
  ETH_FUSE_FOREIGN_AMB,
  WEEK_IN_SECONDS,
} from '../constants'

// returns the checksummed address if the address is valid, otherwise returns false
export function isAddress(value: any): string | false {
  try {
    return getAddress(value)
  } catch {
    return false
  }
}

const ETHERSCAN_PREFIXES: { [chainId: number]: string } = {
  1: '',
  5: 'goerli.',
  122: 'fuse.',
}

export function getExplorerLink(chainId: number, data: string, type: 'transaction' | 'token' | 'address'): string {
  let prefix

  if (chainId === 122) {
    prefix = 'https://explorer.fuse.io'
  } else if (chainId === BINANCE_TESTNET_CHAINID) {
    prefix = 'https://testnet.bscscan.com'
  } else if (chainId === BINANCE_MAINNET_CHAINID) {
    prefix = 'https://bscscan.com'
  } else {
    prefix = `https://${ETHERSCAN_PREFIXES[chainId] || ETHERSCAN_PREFIXES[1]}etherscan.io`
  }

  switch (type) {
    case 'transaction': {
      return `${prefix}/tx/${data}`
    }
    case 'token': {
      return `${prefix}/token/${data}`
    }
    case 'address':
    default: {
      return `${prefix}/address/${data}`
    }
  }
}

export function getExplorerLinkText(chainId: number): string {
  switch (chainId) {
    case ChainId.FUSE:
      return 'View on Fuse Explorer'
    case ChainId.MAINNET:
      return 'View on Etherscan'
    case BINANCE_TESTNET_CHAINID:
      return 'View on BscScan Testnet'
    case BINANCE_MAINNET_CHAINID:
      return 'View on BscScan'
    default:
      return 'View on Etherscan'
  }
}

export function getNativeCurrencySymbol(chainId?: number): string {
  switch (chainId) {
    case ChainId.FUSE:
      return 'FUSE'
    case ChainId.MAINNET:
      return 'ETH'
    case BINANCE_MAINNET_CHAINID:
    case BINANCE_TESTNET_CHAINID:
      return 'BNB'
    default:
      return 'FUSE'
  }
}

// shorten the checksummed version of the input address to have 0x + 4 characters at start and end
export function shortenAddress(address: string, chars = 4): string {
  const parsed = isAddress(address)
  if (!parsed) {
    throw Error(`Invalid 'address' parameter '${address}'.`)
  }
  return `${parsed.substring(0, chars + 2)}...${parsed.substring(42 - chars)}`
}

export function stringEquals(stringA: string, stringB: string): boolean {
  return stringA.toLowerCase() === stringB.toLowerCase()
}

// add 10%
export function calculateGasMargin(value: BigNumber): BigNumber {
  return value.mul(BigNumber.from(10000).add(BigNumber.from(1000))).div(BigNumber.from(10000))
}

// converts a basis points value to a sdk percent
export function basisPointsToPercent(num: number): Percent {
  return new Percent(JSBI.BigInt(num), JSBI.BigInt(10000))
}

export function calculateSlippageAmount(value: CurrencyAmount<Currency>, slippage: number): [JSBI, JSBI] {
  if (slippage < 0 || slippage > 10000) {
    throw Error(`Unexpected slippage value: ${slippage}`)
  }
  return [
    JSBI.divide(JSBI.multiply(value.quotient, JSBI.BigInt(10000 - slippage)), JSBI.BigInt(10000)),
    JSBI.divide(JSBI.multiply(value.quotient, JSBI.BigInt(10000 + slippage)), JSBI.BigInt(10000)),
  ]
}

// account is not optional
export function getSigner(library: Web3Provider, account: string): JsonRpcSigner {
  return library.getSigner(account).connectUnchecked()
}

// account is optional
export function getProviderOrSigner(library: Web3Provider, account?: string): Web3Provider | JsonRpcSigner {
  return account ? getSigner(library, account) : library
}

// account is optional
export function getContract(address: string, ABI: any, library: Web3Provider, account?: string): Contract {
  if (!isAddress(address) || address === AddressZero) {
    throw Error(`Invalid 'address' parameter '${address}'.`)
  }

  return new Contract(address, ABI, getProviderOrSigner(library, account) as any)
}

export function getReadContract(address: string, ABI: any, provider: JsonRpcProvider): Contract {
  if (!isAddress(address) || address === AddressZero) {
    throw Error(`Invalid 'address' parameter '${address}'.`)
  }

  return new Contract(address, ABI, provider)
}

// account is optional
export function getRouterContract(_: number, library: Web3Provider, account?: string): Contract {
  return getContract(ROUTER_ADDRESS, IVoltageRouterABI.abi, library, account)
}

export function escapeRegExp(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') // $& means the whole matched string
}

export function isTokenOnList(defaultTokens: TokenAddressMap, currency?: Currency): boolean {
  if (currency.isNative) return true
  return Boolean(currency instanceof Token && defaultTokens[currency.chainId]?.[currency.address])
}

export function getERC677TokenContract(address: string, library: Web3Provider, account?: string): Contract {
  return getContract(address, Erc677TokenABI, library, account)
}

export function getAMBErc677To677Contract(address: string, library: Web3Provider, account?: string): Contract {
  return getContract(address, AMBErc677To677ABI, library, account)
}

export function getHomeMultiAMBErc20ToErc677Contract(
  address: string,
  library: Web3Provider,
  account?: string
): Contract {
  return getContract(address, HomeMultiAMBErc20ToErc677ABI, library, account)
}

export function getForeignMultiAMBErc20ToErc677Contract(
  address: string,
  library: Web3Provider,
  account?: string
): Contract {
  return getContract(address, ForeignMultiAMBErc20ToErc677ABI, library, account)
}

export function getHomeBridgeNativeToErcContract(address: string, library: Web3Provider, account?: string): Contract {
  return getContract(address, HomeBridgeNativeToErc, library, account)
}

export function getFeeManagerAMBNativeToErc20Contract(
  address: string,
  library: Web3Provider,
  account?: string
): Contract {
  return getContract(address, FeeManagerAMBNativetoErc20, library, account)
}

export function getForeignBridgeNativeToErcContract(
  address: string,
  library: Web3Provider,
  account?: string
): Contract {
  return getContract(address, ForeignBriddgeNativeToErc, library, account)
}

export function getHomeAMBNativeToErc20Contract(address: string, library: Web3Provider, account?: string): Contract {
  return getContract(address, HomeAMBNativeToErc20ABI, library, account)
}

export function getForeignAMBNativeToErc20Contract(address: string, library: Web3Provider, account?: string): Contract {
  return getContract(address, ForeignAMBNativeToErc20ABI, library, account)
}

export function getForeignAmbContract(address: string, library: Web3Provider, account?: string) {
  return getContract(address, ForeignAmbABI, library, account)
}

export function getCurrencySymbol(currency: Currency | null | undefined, chainId: number | undefined) {
  return currency?.symbol
}

export const tryFormatAmount = (amount?: string, deciamls?: number) => {
  if (!amount || !deciamls) return undefined

  try {
    const parsedAmount = formatUnits(amount, deciamls)
    if (parsedAmount !== '0') return parsedAmount
  } catch (error) {
    console.debug(`Failed to format input amount: "${amount}"`, error)
  }

  return undefined
}

export const tryFormatDecimalAmount = (amount?: string, tokenDecimals = 18, decimals = 0): string | undefined => {
  if (!amount || !tokenDecimals) return undefined

  try {
    return new BigNumberJS(amount)
      .div(10 ** tokenDecimals)
      .toNumber()
      .toFixed(decimals)
  } catch (error) {
    console.debug(`Failed to format decimal amount: "${amount}"`, error)
  }

  return undefined
}

export const tryFormatPercentageAmount = (value?: number, decimals = 0): string | undefined => {
  if (!value || value === Infinity) return undefined
  return (value * 100).toFixed(decimals)
}

export async function pollEvent(
  event: string,
  address: string,
  abi: any,
  library: Web3Provider,
  fn: (...args: any) => Promise<boolean>
) {
  return new Promise(async (resolve) => {
    const fromBlock = await library.getBlockNumber()
    const toBlock = 'latest'
    const contractInterface = new Interface(abi)

    const interval = setInterval(async () => {
      const logs = await library.getLogs({ address, fromBlock, toBlock, topics: [id(event)] })

      for (const log of logs) {
        const { args } = contractInterface.parseLog(log)

        if (await fn(args)) {
          clearInterval(interval)
          resolve(args)
        }
      }
    }, 5000)
  })
}

export function isProduction(): boolean {
  return APP_MODE === APP_MODE_TYPES.production
}

export function isFuse(tokenAddress: string) {
  return (
    tokenAddress === FUSE.symbol ||
    stringEquals(tokenAddress, FUSE_FOREIGN_TOKEN_ADDRESS) ||
    stringEquals(tokenAddress, BSC_FUSE_TOKEN_ADDRESS)
  )
}

export function isBnb(tokenAddress: string) {
  return tokenAddress === BNB.symbol || stringEquals(tokenAddress, BNB_FOREIGN_TOKEN_ADDRESS)
}

export function isGoodDollar(tokenAddress: string) {
  return (
    stringEquals(tokenAddress, GOODDOLLAR_HOME_TOKEN_ADDRESS) ||
    stringEquals(tokenAddress, GOODDOLLAR_FOREIGN_TOKEN_ADDRESS)
  )
}

export function getEthFuseBridge(tokenAddress: string) {
  if (isFuse(tokenAddress)) {
    return NativeToErcBridge
  } else if (isGoodDollar(tokenAddress)) {
    return Erc677ToErc677Bridge
  } else {
    return Erc20ToErc677Bridge
  }
}

export function getBnbFuseBridge(tokenAddress: string) {
  if (isFuse(tokenAddress)) {
    return BscNativeToErcBridge
  } else if (isBnb(tokenAddress)) {
    return BscBnbNativeToErc20Bridge
  } else {
    return BscErc20ToErc677Bridge
  }
}

export function isEthFuseDirection(bridgeDirection: BridgeDirection) {
  return bridgeDirection === BridgeDirection.ETH_TO_FUSE || bridgeDirection === BridgeDirection.FUSE_TO_ETH
}

export function isBnbFuseDirection(bridgeDirection: BridgeDirection) {
  return bridgeDirection === BridgeDirection.BSC_TO_FUSE || bridgeDirection === BridgeDirection.FUSE_TO_BSC
}

export function getBridge(tokenAddress: string, bridgeDirection: BridgeDirection) {
  if (isEthFuseDirection(bridgeDirection)) {
    return getEthFuseBridge(tokenAddress)
  } else if (isBnbFuseDirection(bridgeDirection)) {
    return getBnbFuseBridge(tokenAddress)
  }
  return undefined
}

export function getEthFuseBridgeType(tokenAddress: string) {
  if (isFuse(tokenAddress)) {
    return BridgeType.ETH_FUSE_NATIVE
  } else if (isGoodDollar(tokenAddress)) {
    return BridgeType.ETH_FUSE_ERC677_TO_ERC677
  } else {
    return BridgeType.ETH_FUSE_ERC20_TO_ERC677
  }
}

export function getBnbFuseBridgeType(tokenAddress: string) {
  if (isFuse(tokenAddress)) {
    return BridgeType.BSC_FUSE_NATIVE
  } else if (isBnb(tokenAddress)) {
    return BridgeType.BSC_FUSE_BNB_NATIVE
  } else {
    return BridgeType.BSC_FUSE_ERC20_TO_ERC677
  }
}

export function getBridgeType(tokenAddress: string, bridgeDirection: BridgeDirection) {
  if (isEthFuseDirection(bridgeDirection)) {
    return getEthFuseBridgeType(tokenAddress)
  } else if (isBnbFuseDirection(bridgeDirection)) {
    return getBnbFuseBridgeType(tokenAddress)
  }
  return undefined
}

export function getEthToFuseApprovalAddress(tokenAddress: string) {
  const bridgeType = getEthFuseBridgeType(tokenAddress)

  switch (bridgeType) {
    case BridgeType.ETH_FUSE_NATIVE:
      return FUSE_NATIVE_TO_ERC677_BRIDGE_FOREIGN_ADDRESS
    case BridgeType.ETH_FUSE_ERC20_TO_ERC677:
      return FUSE_ERC20_TO_ERC677_BRIDGE_FOREIGN_ADDRESS
    case BridgeType.ETH_FUSE_ERC677_TO_ERC677:
      return FUSE_ERC677_TO_ERC677_BRIDGE_FOREIGN_ADDRESS
  }
}

export function getApprovalAddress(tokenAddress?: string, bridgeDirection?: BridgeDirection) {
  if (!tokenAddress || !bridgeDirection) return

  switch (bridgeDirection) {
    case BridgeDirection.ETH_TO_FUSE:
      return getEthToFuseApprovalAddress(tokenAddress)
    case BridgeDirection.FUSE_TO_ETH:
    case BridgeDirection.FUSE_TO_BSC:
      return tokenAddress
    case BridgeDirection.BSC_TO_FUSE:
      return BINANCE_ERC20_TO_ERC677_FOREIGN_BRIDGE_ADDRESS
  }
}

export function getChainIds(bridgeDirection: BridgeDirection): { foreignChain: number; homeChain: number } | null {
  switch (bridgeDirection) {
    case BridgeDirection.FUSE_TO_ETH:
      return {
        foreignChain: ChainId.MAINNET,
        homeChain: ChainId.FUSE,
      }
    default:
      return null
  }
}

export function getForeignAmbAddress(bridgeDirection: BridgeDirection) {
  switch (bridgeDirection) {
    case BridgeDirection.FUSE_TO_ETH:
      return ETH_FUSE_FOREIGN_AMB
    default:
      return null
  }
}

export function safeShortenAddress(address = '') {
  return `${address.slice(0, 3)}...${address.slice(-4)}`
}
export function getTokenMigrationContract(library: Web3Provider, account: string) {
  return getContract(TOKEN_MIGRATOR_ADDRESS, BRIDGED_TOKENS_MIGRATOR_ABI, library, account)
}

export function getTokenContract(address: string, library: Web3Provider, account: string) {
  return getContract(address, ERC20_ABI, library, account)
}

export function isArrayEmpty(arr: Array<any>) {
  return arr.filter(Boolean).length ? false : true
}

export async function addTokenToWallet(token: Token, library: Web3Provider) {
  if (library.provider && library.provider.request) {
    try {
      await library.provider.request({
        method: 'wallet_watchAsset',
        params: {
          //eslint-disable-next-line @typescript-eslint/ban-ts-comment
          //@ts-ignore // need this for incorrect ethers provider type
          type: 'ERC20',
          options: {
            address: token.address,
            symbol: token.symbol,
            decimals: token.decimals,
            ...(token instanceof WrappedTokenInfo ? { image: token.logoURI } : {}),
          },
        },
      })
    } catch (e) {
      console.log(e)
    }
  }
}

export function isTokenOnTokenList(tokenList: any, currency: Currency | undefined) {
  if (currency === FUSE) return true

  const token = currency as Token
  return Boolean(tokenList[token?.address])
}

export async function getAMBNativeToErc20FeeManagerAddress(isHome: boolean, library: Web3Provider, account: string) {
  let contract
  if (isHome) {
    contract = getForeignAMBNativeToErc20Contract(BSC_NATIVE_TO_ERC677_BRIDGE_FOREIGN_ADDRESS, library, account)
  } else {
    contract = getHomeAMBNativeToErc20Contract(BSC_NATIVE_TO_ERC677_BRIDGE_HOME_ADDRESS, library, account)
  }

  const address = await contract.feeManagerContract()
  return address
}

export async function getBnbNativeAMBToErc20FeeManagerAddress(isHome: boolean, library: Web3Provider, account: string) {
  let contract
  if (isHome) {
    contract = getHomeAMBNativeToErc20Contract(BSC_BNB_NATIVE_TO_ERC20_BRIDGE_HOME_ADDRESS, library, account)
  } else {
    contract = getForeignAMBNativeToErc20Contract(BSC_BNB_NATIVE_TO_ERC20_BRIDGE_FOREIGN_ADDRESS, library, account)
  }

  const address = await contract.feeManagerContract()
  return address
}

export async function getNativeAMBBridgeFee(isHome: boolean, library: Web3Provider, account: string) {
  const address = await getAMBNativeToErc20FeeManagerAddress(isHome, library, account)
  if (address === AddressZero) return '0'

  const contract = getFeeManagerAMBNativeToErc20Contract(address, library, account)
  const fee = await contract.fee()
  return formatEther(fee)
}

export async function getBnbNativeAMBBridgeFee(isHome: boolean, library: Web3Provider, account: string) {
  const address = await getBnbNativeAMBToErc20FeeManagerAddress(isHome, library, account)
  if (address === AddressZero) return '0'

  const contract = getFeeManagerAMBNativeToErc20Contract(address, library, account)
  const fee = await contract.fee()
  return formatEther(fee)
}

export async function getMultiBridgeFee(
  tokenAddress: string,
  bridgeAddress: string,
  library: Web3Provider,
  account: string
) {
  const contract = getHomeMultiAMBErc20ToErc677Contract(bridgeAddress, library, account)
  const fee = await contract.getFee(HOME_TO_FOREIGN_FEE_TYPE_HASH, tokenAddress)
  return formatEther(fee)
}

export async function calculateMultiBridgeFee(
  amount: CurrencyAmount<Token>,
  bridgeAddress: string,
  library: Web3Provider,
  account: string
) {
  if (!amount) return

  const contract = getHomeMultiAMBErc20ToErc677Contract(bridgeAddress, library, account)
  const fee = await contract.calculateFee(
    HOME_TO_FOREIGN_FEE_TYPE_HASH,
    amount.currency.address,
    amount.quotient.toString()
  )
  return formatUnits(fee, amount.currency.decimals)
}

export async function calculateNativeAMBBridgeFee(
  amount: CurrencyAmount<Currency>,
  isHome: boolean,
  library: Web3Provider,
  account: string
) {
  const address = await getAMBNativeToErc20FeeManagerAddress(isHome, library, account)
  if (address === AddressZero) return '0'

  const contract = getFeeManagerAMBNativeToErc20Contract(address, library, account)
  const fee = await contract.calculateFee(amount.quotient.toString())
  return formatEther(fee)
}

export function getBscFuseInverseLibrary(isHome: boolean) {
  return isHome ? getChainNetworkLibrary(BINANCE_CHAIN_ID) : getNetworkLibrary()
}

export async function calculateBnbNativeAMBBridgeFee(
  amount: CurrencyAmount<Currency>,
  isHome: boolean,
  library: Web3Provider,
  account: string
) {
  const address = await getBnbNativeAMBToErc20FeeManagerAddress(isHome, library, account)
  if (address === AddressZero) return '0'

  const contract = getFeeManagerAMBNativeToErc20Contract(address, library, account)
  const fee = await contract.calculateFee(amount.quotient.toString())
  return formatEther(fee)
}

export function supportRecipientTransfer(currencyId?: string, bridgeDirection?: BridgeDirection): boolean {
  if (!currencyId || !bridgeDirection) return false
  const bridgeType = getBridgeType(currencyId, bridgeDirection)
  return (
    bridgeType === BridgeType.ETH_FUSE_ERC20_TO_ERC677 ||
    bridgeType === BridgeType.BSC_FUSE_BNB_NATIVE ||
    bridgeType === BridgeType.BSC_FUSE_NATIVE ||
    bridgeType === BridgeType.BSC_FUSE_ERC20_TO_ERC677
  )
}

export const uppercaseText = (str: string) => str.replace(/[a-z]/g, (token) => token.toUpperCase())

export function calculateBaseApy(ratePerBlock: any) {
  const blocksPerDay = 86400
  const daysPerYear = 365
  return (ratePerBlock / 1e18) * blocksPerDay * daysPerYear * 100
}

export function calculateDistributionApy(incentiveSpeed: any, borrowBalance: any, fusePriceUSD: any) {
  return (((incentiveSpeed / 1e18) * FUSE_BLOCK_PER_YEAR * fusePriceUSD) / borrowBalance) * 100
}

export function isObjectEmpty(obj: Record<string, never>) {
  return Object.keys(obj).length === 0
}

function strip0x(input: string) {
  return input.replace(/^0x/, '')
}

function signatureToVRS(rawSignature: string) {
  const signature = strip0x(rawSignature)
  const v = signature.substr(64 * 2)
  const r = signature.substr(0, 32 * 2)
  const s = signature.substr(32 * 2, 32 * 2)
  return { v, r, s }
}

function nativeSignatureToVRS(signature: string) {
  signature = strip0x(signature)
  const v = parseInt(signature.substr(64 * 2), 16)
  const r = `0x${signature.substr(0, 32 * 2)}`
  const s = `0x${signature.substr(32 * 2, 32 * 2)}`
  return { v, r, s }
}

export function getNativeTransactionSignatures(signatures: Array<string>) {
  const [v, r, s]: any = [[], [], []]

  for (const signature of signatures) {
    const sig = nativeSignatureToVRS(signature)
    v.push(sig.v)
    r.push(sig.r)
    s.push(sig.s)
  }

  return [v, r, s]
}

export function packSignatures(signatures: Array<string>) {
  const vrsSignatures = signatures.map((s) => signatureToVRS(s))
  const length = strip0x(utils.hexValue(vrsSignatures.length))
  const msgLength = length.length === 1 ? `0${length}` : length

  let v = ''
  let r = ''
  let s = ''
  vrsSignatures.forEach((e) => {
    v = v.concat(e.v)
    r = r.concat(e.r)
    s = s.concat(e.s)
  })

  return `0x${msgLength}${v}${r}${s}`
}

export async function getAmbBridgeTransactionStatus({ homeTxHash, bridgeDirection }: BridgeTransaction) {
  const message = await getMessageFromTxHash(homeTxHash, getHomeAmbSubgraph(bridgeDirection))
  if (message) {
    const executionStatus = await getStatusFromTxHash(message.msgId, getForeignAmbSubgraph(bridgeDirection))
    return executionStatus ? executionStatus : null
  }
  return null
}

export async function getNativeBridgeTransactionStatus({ homeTxHash }: BridgeTransaction) {
  if (!homeTxHash) return

  const status = await getNativeStatusFromTxHash(homeTxHash, ethFuseNativeSubgraphClient)
  return status ? status : null
}

export async function getUnclaimedAmbTransaction(
  bridgeTransactions: Array<BridgeTransaction>
): Promise<BridgeTransaction | null> {
  const unclaimedTransactions = bridgeTransactions.filter(
    (bridgeTransaction) =>
      !bridgeTransaction.foreignTxHash &&
      (bridgeTransaction.bridgeType === BridgeType.ETH_FUSE_ERC20_TO_ERC677 ||
        bridgeTransaction.bridgeType === BridgeType.ETH_FUSE_ERC677_TO_ERC677)
  )
  return unclaimedTransactions.length > 0 ? unclaimedTransactions[0] : null
}

export async function getUnclaimedNativeTransaction(
  bridgeTransactions: Array<BridgeTransaction>
): Promise<BridgeTransaction | null> {
  const unclaimedTransactions = bridgeTransactions.filter(
    (bridgeTransaction) =>
      !bridgeTransaction.foreignTxHash && bridgeTransaction.bridgeType === BridgeType.ETH_FUSE_NATIVE
  )
  return unclaimedTransactions.length > 0 ? unclaimedTransactions[0] : null
}

export async function isContract(library: Web3Provider, address: string): Promise<boolean> {
  const code = await library.getCode(address)
  return code === '0x' ? false : true
}

export function numberFormat(item: number | string, decimals?: number, usdFormat?: boolean) {
  const format = usdFormat
    ? {
        currency: `USD`,
        style: 'currency',
      }
    : {}

  return new Intl.NumberFormat(`en-US`, { ...format, maximumFractionDigits: decimals ? 2 : decimals }).format(
    Number(item)
  )
}

export function isSwapPair(
  inputCurrency: Currency | undefined,
  outputCurrency: Currency | undefined,
  currencyA: Currency | undefined,
  currencyB: Currency | undefined
): boolean {
  if (!inputCurrency || !outputCurrency || !currencyA || !currencyB) return false
  return (
    (inputCurrency.equals(currencyA) && outputCurrency.equals(currencyB)) ||
    (inputCurrency.equals(currencyB) && outputCurrency.equals(currencyA))
  )
}

export const formatSignificant = ({
  value,
  prefix = '',
  suffix = '',
  maxLength = 5,
}: {
  value: number | string
  prefix?: string
  suffix?: string
  maxLength?: number
}) => {
  const amount = isString(value) ? parseFloat(value) : value
  const bigNumber = new BigNumberJS(amount)

  const million = new BigNumberJS(1e6)
  const billion = new BigNumberJS(1e9)
  const trillion = new BigNumberJS(1e12)

  BigNumberJS.config({
    FORMAT: {
      // string to prepend
      // decimal separator
      prefix,
      suffix,
      decimalSeparator: '.',
      // grouping separator of the integer part
      groupSeparator: ',',
      // // primary grouping size of the integer part
      groupSize: 3,
    },
  })
  if (amount === 0 || !amount || isNaN(amount) || isUndefined(amount)) return new BigNumberJS(0).toFormat(2)

  //if number is less then zero
  if (bigNumber.e < 0) {
    const decimals = Math.abs(bigNumber.e)

    if (decimals > maxLength) {
      const decimalDifference = decimals - maxLength
      const [pre, suf] = bigNumber.shiftedBy(decimalDifference).toFormat().split('.')
      const subscriptNumber = convertToSubscript(decimalDifference)
      return pre + '.' + suf.substring(0, 1) + subscriptNumber + suf.substring(1, maxLength)
    } else {
      return bigNumber.toFormat(maxLength - 1)
    }
  }

  if (bigNumber.gte(trillion)) {
    return bigNumber.dividedBy(trillion).toFormat(2) + 'T'
  } else if (bigNumber.gte(billion)) {
    return bigNumber.dividedBy(billion).toFormat(2) + 'B'
  } else if (bigNumber.gte(million)) {
    return bigNumber.dividedBy(million).toFormat(2) + 'M'
  } else {
    return bigNumber.toFormat(2)
  }
}

export const getFormattedPositionPrice = (usdPrice: number, tokenAmount: number) => {
  if (usdPrice === 0) {
    return formatSignificant({
      value: usdPrice,
    })
  }
  if (usdPrice < 0.01) {
    return '<0.01'
  }
  return `${formatSignificant({
    prefix: '$',
    value: usdPrice,
  })}/${formatSignificant({
    value: tokenAmount,
  })}`
}

export const includesPath = (location: any, paths: string[]) => {
  for (const path of paths) {
    if (location.pathname.includes(path)) {
      return true
    }
  }
  return false
}
export const capitalizeFirstLetter = (string) => {
  return string.charAt(0).toUpperCase() + string.slice(1)
}

export const addMonthsAndConvertSecond = (numMonths) => {
  const futureDate = moment().add(numMonths, 'months')
  return roundSecondsFromWeeks(futureDate.unix())
}

export const roundSecondsFromWeeks = (seconds) => {
  return Math.floor(seconds / WEEK_IN_SECONDS) * WEEK_IN_SECONDS
}

export const addMonthsAndFormat = (numMonths) => {
  const currentDate = moment()
  const futureDate = moment(currentDate).add(numMonths, 'months').unix()
  return formatFromSeconds(roundSecondsFromWeeks(futureDate))
}

export const formatFromSeconds = (seconds: string | number) => {
  const date = moment(isString(seconds) ? parseFloat(seconds) * 1000 : seconds * 1000)
  return date.format('MMMM DD, YYYY')
}

export const getDownloadLink = () => {
  if (isMobile || isTablet) {
    if (isIOS) {
      return DOWNLOAD_LINKS.apple.mobileUrl
    } else {
      return DOWNLOAD_LINKS.google.mobileUrl
    }
  } else {
    if (isMacOs) {
      return DOWNLOAD_LINKS.apple.desktopUrl
    } else {
      return DOWNLOAD_LINKS.google.desktopUrl
    }
  }
}

export const getAppleDownloadLink = () => {
  if (isMobile || isTablet) {
    return DOWNLOAD_LINKS.apple.mobileUrl
  } else {
    return DOWNLOAD_LINKS.apple.desktopUrl
  }
}

export const getGoogleDownloadLink = () => {
  if (isMobile || isTablet) {
    return DOWNLOAD_LINKS.google.mobileUrl
  } else {
    return DOWNLOAD_LINKS.google.desktopUrl
  }
}

export function formatTickPrice(
  price: Price<Token, Token> | undefined,
  atLimit: { [bound in Bound]?: boolean | undefined },
  direction: Bound,
  placeholder?: string
) {
  if (!price) return '0'
  if (atLimit[direction]) {
    return direction === Bound.LOWER ? '0' : '∞'
  }

  if (!price && placeholder !== undefined) {
    return placeholder
  }

  if (price?.greaterThan(1e15)) {
    return '∞'
  }

  return price?.toSignificant(4)
}

export function formatFeeAmount(fee: string) {
  return new Percent(fee, '1000000').toSignificant()
}

export const useInverter = ({
  priceLower,
  priceUpper,
  quote,
  base,
  invert,
}: {
  priceLower?: Price<Token, Token>
  priceUpper?: Price<Token, Token>
  quote?: Token
  base?: Token
  invert?: boolean
}): {
  priceLower?: Price<Token, Token>
  priceUpper?: Price<Token, Token>
  quote?: Token
  base?: Token
} => {
  return {
    priceUpper: invert ? priceLower?.invert() : priceUpper,
    priceLower: invert ? priceUpper?.invert() : priceLower,
    quote: invert ? base : quote,
    base: invert ? quote : base,
  }
}

export const formatNumber = (num) => {
  return num.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,')
}

// using a currency library here in case we want to add more in future
export const formatDollarAmount = (num, digits) => {
  const formatter = new Intl.NumberFormat([], {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  })
  return formatter.format(num)
}

export const toK = (num) => {
  return Numeral(num).format('0.[00]a')
}

export const formattedNum = (number, usd = false, precision = undefined) => {
  if (isNaN(number) || number === '' || number === undefined) {
    return usd ? '$0' : 0
  }

  let num = parseFloat(number)

  if (num === 0) {
    return usd ? '$0' : 0
  }

  // Define the minimum number based on precision
  const minPositiveValue = 1 / Math.pow(10, precision || (usd ? 2 : 5))

  if (num > 0 && num < minPositiveValue) {
    const displayValue = `< ${minPositiveValue.toFixed(precision || (usd ? 2 : 5))}`
    return usd ? `< $${displayValue.slice(2)}` : displayValue
  }

  if (num > 500000000) {
    return (usd ? '$' : '') + toK(num.toFixed(0))
  }

  if (num > 1000) {
    return usd
      ? formatDollarAmount(num, precision || 0)
      : new Intl.NumberFormat('en-US', {
          style: 'decimal',
          minimumFractionDigits: 2,
        }).format(number)
  }

  if (usd) {
    let dollarPrecision = 2
    if (num < 0.1) {
      dollarPrecision = 6
    }
    if (typeof precision === 'number') {
      dollarPrecision = precision
    }
    return formatDollarAmount(num, dollarPrecision)
  }

  const generalPrecision = typeof precision === 'number' ? precision : 5
  num = Number(num.toFixed(generalPrecision))

  return num.toLocaleString('en-US', {
    minimumFractionDigits: generalPrecision,
    maximumFractionDigits: generalPrecision,
  })
}

export function calculatePercentageChange(oldValue, newValue) {
  if (oldValue === 0) {
    return 0
  }
  const difference = newValue - oldValue
  const percentageChange = (difference / oldValue) * 100
  return percentageChange ?? 0
}

export const isV2 = (id: string) => {
  const V2_IDS = new Set([
    '0x68c9736781e9316ebf5c3d49fe0c1f45d2d104cd', // USDT_V2
    '0x28c3d1cd466ba22f6cae51b1a4692a831696391a', // USDC_V2
    '0x5622f6dc93e08a8b717b149677930c38d5d50682', // ETH_V2
    '0x117c0419352ddb6fe575a67faa70315bdc4a93f3', // BNB_V2
  ])

  return V2_IDS.has(id?.toLowerCase())
}

export const appendV2 = (id, name) => {
  if (isV2(id)) {
    return name + ' V2'
  }
  return name
}

export function formatChartNumber(d) {
  const amount = typeof d === 'string' ? parseFloat(d) : d
  const thousand = 1e3

  const million = 1e6
  const billion = 1e9
  const trillion = 1e12

  if (!amount || isNaN(amount)) {
    return '0'
  }

  if (amount >= trillion) {
    return (amount / trillion).toFixed(1) + 'T'
  } else if (amount >= billion) {
    return (amount / billion).toFixed(1) + 'B'
  } else if (amount >= million) {
    return (amount / million).toFixed(1) + 'M'
  } else if (amount >= thousand) {
    return (amount / thousand).toFixed(0) + 'K'
  } else {
    return amount.toFixed(0)
  }
}

export function getToken0Amount(
  tickCurrent: number,
  tickLower: number,
  tickUpper: number,
  sqrtRatioX96: JSBI,
  liquidity: JSBI
): JSBI {
  if (tickCurrent < tickLower) {
    return SqrtPriceMath.getAmount0Delta(
      TickMath.getSqrtRatioAtTick(tickLower),
      TickMath.getSqrtRatioAtTick(tickUpper),
      liquidity,
      false
    )
  }
  if (tickCurrent < tickUpper) {
    return SqrtPriceMath.getAmount0Delta(sqrtRatioX96, TickMath.getSqrtRatioAtTick(tickUpper), liquidity, false)
  }
  return JSBI.BigInt('0')
}

export function getToken1Amount(
  tickCurrent: number,
  tickLower: number,
  tickUpper: number,
  sqrtRatioX96: JSBI,
  liquidity: JSBI
): JSBI {
  if (tickCurrent < tickLower) {
    return JSBI.BigInt('0')
  }
  if (tickCurrent < tickUpper) {
    return SqrtPriceMath.getAmount1Delta(TickMath.getSqrtRatioAtTick(tickLower), sqrtRatioX96, liquidity, false)
  }
  return SqrtPriceMath.getAmount1Delta(
    TickMath.getSqrtRatioAtTick(tickLower),
    TickMath.getSqrtRatioAtTick(tickUpper),
    liquidity,
    false
  )
}

export function safeParseJSON(jsonString) {
  try {
    const parsedData = JSON.parse(jsonString)
    return parsedData
  } catch (error) {
    return null
  }
}

export function currentTimestamp() {
  return new Date().getTime()
}

function convertToSubscript(decimalDifference) {
  const subscriptMap = {
    '0': '₀',
    '1': '₁',
    '2': '₂',
    '3': '₃',
    '4': '₄',
    '5': '₅',
    '6': '₆',
    '7': '₇',
    '8': '₈',
    '9': '₉',
  }

  // Convert each digit in the input to its subscript equivalent
  return String(decimalDifference)
    .split('')
    .map((char) => subscriptMap[char] || char)
    .join('')
}
