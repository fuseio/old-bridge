import { BigintIsh } from '@voltage-finance/sdk-core'
import { FeeAmount, Pool, Position } from '@voltage-finance/v3-sdk'

import { useCurrency } from './Tokens'
import { usePool } from './usePools'

type PositionDetails = {
  token0: string
  token1: string
  fee: FeeAmount
  liquidity: BigintIsh
  tickLower: number
  tickUpper: number
}

export function useDerivedPositionInfo(positionDetails: PositionDetails | undefined): {
  position?: Position
  pool?: Pool
} {
  const currency0 = useCurrency(positionDetails?.token0)
  const currency1 = useCurrency(positionDetails?.token1)

  // construct pool data
  const [, pool] = usePool(currency0, currency1, positionDetails?.fee)

  let position = undefined
  if (pool && positionDetails) {
    position = new Position({
      pool,
      liquidity: positionDetails.liquidity.toString(),
      tickLower: positionDetails.tickLower,
      tickUpper: positionDetails.tickUpper,
    })
  }

  return {
    position,
    pool: pool,
  }
}
