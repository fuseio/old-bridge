import { Currency, Rounding } from "@voltage-finance/sdk-core"
import { FeeAmount, Pool, tickToPrice, TICK_SPACINGS } from "@voltage-finance/v3-sdk"
import { useMemo, useCallback } from "react"
import { useDispatch } from 'react-redux'
import { AppDispatch } from "../../state"
import { setFullRange } from "../../state/mint/v3/actions"

export function useRangeHopCallbacks(
    baseCurrency: Currency | undefined,
    quoteCurrency: Currency | undefined,
    feeAmount: FeeAmount | undefined,
    tickLower: number | undefined,
    tickUpper: number | undefined,
    pool?: Pool | undefined | null,
  ) {
    const dispatch = useDispatch<AppDispatch>()

    const baseToken = useMemo(() => baseCurrency?.wrapped, [baseCurrency])
    const quoteToken = useMemo(() => quoteCurrency?.wrapped, [quoteCurrency])
  
    const getDecrementLower = useCallback(() => {
      if (baseToken && quoteToken && typeof tickLower === 'number' && feeAmount) {
        const newPrice = tickToPrice(baseToken, quoteToken, tickLower - TICK_SPACINGS[feeAmount])
        return newPrice.toSignificant(5, undefined, Rounding.ROUND_DOWN)
      }
      // use pool current tick as starting tick if we have pool but no tick input
      if (!(typeof tickLower === 'number') && baseToken && quoteToken && feeAmount && pool) {
        const newPrice = tickToPrice(baseToken, quoteToken, pool.tickCurrent - TICK_SPACINGS[feeAmount])
        return newPrice.toSignificant(5, undefined, Rounding.ROUND_DOWN)

      }
      return ''
    }, [baseToken, quoteToken, tickLower, feeAmount, pool])
  
    const getIncrementLower = useCallback(() => {
      if (baseToken && quoteToken && typeof tickLower === 'number' && feeAmount) {
        const newPrice = tickToPrice(baseToken, quoteToken, tickLower + TICK_SPACINGS[feeAmount])
        return newPrice.toSignificant(5, undefined, Rounding.ROUND_DOWN)

      }
      // use pool current tick as starting tick if we have pool but no tick input
      if (!(typeof tickLower === 'number') && baseToken && quoteToken && feeAmount && pool) {
        const newPrice = tickToPrice(baseToken, quoteToken, pool.tickCurrent + TICK_SPACINGS[feeAmount])
        return newPrice.toSignificant(5, undefined, Rounding.ROUND_DOWN)
      }
      return ''
    }, [baseToken, quoteToken, tickLower, feeAmount, pool])
  
    const getDecrementUpper = useCallback(() => {
      if (baseToken && quoteToken && typeof tickUpper === 'number' && feeAmount) {
        const newPrice = tickToPrice(baseToken, quoteToken, tickUpper - TICK_SPACINGS[feeAmount])
        return newPrice.toSignificant(5, undefined, Rounding.ROUND_DOWN)

      }
      // use pool current tick as starting tick if we have pool but no tick input
      if (!(typeof tickUpper === 'number') && baseToken && quoteToken && feeAmount && pool) {
        const newPrice = tickToPrice(baseToken, quoteToken, pool.tickCurrent - TICK_SPACINGS[feeAmount])
        return newPrice.toSignificant(5, undefined, Rounding.ROUND_DOWN)
      }
      return ''
    }, [baseToken, quoteToken, tickUpper, feeAmount, pool])
  
    const getIncrementUpper = useCallback(() => {
      if (baseToken && quoteToken && typeof tickUpper === 'number' && feeAmount) {
        const newPrice = tickToPrice(baseToken, quoteToken, tickUpper + TICK_SPACINGS[feeAmount])
        return newPrice.toSignificant(5, undefined, Rounding.ROUND_DOWN)
      }
      // use pool current tick as starting tick if we have pool but no tick input
      if (!(typeof tickUpper === 'number') && baseToken && quoteToken && feeAmount && pool) {
        const newPrice = tickToPrice(baseToken, quoteToken, pool.tickCurrent + TICK_SPACINGS[feeAmount])
        return newPrice.toSignificant(5, undefined, Rounding.ROUND_DOWN)
      }
      return ''
    }, [baseToken, quoteToken, tickUpper, feeAmount, pool])
  
    const getSetFullRange = useCallback(() => {
      dispatch(setFullRange())
    }, [dispatch])
  
    return { getDecrementLower, getIncrementLower, getDecrementUpper, getIncrementUpper, getSetFullRange }
  }