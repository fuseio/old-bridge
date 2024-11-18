import { Web3Provider } from '@ethersproject/providers'
import { BigNumber, Contract } from 'ethers'
import {
  FUSE_ERC20_TO_ERC677_BRIDGE_FOREIGN_ADDRESS,
  FUSE_ERC20_TO_ERC677_BRIDGE_HOME_ADDRESS
} from '../../../../constants'
import {
  getForeignMultiAMBErc20ToErc677Contract,
  getHomeMultiAMBErc20ToErc677Contract,
  tryFormatAmount
} from '../../../../utils'

export default async function getErc20ToErc677WithinDailyLimit(
  amount: BigNumber | undefined,
  tokenAddress: string,
  isHome: boolean,
  library: Web3Provider,
  account: string
) {
  let contract: Contract

  if (isHome) {
    contract = getHomeMultiAMBErc20ToErc677Contract(FUSE_ERC20_TO_ERC677_BRIDGE_HOME_ADDRESS, library, account)
  } else {
    contract = getForeignMultiAMBErc20ToErc677Contract(FUSE_ERC20_TO_ERC677_BRIDGE_FOREIGN_ADDRESS, library, account)
  }

  const dailyLimit = await contract.dailyLimit(tokenAddress)
  if (dailyLimit.isZero()) return true // token hasn't been initialized yet

  const currentDay = await contract.getCurrentDay()
  const totalSpent = await contract.totalSpentPerDay(tokenAddress, currentDay)
  return amount?.add(totalSpent).lte(dailyLimit)
}

export async function getErc20ToErc677DailyLimit(
  decimals: number | undefined,
  tokenAddress: string,
  isHome: boolean,
  library: Web3Provider,
  account: string
) {
  let contract: Contract

  if (isHome) {
    contract = getHomeMultiAMBErc20ToErc677Contract(FUSE_ERC20_TO_ERC677_BRIDGE_HOME_ADDRESS, library, account)
  } else {
    contract = getForeignMultiAMBErc20ToErc677Contract(FUSE_ERC20_TO_ERC677_BRIDGE_FOREIGN_ADDRESS, library, account)
  }
  const result = await contract.dailyLimit(tokenAddress)
  return tryFormatAmount(result, decimals)
}
