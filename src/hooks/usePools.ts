import JSBI from 'jsbi'
import { useMemo } from 'react'
import { Interface } from '@ethersproject/abi'
import { BigintIsh, Currency, Token, V3_CORE_FACTORY_ADDRESSES } from '@voltage-finance/sdk-core'
import { computePoolAddress, FeeAmount, Pool, POOL_DEPLOYER_ADDRESS } from '@voltage-finance/v3-sdk'

import { useWeb3 } from '.'
import { getReadContract } from '../utils'
import { fuseReadProvider } from '../connectors'
import { useMultipleContractSingleData } from '../state/multicall/hooks'

import IVoltageV3PoolStateJSON from '@voltage-finance/v3-core/artifacts/contracts/interfaces/pool/IVoltageV3PoolState.sol/IVoltageV3PoolState.json'

const POOL_STATE_INTERFACE = new Interface(IVoltageV3PoolStateJSON.abi) as any

type PoolInfo = [PoolState, Pool | null, boolean, boolean]

// Classes are expensive to instantiate, so this caches the recently instantiated pools.
// This avoids re-instantiating pools as the other pools in the same request are loaded.
class PoolCache {
  // Evict after 128 entries. Empirically, a swap uses 64 entries.
  private static MAX_ENTRIES = 128

  // These are FIFOs, using unshift/pop. This makes recent entries faster to find.
  private static pools: Pool[] = []
  private static addresses: { key: string; address: string }[] = []

  static getPoolAddress(factoryAddress: string, tokenA: Token, tokenB: Token, fee: FeeAmount): string {
    if (this.addresses.length > this.MAX_ENTRIES) {
      this.addresses = this.addresses.slice(0, this.MAX_ENTRIES / 2)
    }

    const { address: addressA } = tokenA
    const { address: addressB } = tokenB
    const key = `${factoryAddress}:${addressA}:${addressB}:${fee.toString()}`
    const found = this.addresses.find((address) => address.key === key)
    if (found) return found.address

    const address = {
      key,
      address: computePoolAddress({
        factoryAddress,
        tokenA,
        tokenB,
        fee,
      }),
    }

    this.addresses.unshift(address)
    return address.address
  }

  static getPool(
    tokenA: Token,
    tokenB: Token,
    fee: FeeAmount,
    sqrtPriceX96: BigintIsh,
    liquidity: BigintIsh,
    tick: number
  ): Pool {
    if (this.pools.length > this.MAX_ENTRIES) {
      this.pools = this.pools.slice(0, this.MAX_ENTRIES / 2)
    }

    const found = this.pools.find(
      (pool) =>
        pool.token0 === tokenA &&
        pool.token1 === tokenB &&
        pool.fee === fee &&
        JSBI.EQ(pool.sqrtRatioX96, sqrtPriceX96) &&
        JSBI.EQ(pool.liquidity, liquidity) &&
        pool.tickCurrent === tick
    )
    if (found) return found

    const pool = new Pool(tokenA, tokenB, fee, sqrtPriceX96, liquidity, tick)
    this.pools.unshift(pool)
    return pool
  }
}

export enum PoolState {
  LOADING,
  NOT_EXISTS,
  EXISTS,
  INVALID,
}

export function usePools(poolKeys: [Currency | undefined, Currency | undefined, FeeAmount | undefined][]): PoolInfo[] {
  const { chainId } = useWeb3()

  const poolTokens: ([Token, Token, FeeAmount] | undefined)[] = useMemo(() => {
    if (!chainId) {
      return new Array(poolKeys.length)
    }

    return poolKeys.map(([currencyA, currencyB, feeAmount]) => {
      if (currencyA && currencyB && feeAmount) {
        const tokenA = currencyA.wrapped
        const tokenB = currencyB.wrapped

        if (tokenA.equals(tokenB)) {
          return undefined
        }

        return tokenA.sortsBefore(tokenB) ? [tokenA, tokenB, feeAmount] : [tokenB, tokenA, feeAmount]
      } else {
        return undefined
      }
    })
  }, [chainId, poolKeys])

  const poolAddresses: (string | undefined)[] = useMemo(() => {
    const v3CoreFactoryAddress = chainId && V3_CORE_FACTORY_ADDRESSES[chainId]
    if (!v3CoreFactoryAddress) return new Array(poolTokens.length)

    return poolTokens.map((value) => value && PoolCache.getPoolAddress(POOL_DEPLOYER_ADDRESS, ...value))
  }, [chainId, poolTokens])

  const slot0s = useMultipleContractSingleData(poolAddresses, POOL_STATE_INTERFACE, 'slot0')
  const liquidities = useMultipleContractSingleData(poolAddresses, POOL_STATE_INTERFACE, 'liquidity')

  const fetchError = slot0s[0].error || liquidities[0].error
  const isLoading = slot0s[0].loading || liquidities[0].loading

  return useMemo(() => {
    return poolKeys.map((_key, index) => {
      const tokens = poolTokens[index]

      if (!tokens || !slot0s[index] || !liquidities[index]) {
        return [PoolState.INVALID, null, fetchError, isLoading]
      }

      const [token0, token1, fee] = tokens
      const { result: slot0, loading: slot0Loading } = slot0s[index]
      const { result: liquidity, loading: liquidityLoading } = liquidities[index]

      if (slot0Loading || liquidityLoading) {
        return [PoolState.LOADING, null, fetchError, isLoading]
      }
      if (!tokens) {
        return [PoolState.INVALID, null, fetchError, isLoading]
      }
      if (!slot0 || !liquidity || !slot0.sqrtPriceX96 || slot0.sqrtPriceX96.eq(0)) {
        return [PoolState.NOT_EXISTS, null, fetchError, isLoading]
      }

      try {
        const pool = PoolCache.getPool(token0, token1, fee, slot0.sqrtPriceX96, liquidity[0], slot0.tick)
        return [PoolState.EXISTS, pool, fetchError, isLoading]
      } catch (error) {
        console.error('Error when constructing the pool', error)
        return [PoolState.NOT_EXISTS, null, fetchError, isLoading]
      }
    })
  }, [poolKeys, poolTokens, slot0s, liquidities, fetchError, isLoading])
}

export function usePool(currencyA: Currency, currencyB: Currency, feeAmount: FeeAmount): PoolInfo {
  const poolKeys: [Currency, Currency, FeeAmount][] = [[currencyA, currencyB, feeAmount]]
  const pools = usePools(poolKeys)

  return pools[0]
}

export async function getPool(address: string) {
  const poolContract = getReadContract(address, POOL_STATE_INTERFACE, fuseReadProvider)

  const { tick, sqrtPriceX96 } = await poolContract.slot0()

  const liquidity = await poolContract.liquidity()

  return { tick, sqrtPriceX96, liquidity }
}
