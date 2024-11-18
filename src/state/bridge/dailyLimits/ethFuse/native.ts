import { Web3Provider } from '@ethersproject/providers'
import { BigNumber, Contract } from 'ethers'
import {
  FUSE_NATIVE_TO_ERC677_BRIDGE_FOREIGN_ADDRESS,
  FUSE_NATIVE_TO_ERC677_BRIDGE_HOME_ADDRESS
} from '../../../../constants'
import {
  getForeignBridgeNativeToErcContract,
  getHomeBridgeNativeToErcContract,
  tryFormatAmount
} from '../../../../utils'

export default async function getNativeToErcWithinDailyLimit(
  amount: BigNumber | undefined,
  isHome: boolean,
  library: Web3Provider,
  account: string
) {
  let contract: Contract

  if (isHome) {
    contract = getHomeBridgeNativeToErcContract(FUSE_NATIVE_TO_ERC677_BRIDGE_HOME_ADDRESS, library, account)
  } else {
    contract = getForeignBridgeNativeToErcContract(FUSE_NATIVE_TO_ERC677_BRIDGE_FOREIGN_ADDRESS, library, account)
  }

  const dailyLimit = await contract.dailyLimit()
  if (dailyLimit.isZero()) return true // token hasn't been initialized yet

  const currentDay = await contract.getCurrentDay()
  const totalSpent = await contract.totalSpentPerDay(currentDay)
  return amount?.add(totalSpent).lte(dailyLimit)
}

export async function getNativeToErcDailyLimit(
  decimals: number | undefined,
  isHome: boolean,
  library: Web3Provider,
  account: string
) {
  const contract = isHome
    ? getHomeBridgeNativeToErcContract(FUSE_NATIVE_TO_ERC677_BRIDGE_HOME_ADDRESS, library, account)
    : getForeignBridgeNativeToErcContract(FUSE_NATIVE_TO_ERC677_BRIDGE_FOREIGN_ADDRESS, library, account)
  const dailyLimit = await contract.dailyLimit()
  return tryFormatAmount(dailyLimit, decimals)
}
