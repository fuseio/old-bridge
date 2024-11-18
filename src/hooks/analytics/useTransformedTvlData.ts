import { useMemo } from 'react'
import { unixToType, unixToDate } from '../../utils/time'

export function useTransformedTvlData(chartData: any, type: 'month' | 'week') {
  return useMemo(() => {
    if (chartData) {
      const data = {}

      chartData.forEach(({ date, tvlUSD }: { date: number; tvlUSD: number }) => {
        const group = unixToType(date, type)
        if (data[group]) {
          data[group].value += tvlUSD
        } else {
          data[group] = {
            time: unixToDate(date),
            value: tvlUSD,
          }
        }
      })

      return Object.values(data)
    } else {
      return []
    }
  }, [chartData, type])
}
