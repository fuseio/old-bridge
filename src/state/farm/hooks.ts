import { ChefRewardProgram } from '@fuseio/earn-sdk'
import { ChainId, CurrencyAmount } from '@voltage-finance/sdk-core'
import BigNumber from 'bignumber.js'
import dayjs from 'dayjs'
import { ethers } from 'ethers'
import { useEffect, useMemo, useState } from 'react'
import { getChainNetworkLibrary } from '../../connectors'
import { MASTERCHEF_V2_ADDRESS, MASTERCHEF_V3_ADDRESS, VOLT_ADDRESS } from '../../constants'
import { Farm } from '../../constants/farms'
import { useWeb3 } from '../../hooks'
import { useToken } from '../../hooks/Tokens'
import { tryFormatAmount, tryFormatDecimalAmount } from '../../utils'
import tryParseCurrencyAmount from '../../utils/tryParseCurrencyAmount'
import { Chef } from '../chefs/hooks'
import { useTokenBalance } from '../wallet/hooks'

export async function fetchChefFarm(farm?: any, account?: string | null) {
  if (!farm) return

  account = account || ethers.constants.AddressZero

  const networkId = ChainId.FUSE
  const networkLibrary = getChainNetworkLibrary(networkId)

  let chefAddress
  if (farm?.chef === Chef.MASTERCHEF_V2) {
    chefAddress = MASTERCHEF_V2_ADDRESS[networkId]
  } else if (farm?.chef === Chef.MASTERCHEF_V3) {
    chefAddress = MASTERCHEF_V3_ADDRESS[networkId]
  }

  if (!chefAddress) return

  const rewardProgram = new ChefRewardProgram(chefAddress, networkLibrary.provider)
  const stats = await rewardProgram.getStats(account, farm?.pair, networkId, Number(farm.id))
  const [totalStaked] = await rewardProgram.getStakerInfo(account, farm.id)
  const stakingTimes = await rewardProgram.getStakingTimes()
  const isExpired =
    stakingTimes.end < dayjs().unix() ||
    (stats.rewardsInfo[0].baseAprPercent === 0 &&
      (isNaN(stats.rewardsInfo[0].bonusAprPercent) || stats.rewardsInfo[0].bonusAprPercent === 0))
  const totalAprPercent = Number(stats.rewardsInfo[0].baseAprPercent) + Number(stats.rewardsInfo[0].bonusAprPercent)

  return {
    isExpired,
    contractAddress: chefAddress,
    pairName: `${stats?.tokens
      ?.filter(Boolean)
      ?.map((token: any) => token?.symbol)
      ?.join('/')}`,
    rewards: [VOLT_ADDRESS],
    LPToken: farm?.pair,
    totalStaked,
    networkId,
    type: 'chef',
    totalAprPercent,
    ...stats.rewardsInfo[0],
    ...farm,
    ...stats,
  }
}

export function useDepositDerivedInfo(farm?: Farm, typedValue?: string) {
  const { account } = useWeb3()

  const token = useToken(farm?.LPToken)
  const tokenBalance = useTokenBalance(account ?? undefined, token ?? undefined)

  const parsedAmount = tryParseCurrencyAmount(typedValue, token ?? undefined)
  const time = farm?.end ? farm?.end - dayjs().unix() : '0'
  const rewardRate = farm?.rewardsInfo ? farm?.rewardsInfo[0].rewardRate : '0'

  const rewardsPerToken = useMemo(() => {
    if (farm) {
      return new BigNumber(time)
        .multipliedBy(rewardRate)
        .dividedBy(new BigNumber(farm?.globalTotalStake ?? '0').plus(parsedAmount?.toSignificant() ?? '0'))
        .toString()
    }
    return '0'
  }, [farm, parsedAmount, rewardRate, time])

  const estimatedReward = useMemo(() => {
    return new BigNumber(rewardsPerToken)
      .multipliedBy(new BigNumber(parsedAmount?.quotient.toString() ?? '0').plus(farm?.totalStaked ?? '0'))
      .toFixed(6)
  }, [farm, parsedAmount, rewardsPerToken])

  return {
    tokenBalance,
    parsedAmount,
    rewardsPerToken,
    estimatedReward,
  }
}

export function useWithdrawDerivedInfo(farm?: any, typedValue?: string) {
  const token = useToken(farm?.LPToken)

  const parsedTotalStaked = tryFormatAmount(farm?.totalStaked, 18)
  const parsedAmountLP = tryParseCurrencyAmount(typedValue, token ?? undefined)

  const baseRewards = tryFormatDecimalAmount(farm?.pendingBaseReward, 18, 2)
  const bonusRewards = tryFormatDecimalAmount(farm?.pendingBonusReward, 18, 2)
  const hasAccuruedRewards = Number(baseRewards) + Number(bonusRewards) > 0

  const lpTokenAmount = useMemo(() => {
    if (!token || !farm) return
    return CurrencyAmount.fromRawAmount(token, farm.totalStaked ?? '')
  }, [farm, token])

  return {
    parsedTotalStaked,
    parsedAmountLP,
    bonusRewards,
    baseRewards,
    hasAccuruedRewards,
    lpTokenAmount,
  }
}
