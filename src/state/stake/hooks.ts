import { CurrencyAmount, Token } from '@voltage-finance/sdk-core'
import { formatEther } from 'ethers/lib/utils'
import { useEffect, useMemo, useState } from 'react'
import {
  BLOCK_REWARD_CONTRACT_ADDRESS,
  CONSENSUS_CONTRACT_ADDRESS,
  S_FUSE_LIQUID_STAKING_ADDRESS,
  VALIDATTOR_FEE,
  VOLT,
  sFUSE,
  xVOLT,
} from '../../constants'
import BLOCK_REWARD_ABI from '../../constants/abis/blockReward.json'
import CONSENSUS_ABI from '../../constants/abis/consenus.json'
import { ERC20_ABI } from '../../constants/abis/erc20'
import SFUSE_ABI from '../../constants/abis/liquidsFuseStaking.json'
import { useFusePrice, useVoltBarStats, useVoltPrice } from '../../graphql/hooks'
import { useChain, useWeb3 } from '../../hooks'
import { useXVoltStakeApr } from '../../hooks/stake'
import { useMasterChefV3Contract, useRewarderContract } from '../../hooks/useContract'
import { useMultiCallV2 } from '../../hooks/useMultiCallV2'
import useCurrencyAmountUSD, { useTokenPriceV2 } from '../../hooks/useUSDPrice'
import { useSingleCallResult } from '../multicall/hooks'
import { useTokenBalance } from '../wallet/hooks'
import { aprToApy } from './utils'
import { getMasterChefV3Apy } from '../../graphql/queries/masteChefV3Subgraph'

export const useBarStats = () => {
  const { account } = useWeb3()

  const { isFuse } = useChain()

  const voltBarStats = useVoltBarStats()

  const stakers = useMemo(() => voltBarStats?.bars[0]?.usersCnt, [voltBarStats])

  const ratio = useMemo(() => voltBarStats?.bars[0]?.ratio, [voltBarStats])

  const xvoltVoltBalance = useTokenBalance(isFuse ? xVOLT.address : undefined, VOLT)

  const xvoltApr = useXVoltStakeApr()

  const voltPrice = useVoltPrice()

  const tvl = useMemo(() => {
    if (!xvoltVoltBalance || !ratio || !voltPrice) return 0
    return Number(xvoltVoltBalance.toSignificant(6)) * Number(ratio) * voltPrice
  }, [xvoltVoltBalance, ratio, voltPrice])

  const apy = useMemo(() => aprToApy(xvoltApr, 365), [xvoltApr])

  const apySinceDayZero = useMemo(() => (!isNaN(ratio) ? (ratio - 1) * 100 : 0), [ratio])

  const userXVoltBalance = useTokenBalance(account, xVOLT)

  const userStakedAmount = userXVoltBalance && ratio ? Number(userXVoltBalance.toSignificant(6)) * Number(ratio) : 0

  return useMemo(
    () => ({
      priceRatio: Number(ratio),
      stakers,
      apy,
      apySinceDayZero,
      tvl,
      userStakedAmount,
    }),
    [apy, apySinceDayZero, ratio, stakers, tvl, userStakedAmount]
  )
}

