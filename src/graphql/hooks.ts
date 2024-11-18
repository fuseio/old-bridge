import useSWR from 'swr'
import dayjs from 'dayjs'
import { useMemo } from 'react'
import { addSeconds, getUnixTime, startOfMinute, subDays } from 'date-fns'

import { Chef } from '../state/chefs/hooks'
import { getMasterChefV3Farms } from './queries/masteChefV3Subgraph'
import { FUSE_BUSD, FUSD_DEPRECATED, FUSE_USDC, FUSE_USDT, FUSE_UST, SECONDS_IN_DAY } from '../constants'
import {
  getBlock,
  getDayDatas,
  getFactory,
  getFusdLiquidity,
  getFusdLiquidityV3,
  getFuseswapLiquidityPositions,
  getLPPrice,
  getNativePrice,
  getSFusePrice,
  getStableswapTokenBalances,
  getTokenPrice,
  getVoltBarStats,
  getVoltPrice,
  getXVoltPrice,
  tokenPriceQuery,
} from './queries'

interface UseChefFarmProps {
  shouldFetch?: boolean
}

export function useMasterChefV3Farms({ shouldFetch }: UseChefFarmProps) {
  const { data } = useSWR(shouldFetch ? 'masterChefV3Farms' : null, () => getMasterChefV3Farms())
  return useMemo(() => {
    if (!data) return []
    return data.map((data: any) => ({ ...data, type: 'chef', chef: Chef.MASTERCHEF_V3 }))
  }, [data])
}

export function useFusePrice() {
  const { data } = useSWR('fusePrice', () => getNativePrice())
  return data
}

export function useSFusePrice() {
  const { data } = useSWR('sFusePrice', () => getSFusePrice())
  return data
}

export function useVoltPrice() {
  const { data } = useSWR('voltPrice', () => getVoltPrice())
  return data
}

export function useXVoltPrice() {
  const { data } = useSWR('xVoltPrice', () => getXVoltPrice())
  return data
}
export const useFusdTokenPrice = () => {
  const { data: fusd } = useSWR('fusdPrice', () =>
    getTokenPrice(tokenPriceQuery, { id: FUSD_DEPRECATED.address.toLowerCase() })
  )
  return fusd
}
export function useStablecoinPrices() {
  // Stablecoin prices for the stable pool
  const { data: fusd } = useSWR('fusdPrice', () =>
    getTokenPrice(tokenPriceQuery, { id: FUSD_DEPRECATED.address.toLowerCase() })
  )
  const { data: usdt } = useSWR('usdtPrice', () =>
    getTokenPrice(tokenPriceQuery, { id: FUSE_USDT.address.toLowerCase() })
  )
  const { data: usdc } = useSWR('usdcPrice', () =>
    getTokenPrice(tokenPriceQuery, { id: FUSE_USDC.address.toLowerCase() })
  )
  const { data: busd } = useSWR('busdPrice', () =>
    getTokenPrice(tokenPriceQuery, { id: FUSE_BUSD.address.toLowerCase() })
  )
  const { data: ust } = useSWR('ustPrice', () => getTokenPrice(tokenPriceQuery, { id: FUSE_UST.address.toLowerCase() }))

  return {
    [FUSD_DEPRECATED.address]: fusd,
    [FUSE_USDT.address]: usdt,
    [FUSE_USDC.address]: usdc,
    [FUSE_BUSD.address]: busd,
    [FUSE_UST.address]: ust,
  }
}

export function useStableswapSubgraphLiquidity() {
  const { data } = useSWR('stableswapBalances', () => getStableswapTokenBalances())

  return data
}

export function useBlock(variables: any, shouldFetch = true) {
  const { data } = useSWR(shouldFetch ? ['block'] : null, () => getBlock(variables))
  return data
}

export function useVoltBarStats(
  length = 1,
  start: number = Math.floor(dayjs().unix() / SECONDS_IN_DAY),
  shouldFetch = true
) {
  const data = useSWR(shouldFetch ? ['voltBarStats', start.toString(), length.toString()] : null, () =>
    getVoltBarStats({ start: start.toString(), length })
  )
  return data.data
}

export function useOneDayBlock(shouldFetch = true) {
  const date = startOfMinute(subDays(Date.now(), 1))
  const start = getUnixTime(date)
  const end = getUnixTime(addSeconds(date, 600))

  return useBlock(
    {
      timestampFrom: start,
      timestampTo: end,
    },
    shouldFetch
  )
}

export function useFactory(variables?: any, shouldFetch = true) {
  const { data } = useSWR(shouldFetch ? ['factory', JSON.stringify(variables)] : null, () => getFactory(variables))
  return data
}

export function useFuseswapLiquidityPositions(variables?: any, shouldFetch = true) {
  const { data } = useSWR(shouldFetch ? ['liquidityPositions', JSON.stringify(variables)] : null, () =>
    getFuseswapLiquidityPositions(variables)
  )
  return data
}

export function useLPPrice(variables?: any) {
  const { data } = useSWR('lpPrice', () => getLPPrice(variables))
  return data
}

export function useFusdLiquidity() {
  const { data } = useSWR('fusdLiquidity', () => getFusdLiquidity())
  return data
}

export function useFusdLiquidityV3() {
  const { data } = useSWR('fusdLiquidityV3', () => getFusdLiquidityV3())
  return data
}

export function useDayDatas(variables?: any) {
  const { data } = useSWR('dayDatas', () => getDayDatas(variables))
  return data
}
