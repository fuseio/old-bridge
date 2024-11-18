import moment from 'moment'
import { FeeAmount } from '@voltage-finance/v3-sdk'
import { useCallback, useEffect, useState } from 'react'

import { getVoltageV2Pairs } from '../graphql/queries/voltageV2Subgraph'
import { getVoltageV3Pools } from '../graphql/queries/voltageV3Subgraph'

// TODO: move these functions to an utils

const getV2PairRate = (reserve0, reserve1, poolToken0Address, token0Address) => {
  const parsedReserve0 = parseFloat(reserve0)
  const parsedReserve1 = parseFloat(reserve1)

  if (parsedReserve0 === 0 || parsedReserve1 === 0) {
    return 0
  }

  if (poolToken0Address.toLowerCase() === token0Address.toLowerCase()) {
    return parsedReserve0 / parsedReserve1
  } else {
    return parsedReserve1 / parsedReserve0
  }
}

const fetchPairs = async (numberOfDays, token0, token1) => {
  const promises = await Promise.allSettled([
    getVoltageV2Pairs(numberOfDays, token0, token1),
    getVoltageV3Pools(numberOfDays, token0, token1, FeeAmount.LOWEST),
    getVoltageV3Pools(numberOfDays, token0, token1, FeeAmount.LOW),
    getVoltageV3Pools(numberOfDays, token0, token1, FeeAmount.MEDIUM),
    getVoltageV3Pools(numberOfDays, token0, token1, FeeAmount.HIGH),
  ])

  return promises.map((promise) => (promise.status === 'fulfilled' ? promise.value[0] : null))
}

const parsePairs = (token0, v2Pairs, v3PoolsLowest, v3PoolsLow, v3PoolsMedium, v3PoolsHigh) => {
  let pairDayDatas = []

  // Get best v3 pair
  let bestV3Pools = v3PoolsLowest
  for (const v3Pool of [v3PoolsLow, v3PoolsMedium, v3PoolsHigh]) {
    const bestV3PoolTVLUSD = Number(bestV3Pools?.totalValueLockedUSD ?? 0)
    const bestV3PoolDayDataLength = bestV3Pools?.poolDayData.length ?? 0

    const v3PoolTVLUSD = Number(v3Pool?.totalValueLockedUSD ?? 0)
    const v3PoolDayDataLength = v3Pool?.poolDayData.length ?? 0

    if (bestV3PoolDayDataLength >= v3PoolDayDataLength && bestV3PoolTVLUSD >= v3PoolTVLUSD) {
      bestV3Pools = bestV3Pools
    } else if (v3PoolDayDataLength >= bestV3PoolDayDataLength && v3PoolTVLUSD >= bestV3PoolTVLUSD) {
      bestV3Pools = v3Pool
    } else {
      // Default to one with highest TVL
      bestV3Pools = bestV3PoolTVLUSD > v3PoolTVLUSD ? bestV3Pools : v3Pool
    }
  }

  let bestPairs = null
  const v2PairsReserveUSD = Number(v2Pairs?.reserveUSD ?? 0)
  const v2PairslDayDataLength = v2Pairs?.dayData?.length ?? 0

  const bestV3PoolTVLUSD = Number(bestV3Pools?.totalValueLockedUSD ?? 0)
  const bestV3PoolDayDataLength = bestV3Pools?.poolDayData?.length ?? 0

  // Get best pair comparing v2 and v3
  if (v2PairslDayDataLength >= bestV3PoolDayDataLength && v2PairsReserveUSD >= bestV3PoolTVLUSD) {
    bestPairs = v2Pairs
  } else if (bestV3PoolDayDataLength >= v2PairslDayDataLength && bestV3PoolTVLUSD >= v2PairsReserveUSD) {
    bestPairs = bestV3Pools
  } else {
    // Default to one with highest TVL
    bestPairs = v2PairsReserveUSD > bestV3PoolTVLUSD ? v2Pairs : bestV3Pools
  }

  const bestDayDatas = bestPairs?.dayData?.length > 0 ? bestPairs?.dayData : bestPairs?.poolDayData

  if (!bestDayDatas || bestDayDatas.length < 1) {
    return null
  }

  const pairToken0Address = bestPairs?.token0?.id.toLowerCase()
  const chartToken0Address = token0.address.toLowerCase()

  pairDayDatas = bestDayDatas.map((dayData) => {
    let rate
    if (dayData.reserve0 && dayData.reserve1) {
      rate = getV2PairRate(dayData.reserve0, dayData.reserve1, pairToken0Address, chartToken0Address)
    } else {
      rate = pairToken0Address === chartToken0Address ? dayData.token0Price : dayData.token1Price
    }

    return {
      rate,
      timestamp: parseFloat(dayData.date),
      date: moment(dayData.date * 1000).format('YYYY-MM-DD'),
    }
  })

  return pairDayDatas
}

/**
 * Queries the V2 and V3 subgraph and returns the rates of the pair
 *
 * @param numberOfDays
 * @param token0
 * @param token1
 * @returns
 */
export const usePair = (numberOfDays, token0, token1) => {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)

  const voltageExchange = useCallback(async () => {
    setData([])

    if (!token0 || !token1) {
      setLoading(false)
      return []
    } else {
      setLoading(true)
    }

    try {
      const [v2Pairs, v3PoolsLowest, v3PoolsLow, v3PoolsMedium, v3PoolsHigh] = await fetchPairs(
        numberOfDays,
        token0,
        token1
      )

      const pairDayDatas = parsePairs(token0, v2Pairs, v3PoolsLowest, v3PoolsLow, v3PoolsMedium, v3PoolsHigh)

      if (!pairDayDatas || pairDayDatas.length <= 1) {
        setLoading(false)
        return []
      }

      // Order desc
      const orderedPairDayData = [...pairDayDatas].sort((a, b) => {
        const aDate = a.date
        const bDate = b.date

        if (aDate > bDate) {
          return 1
        } else {
          return -1
        }
      })

      setData(orderedPairDayData)
    } catch (e) {
      setData([])
    }

    setLoading(false)
  }, [numberOfDays, token0, token1])

  useEffect(() => {
    voltageExchange()
  }, [voltageExchange])

  return [data, loading] as any
}
