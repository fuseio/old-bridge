import { useMemo } from 'react'
import { Version } from '../../pages/Analytics'
import { unixToDate } from '../../utils/time'
import { useTransformedVolumeData } from './useTransformedVolumeData'
import { useTVL } from './useTvl'
import { useV3Pairs } from './useV3Pairs'

function useV3Volume(numberOfDays: number) {
    const { chartData } = useV3Pairs(numberOfDays, null)

    const formattedVolumeData = useMemo(() => {
      if (chartData) {
        return chartData.map((day) => {
          return {
            date: unixToDate(day.date),
            volumeUSD: day.volumeUSD,
          }
        })
      } else {
        return []
      }
    }, [chartData])
  
    const weeklyVolumeData = useTransformedVolumeData(chartData, 'week')
    const monthlyVolumeData = useTransformedVolumeData(chartData, 'month')
  
    const data = numberOfDays === 360 ? monthlyVolumeData : numberOfDays === 7 ? formattedVolumeData : weeklyVolumeData

    return { data, placeholder:  formattedVolumeData[formattedVolumeData.length - 1]}
}

function useV2Volume(numberOfDays: number, version: Version) {
  const data = useTVL(numberOfDays, null, version)
  const weekly = useTVL(7, null, version)

  return { data, placeholder: weekly[weekly.length - 1] }
}

export default function useAnalyticsVolume(numberOfDays: number, version: Version) {
  const { data: v2Data, placeholder: v2Placeholder } = useV2Volume(numberOfDays, version)
  const { data: v3Data, placeholder: v3Placeholder } = useV3Volume(numberOfDays)

  return { v2Data, v2Placeholder, v3Data, v3Placeholder }
}
