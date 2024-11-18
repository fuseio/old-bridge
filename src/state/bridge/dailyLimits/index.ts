import { BigNumber } from 'ethers'
import { Web3Provider } from '@ethersproject/providers'

import { getBridgeType } from '../../../utils'
import { BridgeDirection, BridgeType } from '../actions'
import ethFuseErc20ToErc677WithinDailyLimit, {
  getErc20ToErc677DailyLimit as ethFuseErc20ToErc677DailyLimit,
} from './ethFuse/erc20ToErc677'
import ethFuseErc677ToErc677WithinDailyLimit, {
  getErc677ToErc677DailyLimit as ethFuseErc677ToErc677DailyLimit,
} from './ethFuse/erc677ToErc677'
import ethFuseNativeToErcWithinDailyLimit, {
  getNativeToErcDailyLimit as ethFuseNativeToErcDailyLimit,
} from './ethFuse/native'
import bscFuseErc20ToErc677WithinDailyLimit, {
  getErc20ToErc677DailyLimit as bscFuseErc20ToErc677DailyLimit,
} from './bnbFuse/erc20ToErc677'
import bscFuseNativeToErcWithinDailyLimit, {
  getNativeToErcDailyLimit as bscFuseNativeToErcDailyLimit,
} from './bnbFuse/native'
import bscBnbNativeToErcWithinDailyLimit, {
  getBnbNativeToErcDailyLimit as bscBnbNativeToErcDailyLimit,
} from './bnbFuse/bnbNative'

export async function withinDailyLimit(
  amount: BigNumber | undefined,
  tokenAddress: string,
  bridgeDirection: BridgeDirection,
  isHome: boolean,
  library: Web3Provider,
  account: string
) {
  let withinLimit: (...args: any[]) => Promise<any>, args: Array<any>

  const bridgeType = getBridgeType(tokenAddress, bridgeDirection)
  switch (bridgeType) {
    case BridgeType.ETH_FUSE_NATIVE:
      withinLimit = ethFuseNativeToErcWithinDailyLimit
      args = [amount, isHome, library, account]
      break
    case BridgeType.ETH_FUSE_ERC20_TO_ERC677:
      withinLimit = ethFuseErc20ToErc677WithinDailyLimit
      args = [amount, tokenAddress, isHome, library, account]
      break
    case BridgeType.ETH_FUSE_ERC677_TO_ERC677:
      withinLimit = ethFuseErc677ToErc677WithinDailyLimit
      args = [amount, isHome, library, account]
      break
    case BridgeType.BSC_FUSE_ERC20_TO_ERC677:
      withinLimit = bscFuseErc20ToErc677WithinDailyLimit
      args = [amount, tokenAddress, isHome, library, account]
      break
    case BridgeType.BSC_FUSE_NATIVE:
      withinLimit = bscFuseNativeToErcWithinDailyLimit
      args = [amount, isHome, library, account]
      break
    case BridgeType.BSC_FUSE_BNB_NATIVE:
      withinLimit = bscBnbNativeToErcWithinDailyLimit
      args = [amount, isHome, library, account]
      break
    default:
      return
  }

  const result = await withinLimit(...args)
  return result
}

export async function getDailyLimit(
  tokenAddress: string,
  bridgeDirection: BridgeDirection,
  decimals: number | undefined,
  isHome: boolean,
  library: Web3Provider,
  account: string
) {
  let dailyLimit: (...args: any[]) => Promise<any>, args: Array<any>

  const bridgeType = getBridgeType(tokenAddress, bridgeDirection)
  switch (bridgeType) {
    case BridgeType.ETH_FUSE_NATIVE:
      dailyLimit = ethFuseNativeToErcDailyLimit
      args = [decimals, isHome, library, account]
      break
    case BridgeType.ETH_FUSE_ERC20_TO_ERC677:
      dailyLimit = ethFuseErc20ToErc677DailyLimit
      args = [decimals, tokenAddress, isHome, library, account]
      break
    case BridgeType.ETH_FUSE_ERC677_TO_ERC677:
      dailyLimit = ethFuseErc677ToErc677DailyLimit
      args = [decimals, isHome, library, account]
      break
    case BridgeType.BSC_FUSE_ERC20_TO_ERC677:
      dailyLimit = bscFuseErc20ToErc677DailyLimit
      args = [decimals, tokenAddress, isHome, library, account]
      break
    case BridgeType.BSC_FUSE_NATIVE:
      dailyLimit = bscFuseNativeToErcDailyLimit
      args = [decimals, isHome, library, account]
      break
    case BridgeType.BSC_FUSE_BNB_NATIVE:
      dailyLimit = bscBnbNativeToErcDailyLimit
      args = [decimals, isHome, library, account]
      break
    default:
      return
  }

  const result = await dailyLimit(...args)
  return result
}
