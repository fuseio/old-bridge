import JSBI from 'jsbi'
import moment from 'moment'
import { useEffect, useMemo, useState } from 'react'
import { Fraction, Percent, CurrencyAmount } from '@voltage-finance/sdk-core'

import { useWeb3 } from './index'
import { ChainId } from '../constants/chains'
import { useVoltPrice } from '../graphql/hooks'
import { useMultiCallV2 } from './useMultiCallV2'
import { ERC20_ABI } from '../constants/abis/erc20'
import VEVOLT_ABI from '../constants/abis/voteEscrow.json'
import FEE_DISTRIBUTOR_ABI from '../constants/abis/feeDistributor.json'
import { useVeVoltFeeDistributions } from './useVeVoltFeeDistributions'
import { FEE_DISTRIBUTOR_ADDRESS, VEVOLT_ADDRESS, VOLT } from '../constants/addresses'
import { VEVOLT_MAX_LOCK_MONTHS, VEVOLT_MAX_LOCK_TIMESTAMP, VOLT_ADDRESS } from '../constants'

export default function useVoteEscrow() {
  const { account, chainId } = useWeb3()
  const [voltLocked, setVoltLocked] = useState(null)
  const [vevoltSupply, setVevoltSupply] = useState(null)
  const [locked, setLocked] = useState(null)
  const [timeCursor, setTimeCursor] = useState(null)
  const [balance, setBalanceOf] = useState(null)
  const [claimable, setClaimable] = useState(null)

  const vevoltLastThirtyFeeDistributions = useVeVoltFeeDistributions(30)

  const veVoltAddress = VEVOLT_ADDRESS[chainId] || VEVOLT_ADDRESS[ChainId.FUSE]
  const feeDistributorAddress = FEE_DISTRIBUTOR_ADDRESS[chainId] || FEE_DISTRIBUTOR_ADDRESS[ChainId.FUSE]
  const voltToken = VOLT[chainId] || VOLT[ChainId.FUSE]

  const userResults = useMultiCallV2(
    account
      ? [
          {
            reference: veVoltAddress,
            contractAddress: veVoltAddress,
            abi: VEVOLT_ABI,
            calls: [
              {
                reference: 'locked',
                methodName: 'locked',
                methodParameters: [account],
              },
              {
                reference: 'balanceOf',
                methodName: 'balanceOf',
                methodParameters: [account],
              },
            ],
          },
          {
            reference: feeDistributorAddress,
            contractAddress: feeDistributorAddress,
            abi: FEE_DISTRIBUTOR_ABI,
            calls: [
              {
                reference: 'claimable',
                methodName: 'claimable',
                methodParameters: [account],
              },
            ],
          },
        ]
      : []
  )

  const results = useMultiCallV2([
    {
      reference: VOLT_ADDRESS,
      contractAddress: VOLT_ADDRESS,
      abi: ERC20_ABI,
      calls: [
        {
          reference: 'balanceOf',
          methodName: 'balanceOf',
          methodParameters: [veVoltAddress],
        },
      ],
    },
    {
      reference: veVoltAddress,
      contractAddress: veVoltAddress,
      abi: VEVOLT_ABI,
      calls: [
        {
          reference: 'totalSupply',
          methodName: 'totalSupply',
          methodParameters: [],
        },
      ],
    },
    {
      reference: feeDistributorAddress,
      contractAddress: feeDistributorAddress,
      abi: FEE_DISTRIBUTOR_ABI,
      calls: [
        {
          reference: 'time_cursor',
          methodName: 'time_cursor',
          methodParameters: [],
        },
      ],
    },
  ])

  const voltPrice = useVoltPrice()

  useEffect(() => {
    if (userResults && userResults.length !== 0) {
      setLocked(userResults[0]?.result)
      setBalanceOf(userResults[1]?.result[0])
      setClaimable(userResults[2]?.result[0])
    }
    if (results && results.length !== 0) {
      const voltLocked = CurrencyAmount.fromRawAmount(voltToken, JSBI.BigInt(results[0]?.result[0]))
      setVoltLocked(voltLocked)
      setVevoltSupply(results[1]?.result[0])
      setTimeCursor(results[2]?.result[0])
    }
  }, [results, userResults, voltToken])

  const tvl = useMemo(() => {
    if (!voltPrice || !voltLocked) return
    return Number(voltLocked?.toSignificant(6)) * voltPrice
  }, [voltPrice, voltLocked])

  const apy = useMemo(() => {
    if (!voltLocked || !vevoltLastThirtyFeeDistributions) return 0
    return ((vevoltLastThirtyFeeDistributions * 12) / Number(voltLocked.toSignificant(6))) * 100
  }, [voltLocked, vevoltLastThirtyFeeDistributions])

  const averageLockTime = useMemo(() => {
    if (!vevoltSupply || !voltLocked) return
    const totalVeVolt = CurrencyAmount.fromRawAmount(voltToken, vevoltSupply)
    const ratio = totalVeVolt.divide(voltLocked).toSignificant(6)
    return Math.round(Number(ratio) * 2 * 100) / 100
  }, [vevoltSupply, voltLocked, voltToken])

  const lock = useMemo(() => {
    if (!locked || locked.length === 0) return
    return {
      amount: CurrencyAmount.fromRawAmount(voltToken, JSBI.BigInt(locked[0])),
      end: locked[1].toString(),
    }
  }, [locked, voltToken])

  const hasLock = useMemo(() => {
    if (!lock) return false
    return lock.amount.greaterThan('0') && Number(lock.end) > 0
  }, [lock])

  const claimableBalance = useMemo(() => {
    if (!claimable || !chainId) return
    return CurrencyAmount.fromRawAmount(voltToken, JSBI.BigInt(claimable))
  }, [claimable, chainId, voltToken])

  const veVoltBalance = useMemo(() => {
    if (!balance || !chainId) return
    return CurrencyAmount.fromRawAmount(voltToken, JSBI.BigInt(balance))
  }, [balance, chainId, voltToken])

  const isLockDone = useMemo(() => {
    if (!lock) return
    return moment().unix() > Number(lock.end)
  }, [lock])

  const penaltyPercent = useMemo(() => {
    if (!lock) return

    const timeLeft = lock.end - moment().unix()
    const timeLeftPercent = (timeLeft / VEVOLT_MAX_LOCK_TIMESTAMP).toFixed(4)
    const percent = (Math.min(2 / 4, Number(timeLeftPercent)) * 10000).toString()
    return new Percent(parseInt(percent).toString(), '10000')
  }, [lock])

  const withdrawAmount = useMemo(() => {
    if (!lock || !penaltyPercent) return

    return new Fraction('1').subtract(penaltyPercent).multiply(lock.amount)
  }, [lock, penaltyPercent])

  const withdrawPenalty = useMemo(() => {
    if (!lock || !penaltyPercent) return

    return lock.amount.multiply(penaltyPercent)
  }, [lock, penaltyPercent])

  const monthsRemaining = useMemo(() => {
    if (!lock) return
    const current = moment.duration(moment().unix(), 'seconds').asMonths()
    const lockEnd = moment.duration(parseFloat(lock?.end), 'seconds').asMonths()
    const months = VEVOLT_MAX_LOCK_MONTHS - Math.round(lockEnd - current)
    return months
  }, [lock])

  const nextDistributionTimestamp = useMemo(() => {
    return timeCursor
  }, [timeCursor])

  const timeRemainingToDistribution = useMemo(() => {
    if (nextDistributionTimestamp) {
      const toNextDist = moment.duration(moment.unix(nextDistributionTimestamp).diff(moment()), 'milliseconds')

      if (toNextDist.asMilliseconds() <= 0) {
        return 'Now'
      }

      return `${toNextDist.days()}D ${toNextDist.hours()}H ${toNextDist.minutes()}M`
    }
  }, [nextDistributionTimestamp])

  return useMemo(
    () => ({
      lock,
      hasLock,
      penaltyPercent,
      withdrawAmount,
      withdrawPenalty,
      veVoltBalance,
      claimableBalance,
      tvl,
      voltLocked,
      loading: false,
      timeRemainingToDistribution,
      isLockDone,
      averageLockTime,
      monthsRemaining,
      apy,
    }),
    [lock, hasLock, penaltyPercent, withdrawAmount, withdrawPenalty, veVoltBalance, claimableBalance, tvl, voltLocked, timeRemainingToDistribution, isLockDone, averageLockTime, monthsRemaining, apy]
  )
}
