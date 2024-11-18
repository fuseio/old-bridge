import useSWR from 'swr'
import { useCallback, useMemo } from 'react'
import { BigNumber } from 'ethers'
import { gql } from '@apollo/client'
import { Currency, Token } from '@voltage-finance/sdk-core'
import { FeeAmount, Pool, POOL_DEPLOYER_ADDRESS, TickMath, tickToPrice, TICK_SPACINGS } from '@voltage-finance/v3-sdk'

import { useWeb3 } from '..'
import { PoolState, usePool } from '../usePools'
import { voltageSubgraphV3Client } from '../../graphql/client'

const PRICE_FIXED_DIGITS = 8

type AllV3TicksQuery = {
  ticks: Array<{
    tick: string
    liquidityNet: string
    liquidityGross: string
  }>
}

type Ticks = AllV3TicksQuery['ticks']

async function getPoolTicks(chainId: number, poolAddress: string, blockNumber?: string): Promise<Ticks> {
  const PAGE_SIZE = 1000
  let allTicks: any[] = []
  let lastTick = TickMath.MIN_TICK - 1
  // eslint-disable-next-line no-constant-condition
  while (true) {
    // eslint-disable-next-line no-await-in-loop
    const ticks = await _getPoolTicksGreaterThan(chainId, poolAddress, lastTick, PAGE_SIZE, blockNumber)
    allTicks = [...allTicks, ...ticks]
    const hasMore = ticks.length === PAGE_SIZE

    if (!hasMore) {
      break
    }
    lastTick = Number(ticks[ticks.length - 1].tick)
  }
  return allTicks
}

async function _getPoolTicksGreaterThan(
  chainId: number,
  poolAddress: string,
  tick: number,
  pageSize: number,
  blockNumber?: string
) {
  const response = await voltageSubgraphV3Client.query({
    query: gql`
      query AllV3Ticks($poolAddress: String!) {
        ticks(where: { poolAddress: $poolAddress }, orderBy: tickIdx, orderDirection: asc, liquidityNet_not: "0") {
          tick: tickIdx
          liquidityNet
          liquidityGross
        }
      }
    `,
    variables: {
      poolAddress: poolAddress.toLowerCase(),
    },
  })
  return response?.data?.ticks
}

function useAllV3TicksQuery(poolAddress: string | undefined) {
  const { chainId } = useWeb3()

  const { data, error } = useSWR([`useAllV3TicksQuery-${poolAddress}-${chainId}`], async () => {
    if (!chainId || !poolAddress) return undefined
    return getPoolTicks(chainId, poolAddress)
  })

  return useMemo(
    () => ({
      error,
      data,
    }),
    [data, error]
  )
}

function computeSurroundingTicks(
  token0: Token,
  token1: Token,
  activeTickProcessed: any,
  sortedTickData: Ticks,
  pivot: number,
  ascending: boolean
): any[] {
  let previousTickProcessed = {
    ...activeTickProcessed,
  }
  // Iterate outwards (either up or down depending on direction) from the active tick,
  // building active liquidity for every tick.
  let processedTicks: any[] = []
  for (let i = pivot + (ascending ? 1 : -1); ascending ? i < sortedTickData.length : i >= 0; ascending ? i++ : i--) {
    const tick = Number(sortedTickData[i].tick)
    const currentTickProcessed = {
      liquidityActive: previousTickProcessed.liquidityActive,
      tick,
      liquidityNet: BigNumber.from(sortedTickData[i].liquidityNet),
      price0: tickToPrice(token0, token1, tick).toFixed(PRICE_FIXED_DIGITS),
      price1: tickToPrice(token1, token0, tick).toFixed(PRICE_FIXED_DIGITS),

      isActive: false,
    }

    // Update the active liquidity.
    // If we are iterating ascending and we found an initialized tick we immediately apply
    // it to the current processed tick we are building.
    // If we are iterating descending, we don't want to apply the net liquidity until the following tick.
    if (ascending) {
      currentTickProcessed.liquidityActive =
        previousTickProcessed.liquidityActive + BigNumber.from(sortedTickData[i].liquidityNet)
    } else if (!ascending && previousTickProcessed.liquidityNet !== BigNumber.from(0)) {
      // We are iterating descending, so look at the previous tick and apply any net liquidity.
      currentTickProcessed.liquidityActive = previousTickProcessed.liquidityActive - previousTickProcessed.liquidityNet
    }

    processedTicks.push(currentTickProcessed)
    previousTickProcessed = currentTickProcessed
  }

  if (!ascending) {
    processedTicks = processedTicks.reverse()
  }

  return processedTicks
}

const getActiveTick = (tickCurrent: number | undefined, feeAmount: FeeAmount | undefined) =>
  tickCurrent !== undefined && feeAmount
    ? Math.floor(tickCurrent / TICK_SPACINGS[feeAmount]) * TICK_SPACINGS[feeAmount]
    : undefined

