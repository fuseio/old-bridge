import { Web3Provider } from '@ethersproject/providers'
import { BigNumber } from 'ethers'
import {
  FUSE_ERC677_TO_ERC677_BRIDGE_FOREIGN_ADDRESS,
  FUSE_ERC677_TO_ERC677_BRIDGE_HOME_ADDRESS
} from '../../../../constants'
import { getAMBErc677To677Contract, tryFormatAmount } from '../../../../utils'

export default async function getErc677ToErc677WithinDailyLimit(
  amount: BigNumber | undefined,
  isHome: boolean,
  library: Web3Provider,
  account: string
) {
  const address = isHome ? FUSE_ERC677_TO_ERC677_BRIDGE_HOME_ADDRESS : FUSE_ERC677_TO_ERC677_BRIDGE_FOREIGN_ADDRESS

  const contract = getAMBErc677To677Contract(address, library, account)

  const dailyLimit = await contract.dailyLimit()
  const currentDay = await contract.getCurrentDay()
  const totalSpent = await contract.totalSpentPerDay(currentDay)
  return amount?.add(totalSpent).lte(dailyLimit)
}

export async function getErc677ToErc677DailyLimit(
  decimals: number | undefined,
  isHome: boolean,
  library: Web3Provider,
  account: string
) {
  const address = isHome ? FUSE_ERC677_TO_ERC677_BRIDGE_HOME_ADDRESS : FUSE_ERC677_TO_ERC677_BRIDGE_FOREIGN_ADDRESS

  const contract = getAMBErc677To677Contract(address, library, account)
  const dailyLimit = await contract.dailyLimit()
  if (dailyLimit.isZero()) return true // token hasn't been initialized yet

  return await tryFormatAmount(dailyLimit, decimals)
}
