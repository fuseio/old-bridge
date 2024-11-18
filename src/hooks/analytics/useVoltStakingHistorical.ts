import moment from 'moment'
import { useCallback, useEffect, useState } from 'react'

import { ChainId } from '../../constants/chains'
import { VEVOLT_ADDRESS } from '../../constants/addresses'
import { getVeVoltDayDatas } from '../../graphql/queries/veVoltSubgraph'

export const useVevolt = (numberOfDays: number) => {
  const [data, setData] = useState([])

  const veVoltStaking = useCallback(async () => {
    try {
      const dayDatas = await getVeVoltDayDatas(numberOfDays)

      const parsedDayDatas = dayDatas.map(({ timestamp, balanceUSD, volumeUSD }) => {
        return {
          id: VEVOLT_ADDRESS[ChainId.FUSE].toLowerCase(),
          name: 'veVOLT',
          symbol: 'veVOLT',
          totalLiquidityUSD: parseFloat(balanceUSD) || 0,
          volumeUSD: parseFloat(volumeUSD) || 0,
          timestamp: timestamp,
          date: moment.utc(parseFloat(timestamp) * 1000).format('YYYY-MM-DD'),
        }
      })

      setData(parsedDayDatas)
    } catch (e) {
      return []
    }
  }, [])

  useEffect(() => {
    veVoltStaking()
  }, [veVoltStaking])

  return data
}
