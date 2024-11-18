import moment from 'moment'
import { useCallback, useEffect, useState } from 'react'

import { getVoltageV2Tokens } from '../graphql/queries/voltageV2Subgraph'
import { getVoltageV3Tokens } from '../graphql/queries/voltageV3Subgraph'

const fetchToken = async (numberOfDays, token0) => {
  const promises = await Promise.allSettled([
    getVoltageV2Tokens(numberOfDays, token0),
    getVoltageV3Tokens(numberOfDays, token0),
  ])

  return promises.map((promise) => (promise.status === 'fulfilled' ? promise.value[0] : null))
}

/**
 * Queries the V2 and V3 subgraph and returns the USD price of the token
 *
 * @param numberOfDays
 * @param token
 * @returns
 */
export const useVoltageExchange = (numberOfDays, token) => {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)

  const voltageExchange = useCallback(async () => {
    setData([])

    try {
      const [v2Token, v3Token] = await fetchToken(numberOfDays, token)

      if (!v2Token && !v3Token) {
        setLoading(false)
        return []
      } else {
        setLoading(true)
      }

      // Tokens can be on pairs from both exchanges. We have to decide which is better based on length of data and liquidity
      const v2Liquidity = Number(v2Token?.liquidity ?? 0)
      const v2TokenDayDataLength = v2Token?.dayData?.length ?? 0

      const v3TVL = Number(v3Token?.totalValueLockedUSD ?? 0)
      const v3TokenDayDataLength = v3Token?.tokenDayData?.length ?? 0

      let tokenDayData = []
      if (v2TokenDayDataLength >= v3TokenDayDataLength && v2Liquidity >= v3TVL) {
        tokenDayData = v2Token?.dayData
      } else if (v3TokenDayDataLength >= v2TokenDayDataLength && v3TVL >= v2Liquidity) {
        tokenDayData = v3Token?.tokenDayData
      } else {
        // Default to one with highest TVL
        tokenDayData = v2Liquidity > v3TVL ? v2Token?.dayData : v3Token?.tokenDayData
      }

      const parsedTokenDayData = tokenDayData.map((dayData) => {
        const { priceUSD } = dayData
        const date = dayData?.date ? dayData.date : dayData.timestamp

        return {
          priceUSD: Number(priceUSD),
          timestamp: parseFloat(date),
          date: moment(date * 1000).format('YYYY-MM-DD'),
        }
      })

      // Order desc
      const orderedTokenDayData = [...parsedTokenDayData].sort((a, b) => {
        const aDate = a.date
        const bDate = b.date

        if (aDate > bDate) {
          return 1
        } else {
          return -1
        }
      })

      setData(orderedTokenDayData)
    } catch (e) {
      setData([])
    }

    setLoading(false)
  }, [numberOfDays, token])

  useEffect(() => {
    voltageExchange()
  }, [voltageExchange])

  return [data, loading] as any
}