function useTicksFromSubgraph(
  currencyA: Currency | undefined,
  currencyB: Currency | undefined,
  feeAmount: FeeAmount | undefined
) {
  const poolAddress =
    currencyA && currencyB && feeAmount
      ? Pool.getAddress(currencyA?.wrapped, currencyB?.wrapped, feeAmount, undefined, POOL_DEPLOYER_ADDRESS)
      : undefined

  return useAllV3TicksQuery(poolAddress)
}

const getPoolV3Address = (currencyA, currencyB, feeAmount) => {
  const poolAddress =
    currencyA && currencyB && feeAmount
      ? Pool.getAddress(currencyA?.wrapped, currencyB?.wrapped, feeAmount, undefined, POOL_DEPLOYER_ADDRESS)
      : undefined
  return poolAddress
}

function useAllV3Ticks(
  currencyA: Currency | undefined,
  currencyB: Currency | undefined,
  feeAmount: FeeAmount | undefined
): {
  error: unknown
  ticks: any[] | undefined
} {
  const subgraphTickData = useTicksFromSubgraph(currencyA, currencyB, feeAmount)

  return {
    error: subgraphTickData.error,
    ticks: subgraphTickData.data,
  }
}

function usePoolActiveLiquidity(
  currencyA: Currency | undefined,
  currencyB: Currency | undefined,
  feeAmount: FeeAmount | undefined
): {
  isLoading: boolean
  error: any
  activeTick: number | undefined
  data: any[] | undefined
} {
  const pool = usePool(currencyA, currencyB, feeAmount)

  const activeTick = useMemo(() => getActiveTick(pool[1]?.tickCurrent, feeAmount), [pool, feeAmount])

  const { error, ticks } = useAllV3Ticks(currencyA, currencyB, feeAmount)

  return useMemo(() => {
    if (
      !currencyA ||
      !currencyB ||
      activeTick === undefined ||
      pool[0] !== PoolState.EXISTS ||
      !ticks ||
      ticks.length === 0
    ) {
      return {
        isLoading: pool[3],
        error: pool[2] || error,
        activeTick,
        data: undefined,
      }
    }

    const token0 = currencyA?.wrapped
    const token1 = currencyB?.wrapped

    // find where the active tick would be to partition the array
    // if the active tick is initialized, the pivot will be an element
    // if not, take the previous tick as pivot
    const pivot = ticks.findIndex(({ tick }) => Number(tick) > activeTick) - 1
    if (pivot < 0) {
      // consider setting a local error
      console.error('TickData pivot not found')
      return {
        isLoading: false,
        error: pool[2] || error,
        activeTick,
        data: undefined,
      }
    }

    const activeTickProcessed = {
      liquidityActive: BigNumber.from(pool[1]?.liquidity?.toString() ?? 0),
      tick: activeTick,
      liquidityNet:
        Number(ticks[pivot].tick) === activeTick ? BigNumber.from(ticks[pivot].liquidityNet) : BigNumber.from('0'),
      price0: tickToPrice(token0, token1, activeTick).toFixed(PRICE_FIXED_DIGITS),
      price1: tickToPrice(token1, token0, activeTick).toFixed(PRICE_FIXED_DIGITS),
    }

    const subsequentTicks = computeSurroundingTicks(token0, token1, activeTickProcessed, ticks, pivot, true)
    const previousTicks = computeSurroundingTicks(token0, token1, activeTickProcessed, ticks, pivot, false)

    const ticksProcessed = previousTicks.concat(activeTickProcessed).concat(subsequentTicks)

    return {
      isLoading: false,
      error: pool[2] || error,
      activeTick,
      data: ticksProcessed,
    }
  }, [activeTick, currencyA, currencyB, error, pool, ticks])
}

export function useDensityChartData({
  currencyA,
  currencyB,
  feeAmount,
}: {
  currencyA: Currency | undefined
  currencyB: Currency | undefined
  feeAmount: FeeAmount | undefined
}) {
  const { error, data: ticks = [], isLoading } = usePoolActiveLiquidity(currencyA, currencyB, feeAmount)

  const formatData = useCallback(() => {
    if (!ticks.length) {
      return undefined
    }

    const newData: any[] = []

    for (let i = 0; i < ticks.length; i++) {
      const t = ticks[i]

      const chartEntry = {
        activeLiquidity: parseFloat(t.liquidityActive.toString()),
        price0: parseFloat(t.price0),
      }

      if (chartEntry.activeLiquidity > 0) {
        newData.push(chartEntry)
      }
    }

    return newData
  }, [ticks])

  return useMemo(() => {
    return {
      isLoading,
      error,
      formattedData: formatData() ?? undefined,
    }
  }, [error, formatData])
}
