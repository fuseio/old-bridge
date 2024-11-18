import dayjs from 'dayjs'
import { useMemo } from 'react'
import { SECONDS_IN_DAY, xVOLT } from '../../constants'
import { useVoltBarStats } from '../../graphql/hooks'
import tryParseCurrencyAmount from '../../utils/tryParseCurrencyAmount'

export function useXVoltTotalSupply() {
  const barStats = useVoltBarStats()
  return useMemo(() => {
    if (!barStats || !barStats.bars || !barStats.bars.length) {
      return
    }
    return tryParseCurrencyAmount(barStats.bars[0].totalSupply, xVOLT)
  }, [barStats])
}

export function useXVoltStakeApr() {
  // Get the ratio change over the last 30 days and annualize it
  const days = 31
  const xvoltStats = useVoltBarStats(days, Math.floor(dayjs().unix() / SECONDS_IN_DAY) - days)

  return useMemo(() => {
    if (
      !xvoltStats ||
      !xvoltStats.voltBalanceHistories ||
      !xvoltStats.voltBalanceHistories.length ||
      !xvoltStats.bars ||
      !xvoltStats.bars.length
    ) {
      return
    }

    const currentTotalVoltStaked = xvoltStats.bars[0].totalSupply
    const actualDays = xvoltStats.voltBalanceHistories.length - 1 // Because we skip the first day
    const rewardsDailyMoveAvg =
      xvoltStats.voltBalanceHistories
        .map((history: any, i: number, histories: any[]) => {
          if (i === 0) return 0 // Skip the first day
          return (
            history.balance - history.totalVoltStaked - (histories[i - 1].balance - histories[i - 1].totalVoltStaked)
          )
        })
        .reduce((total: number, cur: number) => total + cur, 0) / actualDays

    return (rewardsDailyMoveAvg * 365 * 100) / currentTotalVoltStaked ?? 0
  }, [xvoltStats])
}
