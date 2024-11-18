import { Web3Provider } from '@ethersproject/providers'
import {
  getHomeBridgeNativeToErcContract,
  getForeignBridgeNativeToErcContract,
  tryFormatAmount
} from '../../../../utils'
import { BigNumber, Contract } from 'ethers'
import {
  BSC_BNB_NATIVE_TO_ERC20_BRIDGE_FOREIGN_ADDRESS,
  BSC_BNB_NATIVE_TO_ERC20_BRIDGE_HOME_ADDRESS
} from '../../../../constants'

export default async function getBnbNativeToErcWithinDailyLimit(
  amount: BigNumber | undefined,
  isHome: boolean,
  library: Web3Provider,
  account: string
) {
  let contract: Contract

  if (isHome) {
    contract = getForeignBridgeNativeToErcContract(BSC_BNB_NATIVE_TO_ERC20_BRIDGE_FOREIGN_ADDRESS, library, account)
  } else {
    contract = getHomeBridgeNativeToErcContract(BSC_BNB_NATIVE_TO_ERC20_BRIDGE_HOME_ADDRESS, library, account)
  }

  const dailyLimit = await contract.dailyLimit()
  if (dailyLimit.isZero()) return true // token hasn't been initialized yet

  const currentDay = await contract.getCurrentDay()
  const totalSpent = await contract.totalSpentPerDay(currentDay)
  return amount?.add(totalSpent).lte(dailyLimit)
}

export async function getBnbNativeToErcDailyLimit(
  decimals: number,
  isHome: boolean,
  library: Web3Provider,
  account: string
) {
  let contract: Contract

  if (isHome) {
    contract = getForeignBridgeNativeToErcContract(BSC_BNB_NATIVE_TO_ERC20_BRIDGE_FOREIGN_ADDRESS, library, account)
  } else {
    contract = getHomeBridgeNativeToErcContract(BSC_BNB_NATIVE_TO_ERC20_BRIDGE_HOME_ADDRESS, library, account)
  }
  const dailyLimit = await contract.dailyLimit()
  return await tryFormatAmount(dailyLimit, decimals)
}
