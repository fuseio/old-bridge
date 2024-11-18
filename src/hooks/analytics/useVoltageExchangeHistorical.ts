import moment from 'moment'
import { useCallback, useEffect, useState } from 'react'

import { isV2 } from '../../utils'
import { voltageSubgraphClient } from '../../graphql/client'
import { GET_VOLTAGE_TOKENS_BY_TXCOUNT } from '../../graphql/queries/voltageSubgraph'

export const useVoltageExchange = (numberOfDays: number) => {
  const [data, setData] = useState([])

  const voltageExchange = useCallback(async () => {
    const now = moment().utc()
    try {
      const { data } = await voltageSubgraphClient.query({
        query: GET_VOLTAGE_TOKENS_BY_TXCOUNT,
        variables: {
          from: now.clone().subtract(numberOfDays, 'day').unix(),
          first: numberOfDays,
        },
      })

      const results = data?.tokens.map(({ id, name, tokenDayData, ...props }) => {
        return tokenDayData.map(({ totalLiquidityUSD, date, dailyVolumeUSD, priceUSD }) => {
          return {
            name: isV2(id)
              ? `${name === 'VoltToken' ? 'Volt Token' : name} V2`
              : name === 'VoltToken'
              ? 'Volt Token'
              : name,
            id,
            totalLiquidityUSD: parseFloat(totalLiquidityUSD) || 0,
            priceUSD: parseFloat(priceUSD) || 0,
            volumeUSD: parseFloat(dailyVolumeUSD) || 0,
            timestamp: parseFloat(date),
            date: moment.utc(date * 1000).format('YYYY-MM-DD'),
            ...props,
          }
        })
      })

      setData(results)
    } catch (e) {
      return 0
    }
  }, [numberOfDays])

  useEffect(() => {
    voltageExchange()
  }, [voltageExchange])
  
  return data
}
