import moment from 'moment'
import { useCallback, useEffect, useState } from 'react'

import { S_FUSE_LIQUID_STAKING_ADDRESS } from '../../constants'
import { getFuseLiquidStakingDayDatas } from '../../graphql/queries/fuseLiquidStakingSubgraph'

export const useLiquidStaking = (numberOfDays: number) => {
  const [data, setData] = useState([])

  const liquidStaking = useCallback(async () => {
    try {
      const dayDatas = await getFuseLiquidStakingDayDatas(numberOfDays)

      const parsedDayDatas = dayDatas.map(({ timestamp, priceUSD, balanceUSD, volumeUSD }) => {
        return {
          id: S_FUSE_LIQUID_STAKING_ADDRESS.toLowerCase(),
          name: 'sFUSE',
          symbol: 'sFUSE',
          totalLiquidityUSD: parseFloat(balanceUSD) || 0,
          priceUSD: parseFloat(priceUSD) || 0,
          volumeUSD: parseFloat(volumeUSD) || 0,
          timestamp: timestamp,
          date: moment.utc(parseFloat(timestamp) * 1000).format('YYYY-MM-DD'),
        }
      })

      setData(parsedDayDatas)
    } catch (e) {
      return []
    }
  }, [numberOfDays])

  useEffect(() => {
    liquidStaking()
  }, [liquidStaking])

  return data
}