export const useFuseStakingStats = () => {
  const { account } = useWeb3()

  const balances = useMultiCallV2(
    account
      ? [
          {
            reference: sFUSE?.address,
            contractAddress: sFUSE?.address,
            abi: ERC20_ABI,
            calls: [
              {
                reference: 'balanceOf',
                methodName: 'balanceOf',
                methodParameters: [account],
              },
            ],
          },
        ]
      : []
  )

  const results = useMultiCallV2([
    {
      reference: S_FUSE_LIQUID_STAKING_ADDRESS,
      contractAddress: S_FUSE_LIQUID_STAKING_ADDRESS,
      abi: SFUSE_ABI,
      calls: [
        { reference: 'priceRatio', methodName: 'priceRatio', methodParameters: [] },
        { reference: 'getValidators', methodName: 'getValidators', methodParameters: [] },
        { reference: 'systemTotalStaked', methodName: 'systemTotalStaked', methodParameters: [] },
      ],
    },
    {
      reference: BLOCK_REWARD_CONTRACT_ADDRESS,
      contractAddress: BLOCK_REWARD_CONTRACT_ADDRESS,
      abi: BLOCK_REWARD_ABI,
      calls: [
        { reference: 'getBlockRewardAmount', methodName: 'getBlockRewardAmount', methodParameters: [] },
        { reference: 'getBlocksPerYear', methodName: 'getBlocksPerYear', methodParameters: [] },
      ],
    },
    {
      reference: CONSENSUS_CONTRACT_ADDRESS,
      contractAddress: CONSENSUS_CONTRACT_ADDRESS,
      abi: CONSENSUS_ABI,
      calls: [{ reference: 'totalStakeAmount', methodName: 'totalStakeAmount', methodParameters: [] }],
    },
  ])

  const priceRatio = results[0]?.result[0]
  const validators = results[1]?.result
  const totalStaked = results[2]?.result[0]
  const rewardPerBlock = results[3]?.result[0]
  const blocksPerYear = results[4]?.result[0]
  const totalStakeAmount = results[5]?.result[0]
  const userSFuseBalance = balances[0]?.result[0]
  const formattedPriceRatio = priceRatio ? formatEther(priceRatio) : undefined
  const apySinceDayZero = useMemo(
    () => (formattedPriceRatio ? (Number(formattedPriceRatio) - 1) * 100 : 0),
    [formattedPriceRatio]
  )

  const numberOfValidators = useMemo(() => (validators ? validators.length : 0), [validators])

  const formattedTotalStaked = totalStaked ? formatEther(totalStaked) : undefined

  const fusePrice = useFusePrice()

  const tvl = useMemo(
    () => (formattedTotalStaked && fusePrice ? Number(formattedTotalStaked) * Number(fusePrice) : 0),
    [formattedTotalStaked, fusePrice]
  )

  const apr = useMemo(
    () =>
      rewardPerBlock && blocksPerYear && totalStakeAmount
        ? ((Number(formatEther(rewardPerBlock)) * blocksPerYear * (1 - VALIDATTOR_FEE)) /
            Number(formatEther(totalStakeAmount))) *
          100
        : 0,
    [rewardPerBlock, blocksPerYear, totalStakeAmount]
  )

  const userStakedAmount = useMemo(() => {
    if (formattedPriceRatio && userSFuseBalance) {
      return Number(CurrencyAmount.fromRawAmount(sFUSE, userSFuseBalance).toExact()) * Number(formattedPriceRatio)
    }
    return 0
  }, [formattedPriceRatio, userSFuseBalance])

  const sFuseBalance = useMemo(() => {
    if (userSFuseBalance) {
      return Number(CurrencyAmount.fromRawAmount(sFUSE, userSFuseBalance.toString()).toSignificant())
    }
    return 0
  }, [userSFuseBalance])

  return useMemo(
    () => ({
      apy: aprToApy(apr, 365),
      priceRatio: Number(formattedPriceRatio),
      tvl,
      numberOfValidators,
      apySinceDayZero,
      userStakedAmount,
      sFuseBalance,
    }),
    [apr, formattedPriceRatio, tvl, numberOfValidators, apySinceDayZero, userStakedAmount, sFuseBalance]
  )
}

export const usePoolData = (pid: number) => {
  const [poolData, setPoolData] = useState(undefined)
  const getPoolData = async () => {
    const data = await getMasterChefV3Apy(pid)
    setPoolData(data)
  }

  useEffect(() => {
    getPoolData()
  }, [])

  return poolData
}

export function useChefStake(
  pid: string,
  stakeToken: Token,
  account?: string
): {
  pid: string
  totalStakedAmountUSD: number
  userStakedAmount: CurrencyAmount<Token>
  userStakedAmountUSD: number
  rewardAmount: CurrencyAmount<Token>
  rewardAmountUSD: number
  stakeToken: Token
  apy: number
} {
  const masterChefV3 = useMasterChefV3Contract()

  const rewardTokenPrice = useTokenPriceV2(stakeToken?.address)

  const userInfo = useSingleCallResult(masterChefV3, 'userInfo', [pid, account])

  const poolData = usePoolData(Number(pid))

  const tokenPerSec = poolData?.[0]?.rewarder?.tokenPerSec
  const totalStakedAmount = poolData?.[0]?.balance

  const totalStakedAmountUSD = useCurrencyAmountUSD(
    CurrencyAmount.fromRawAmount(stakeToken, totalStakedAmount?.toString() ?? '0')
  )

  const userStakedAmount = useMemo(
    () => (stakeToken ? CurrencyAmount.fromRawAmount(stakeToken, userInfo?.result?.amount ?? '0') : null),
    [stakeToken, userInfo?.result?.amount]
  )

  const userStakedAmountUSD = useCurrencyAmountUSD(userStakedAmount)

  const pendingTokens = useSingleCallResult(masterChefV3, 'pendingTokens', [pid, account])

  const rewardAmount = useMemo(
    () =>
      stakeToken ? CurrencyAmount.fromRawAmount(stakeToken, pendingTokens?.result?.pendingBonusToken ?? '0') : null,
    [pendingTokens?.result?.pendingBonusToken, stakeToken]
  )

  const rewardAmountUSD = useCurrencyAmountUSD(rewardAmount)

  const apy = useMemo(() => {
    const rewardsPerSec = stakeToken
      ? CurrencyAmount.fromRawAmount(stakeToken, tokenPerSec?.toString() ?? '0').toSignificant()
      : '0'
    const rewardsPerYear = parseFloat(rewardsPerSec) * 60 * 60 * 24 * 30 * 12
    const rewardsPerYearUSD = rewardsPerYear * rewardTokenPrice
    return (rewardsPerYearUSD / totalStakedAmountUSD) * 100
  }, [rewardTokenPrice, stakeToken, tokenPerSec, totalStakedAmountUSD])

  return useMemo(
    () => ({
      pid,
      stakeToken,
      totalStakedAmountUSD,
      userStakedAmount,
      userStakedAmountUSD,
      rewardAmount,
      rewardAmountUSD,
      apy,
    }),
    [apy, pid, rewardAmount, rewardAmountUSD, stakeToken, totalStakedAmountUSD, userStakedAmount, userStakedAmountUSD]
  )
}
