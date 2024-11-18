import moment from 'moment'
import { useEffect, useState } from 'react'
import { flatMap, flattenDeep, groupBy, has, isEmpty, meanBy, orderBy, slice, sumBy, last } from 'lodash'

import { useV3Pairs } from './useV3Pairs'
import { usePegswap } from './usePegswapHistorical'
import { useVevolt } from './useVoltStakingHistorical'
import { useFuseDollar } from './useFuseDollarHistorical'
import { useLiquidStaking } from './useLiquidStakingHistorical'
import { useVoltageExchange } from './useVoltageExchangeHistorical'

/**
 * Somedays the subgraph won't generate information for a query (eg dayDatas).
 *
 * This functions fills the days that are missing with the previous (or closest) value.
 */
const fillMissingDates = (data, numberOfDays) => {
  const today = moment().startOf('day')
  const startDate = today.clone().subtract(numberOfDays - 1, 'days')

  const groupedData = groupBy(data, 'id')

  return flatMap(groupedData, (entries) => {
    const sortedEntries = orderBy(entries, 'date', 'desc')

    const filledData = []

    for (let i = 0; i < numberOfDays; i++) {
      const targetDate = startDate.clone().add(i, 'days').format('YYYY-MM-DD')
      let dataForDate = sortedEntries.find((entry) => entry.date === targetDate)

      if (!dataForDate && filledData.length > 0) {
        dataForDate = { ...last(filledData), date: targetDate }
      }

      if (dataForDate) {
        filledData.push(dataForDate)
      }
    }

    return filledData
  })
}

const mapPercentages = (arr) => {
  if (!arr || arr.length === 0) return []

  return arr.map(({ totalLiquidityUSD, volumeUSD, ...props }) => {
    return {
      totalLiquidityUSD: parseFloat(totalLiquidityUSD),
      volumeUSD,
      percentLiquidityChange: calculatePercentageChange(
        sumBy(arr, 'totalLiquidityUSD') / arr.length,
        totalLiquidityUSD
      ),
      percentVolumeChange: calculatePercentageChange(sumBy(arr, 'volumeUSD') / arr.length, volumeUSD),
      ...props,
    }
  })
}

export function calculatePercentageChange(oldValue, newValue) {
  if (oldValue === 0) {
    // Handle division by zero
    console.error('Old value cannot be zero for percentage calculation.')
    return null
  }
  return (((newValue - oldValue) / oldValue) * 100).toFixed(2)
}

export const mapHistorical = (data, numberOfDays) => {
  if (isEmpty(data)) {
    return []
  }

  const dataGroupedByExactDate = groupBy(data, 'date') as any
  const orderedData = orderBy(
    Object.keys(dataGroupedByExactDate).map((key: any) => {
      return {
        date: key,
        totalLiquidityUSD: parseFloat(sumBy(dataGroupedByExactDate[key], 'totalLiquidityUSD').toString()),
        volumeUSD: sumBy(dataGroupedByExactDate[key], 'volumeUSD'),
        version: dataGroupedByExactDate[key]?.version || 'v2',
      }
    }),
    'date',
    ['asc', 'desc']
  )

  let dataReadyForChart
  if (numberOfDays === 360) {
    const dataGroupedByYearAndMonth = groupBy(orderedData, ({ date }) => {
      return moment(date).year() + '-' + moment(date).month()
    })

    const lastMonth =
      dataGroupedByYearAndMonth[
        Object.keys(dataGroupedByYearAndMonth)[Object.keys(dataGroupedByYearAndMonth).length - 1]
      ]

    const results = Object.keys(dataGroupedByYearAndMonth).map((key, index) => {
      if (Object.keys(dataGroupedByYearAndMonth).length - 1 === index) {
        return {
          date: dataGroupedByYearAndMonth[key][0].date,
          totalLiquidityUSD: lastMonth[lastMonth.length - 1].totalLiquidityUSD,
          version: dataGroupedByYearAndMonth[key][0]?.version || 'v2',

          volumeUSD: sumBy(dataGroupedByYearAndMonth[key], 'volumeUSD'),
        }
      }
      return {
        date: dataGroupedByYearAndMonth[key][0].date,
        version: dataGroupedByYearAndMonth[key][0]?.version || 'v2',

        totalLiquidityUSD: meanBy(dataGroupedByYearAndMonth[key], 'totalLiquidityUSD'),
        volumeUSD: sumBy(dataGroupedByYearAndMonth[key], 'volumeUSD'),
      }
    })

    dataReadyForChart = results
  } else if (numberOfDays === 30 || numberOfDays === 7) {
    dataReadyForChart = slice(orderedData, -numberOfDays)
  }

  return mapPercentages(dataReadyForChart)
}

export const filterAddress = (arr, address) => {
  return address ? arr.filter(({ id }) => id.toLowerCase() === address?.toLowerCase()) : arr
}

const filterVersion = (arr, v) => {
  return v ? arr.filter(({ version }) => version === v) : arr
}

const mapVersion = (arr) => {
  return arr.map((item) => {
    if (has(item, 'version')) {
      return item
    } else {
      return {
        ...item,
        version: 'v2',
      }
    }
  })
}

export const useTVL = (numberOfDays = 360, filterByAddress, version?: any) => {
  const [historicalTVL, setHistoricalTVL] = useState([])

  // Get weekly, monthly and yearly data by querying 360 last days
  const numberOfDaysToFetch = 360

  const voltage = useVoltageExchange(numberOfDaysToFetch)
  const pegswap = usePegswap(numberOfDaysToFetch)
  const veVOLT = useVevolt(numberOfDaysToFetch)
  const fusd = useFuseDollar(numberOfDaysToFetch)
  const liquidStaking = useLiquidStaking(numberOfDaysToFetch)
  const { data: v3Pairs } = useV3Pairs(numberOfDaysToFetch, filterByAddress)

  useEffect(() => {
    const data = [flattenDeep(voltage), pegswap, veVOLT, fusd, liquidStaking, v3Pairs]
    const allDataFetched = data.every((arr) => arr && arr.length > 0)

    // Wait all for all the data to be fetched before we build the chart
    if (allDataFetched) {
      const combinedData = [
        ...fillMissingDates(flattenDeep(voltage), numberOfDaysToFetch),
        ...fillMissingDates(flattenDeep(pegswap), numberOfDaysToFetch),
        ...fillMissingDates(fusd, numberOfDaysToFetch),
        ...fillMissingDates(v3Pairs, numberOfDaysToFetch),
        ...fillMissingDates(veVOLT, numberOfDaysToFetch),
        ...fillMissingDates(liquidStaking, numberOfDaysToFetch),
      ]

      const mappedData = mapVersion(combinedData)
      const filteredAddressData = filterAddress(mappedData, filterByAddress)
      const filteredVersionData = filterVersion(filteredAddressData, version)

      const historicalTVL = mapHistorical(filteredVersionData, numberOfDays)
      setHistoricalTVL(historicalTVL)
    }
  }, [voltage, pegswap, fusd, liquidStaking, veVOLT, numberOfDays, version, filterByAddress, v3Pairs])

  return historicalTVL
}
