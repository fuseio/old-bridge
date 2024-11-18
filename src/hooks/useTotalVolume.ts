import { useState, useEffect } from 'react'

import { getFusdDayDatas } from '../graphql/queries/fusdSubgraph'
import { getFusdV3DayDatas } from '../graphql/queries/fusdV3Subgraph'
import { getVeVoltDayDatas } from '../graphql/queries/veVoltSubgraph'
import { getVoltageFactoryData } from '../graphql/queries/voltageSubgraph'
import { getStableswapDayDatas } from '../graphql/queries/stableswapSubgraph'
import { getVoltageV3FactoryData } from '../graphql/queries/voltageV3Subgraph'

const useTotalVolume = () => {
  const [totalVolume, setTotalVolume] = useState(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const v2Volume = await getVoltageFactoryData()
        const v3Volume = await getVoltageV3FactoryData()

        const veVoltDayDatas = await getVeVoltDayDatas(1000)
        const fusdDayDatas = await getFusdDayDatas(1000)
        const fusdV3Daydatas = await getFusdV3DayDatas(1000)
        const stableswapDaydatas = await getStableswapDayDatas(1000)

        let veVoltVolume = 0
        let fusdVolume = 0
        let fusdV3Volume = 0
        let stableswapVolume = 0

        veVoltDayDatas.forEach((dayData) => {
          veVoltVolume += parseFloat(dayData.volumeUSD)
        })

        fusdDayDatas.forEach((dayData) => {
          fusdVolume += parseFloat(dayData.volumeUSD)
        })

        fusdV3Daydatas.forEach((dayData) => {
          fusdV3Volume += parseFloat(dayData.volumeUSD)
        })

        stableswapDaydatas.forEach((dayData) => {
          stableswapVolume += parseFloat(dayData.volume)
        })

        const total =
          parseFloat(v2Volume?.totalVolumeUSD) +
          parseFloat(v3Volume?.totalVolumeUSD) +
          veVoltVolume +
          fusdVolume +
          fusdV3Volume +
          stableswapVolume

        setTotalVolume(total)
      } catch (error) {
        console.error('Error fetching total volume:', error)
      }
    }

    fetchData()
  }, [])

  return totalVolume
}

export default useTotalVolume
