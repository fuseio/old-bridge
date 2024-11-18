import moment from 'moment'
import { flattenDeep } from 'lodash'
import { useCallback, useEffect, useState } from 'react'

import { fusdClient, fusdClientV3 } from '../../graphql/client'
import { FUSD_ADDRESS, FUSD_ADDRESS_V3 } from '../../constants'
import { GET_FUSD_TVL_QUERY } from '../../graphql/queries/fusdSubgraph'

export const useFuseDollar = (numberOfDays = 30) => {
  const [data, setData] = useState([])

  const formatData = (data: any, name: string, symbol: string, address: string) =>
    data.map(({ timestamp, priceUSD, balanceUSD, volumeUSD }) => ({
      id: address.toLowerCase(),
      name,
      symbol,
      totalLiquidityUSD: parseFloat(balanceUSD) || 0,
      priceUSD: parseFloat(priceUSD) || 0,
      volumeUSD: parseFloat(volumeUSD) || 0,
      timestamp: parseFloat(timestamp),
      date: moment.utc(parseFloat(timestamp) * 1000).format('YYYY-MM-DD'),
    }))

  const fusd = useCallback(async () => {
    const now = moment().utc()
    
    try {
      const fromV3 = parseInt((now.clone().subtract(360, 'day').unix() / 86400).toFixed(0))
      const fromV2 = parseInt((now.clone().subtract(numberOfDays, 'day').unix() / 86400).toFixed(0))

      const [{ data: dataV3, data: dataV2 }] = await Promise.all([
        fusdClientV3.query({ query: GET_FUSD_TVL_QUERY, variables: { from: fromV3, first: numberOfDays } }),
        fusdClient.query({ query: GET_FUSD_TVL_QUERY, variables: { from: fromV2, first: numberOfDays } }),
      ])

      setData(
        flattenDeep([
          ...formatData(dataV2?.dayDatas, 'fUSD V2', 'fUSD V2', FUSD_ADDRESS),
          ...formatData(dataV3?.dayDatas, 'fUSD V3', 'fUSD V3', FUSD_ADDRESS_V3),
        ])
      )
    } catch (e) {
      return 0
    }
  }, [numberOfDays])

  useEffect(() => {
    fusd()
  }, [fusd])

  return data
}
