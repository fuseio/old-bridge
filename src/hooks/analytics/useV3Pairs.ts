import moment from 'moment'
import { flattenDeep, orderBy } from 'lodash'
import { useCallback, useEffect, useState } from 'react'

import { useOneDayBlock } from '../../graphql/hooks'
import { voltageSubgraphClient, voltageSubgraphV3Client } from '../../graphql/client'
import { isV2 } from '../../utils'
import { GET_PAIR_DAY_DATAS_QUERY, GET_V3_PAIRS_QUERY, POOLS_CHART_QUERY, TOP_PAIRS_QUERY } from '../../graphql/queries/voltageV3Subgraph'

export const usePair = (numberOfDays, pairAddress) => {
  const [data, setData] = useState([])

  const mapV2 = (id, symbol) => {
    if (isV2(id)) {
      return symbol + ' V2'
    }
    return symbol
  }
  const fetchPairs = useCallback(async () => {
    setData([])

    const now = moment().utc()

    try {
      const { data } = await voltageSubgraphClient.query({
        query: GET_PAIR_DAY_DATAS_QUERY,
        variables: {
          from: now.clone().subtract(numberOfDays, 'day').unix(),
          pairAddress,
        },
      })

      setData(
        data?.pairDayDatas?.map(({ token0, reserveUSD, pairAddress, date, dailyVolumeUSD, token1 }) => {
          return {
            name: mapV2(token0?.id, token0?.symbol) + '-' + mapV2(token1?.id, token1?.symbol),
            id: pairAddress,
            symbol: token0?.symbol + '-' + token1?.symbol,
            totalLiquidityUSD: parseFloat(reserveUSD),
            token0Price: 0,
            token1Price: 0,
            volumeUSD: parseFloat(dailyVolumeUSD) || 0,
            timestamp: parseFloat(date),
            token0,
            token1,
            fee: parseFloat(dailyVolumeUSD) * 0.03,
            date: moment.utc(date * 1000).format('YYYY-MM-DD'),
          }
        })
      )
    } catch (e) {
      setData([])
      return 0
    }
  }, [numberOfDays, pairAddress])

  useEffect(() => {
    fetchPairs()
  }, [fetchPairs])
  
  return data
}

export const useV3Pairs = (numberOfDays, filterByAddress?: any): any => {
  const [data, setData] = useState([])

  const v3Pairs = useCallback(async () => {
    setData([])
    const now = moment().utc()

    try {
      const { data } = await voltageSubgraphV3Client.query({
        query: GET_V3_PAIRS_QUERY,
        variables: {
          from: now.clone().subtract(1, 'year').unix(),
          first: numberOfDays,
        },
      })

      const results = data?.pools?.map(({ id, token0, token1, poolDayData, ...props }) => {
        return poolDayData.map(({ tvlUSD, date, volumeUSD }) => {
          return {
            name: token0?.symbol + '-' + token1?.symbol,
            id,
            symbol: token0?.symbol + '-' + token1?.symbol,
            totalLiquidityUSD: parseFloat(tvlUSD) || 0,
            priceUSD: 0,
            volumeUSD: parseFloat(volumeUSD) || 0,
            timestamp: parseFloat(date),
            version: 'v3',
            token0,
            token1,
            date: moment.utc(date * 1000).format('YYYY-MM-DD'),
            ...props,
          }
        })
      })

      setData(
        orderBy(
          filterByAddress
            ? flattenDeep(results).filter((item) => (item as any)?.id?.toLowerCase() === filterByAddress)
            : flattenDeep(results),
          'totalLiquidityUSD',
          ['desc', 'asc']
        )
      )
    } catch (e) {
      setData([])
      return 0
    }
  }, [numberOfDays, filterByAddress])

  useEffect(() => {
    v3Pairs()
  }, [v3Pairs])

  const [chartData, setChartData] = useState([])

  useEffect(() => {
    async function fetchChartData() {
      try {
        const { data } = await voltageSubgraphV3Client.query({
          query: POOLS_CHART_QUERY,
        })

        if (data) {
          const formattedExisting = data.pools.reduce((accm: { [date: number]: any }, pool) => {
            pool.poolDayData.map((dayData) => {
              const { date, tvlUSD, volumeUSD } = dayData
              const roundedDate = parseInt(date)
              const formattedDayData = {
                date: dayData.date,
                volumeUSD: parseFloat(volumeUSD),
                totalValueLockedUSD: parseFloat(tvlUSD),
              }

              if (!accm[roundedDate]) {
                accm[roundedDate] = {
                  tvlUSD: 0,
                  date: roundedDate,
                  volumeUSD: 0,
                }
              }

              accm[roundedDate].tvlUSD = accm[roundedDate].tvlUSD + formattedDayData.totalValueLockedUSD
              accm[roundedDate].volumeUSD = accm[roundedDate].volumeUSD + formattedDayData.volumeUSD
            })

            return accm
          }, {})

          const dateMap = Object.keys(formattedExisting).map((key) => {
            return formattedExisting[parseInt(key)]
          })

          setChartData(dateMap)
        }
      } catch (error) {
        console.error(error)
      }
    }

    fetchChartData()
  }, [])

  return { data, chartData }
}

export const useV3TopPairs = () => {
  const [topPairs, setTopPairs] = useState([])
  const oneDayBlock = useOneDayBlock()

  useEffect(() => {
    async function fetchTopPairs() {
      if (!oneDayBlock) return

      const { data } = await voltageSubgraphV3Client.query({
        query: TOP_PAIRS_QUERY,
        variables: {
          blockNumber: oneDayBlock.number,
        },
        fetchPolicy: 'no-cache',
      })

      const formattedData = data.poolsNow
        .map((poolNow) => {
          const poolPast = data.poolsPast.find((pool) => pool.id === poolNow.id)

          return {
            ...poolNow,
            tvlUSD: parseFloat(poolNow.totalValueLockedUSD),
            volumeUSD: poolPast
              ? parseFloat(poolNow.volumeUSD) - parseFloat(poolPast.volumeUSD)
              : parseFloat(poolNow.volumeUSD),
          }
        })
        .filter((pool) => pool.tvlUSD > 500)
        .sort((poolA, poolB) => poolB.tvlUSD - poolA.tvlUSD)

      setTopPairs(formattedData)
    }

    fetchTopPairs()
  }, [oneDayBlock])

  return topPairs
}
