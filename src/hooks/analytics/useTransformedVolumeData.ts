import { useMemo } from 'react'
import { unixToType, unixToDate } from '../../utils/time'

export function useTransformedVolumeData(chartData: any, type: 'month' | 'week') {
  return useMemo(() => {
    if (chartData) {
      const data = {}

      chartData.forEach(({ date, volumeUSD }: { date: number; volumeUSD: number }) => {
        const group = unixToType(date, type)
        if (data[group]) {
          data[group].volumeUSD += volumeUSD
        } else {
          data[group] = {
            date: unixToDate(date),
            volumeUSD: volumeUSD,
          }
        }
      })

      return Object.values(data)
    } else {
      return []
    }
  }, [chartData, type])
}
