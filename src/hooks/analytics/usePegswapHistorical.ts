import moment from 'moment'
import { useCallback, useEffect, useState } from 'react'

import { isV2 } from '../../utils'
import { getPegswapTokensAndDayDatas } from '../../graphql/queries/pegswapSubgraph'

export const usePegswap = (numberOfDays = 30) => {
  const [data, setData] = useState([])

  const pegswap = useCallback(async () => {
    try {
      const tokensAndDayDatas = await getPegswapTokensAndDayDatas(numberOfDays)

      const results = tokensAndDayDatas.reduce((result, { id, name, dayData }) => {
        dayData.forEach(({ balanceUSD, volumeUSD, priceUSD, timestamp }) => {
          result.push({
            name: isV2(id) ? `${name} V2` : name,
            id,
            totalLiquidityUSD: parseFloat(balanceUSD) || 0,
            priceUSD: parseFloat(priceUSD) || 0,
            volumeUSD: parseFloat(volumeUSD) || 0,
            timestamp: timestamp,
            date: moment.utc(parseFloat(timestamp) * 1000).format('YYYY-MM-DD'),
          })
        })

        return result
      }, [])

      setData(results)
    } catch (e) {
      return []
    }
  }, [numberOfDays])

  useEffect(() => {
    pegswap()
  }, [pegswap])

  return data
}
