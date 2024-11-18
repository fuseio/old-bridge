import { useMemo } from 'react'
import { useVoltBarStats, useVoltPrice } from '../graphql/hooks'

export const useXVOLTPrice = () => {
  const voltBarStats = useVoltBarStats()
  const ratio = useMemo(() => voltBarStats?.bars[0]?.ratio, [voltBarStats])
  const voltPrice = useVoltPrice()
  return voltPrice / ratio
}
