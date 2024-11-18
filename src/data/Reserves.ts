import { Currency, Token, CurrencyAmount } from '@voltage-finance/sdk-core'
import { useMemo } from 'react'
import IVoltagePairABI from '@voltage-finance/core/build/IVoltagePair.json'
import { Interface } from '@ethersproject/abi'
import { useWeb3 } from '../hooks'

import { useMultipleContractSingleData, useSingleCallResult } from '../state/multicall/hooks'
import { wrappedCurrency } from '../utils/wrappedCurrency'
import { usePairContract } from '../hooks/useContract'
import { useToken } from '../hooks/Tokens'
import { BigNumber } from 'ethers'
import { Pair } from '@voltage-finance/sdk'

const PAIR_INTERFACE = new Interface(IVoltagePairABI.abi)

export enum PairState {
  LOADING,
  NOT_EXISTS,
  EXISTS,
  INVALID,
}

interface Reserves {
  reserve0: BigNumber
  reserve1: BigNumber
}

export class BasePair {
  token0: Token
  token1: Token
  reserve0: BigNumber
  reserve1: BigNumber
  totalSupply: BigNumber

  constructor(token0: Token, token1: Token, { reserve0, reserve1 }: Reserves, totalSupply: BigNumber) {
    this.token0 = token0
    this.token1 = token1
    this.reserve0 = reserve0
    this.reserve1 = reserve1
    this.totalSupply = totalSupply
  }

  get name() {
    return `${this.token0.symbol}-${this.token1.symbol}`
  }
}

export function usePairs(currencies: [Currency | undefined, Currency | undefined][]): [PairState, Pair | null][] {
  const { chainId } = useWeb3()

  const tokens = useMemo(
    () =>
      currencies.map(([currencyA, currencyB]) => [
        wrappedCurrency(currencyA, chainId),
        wrappedCurrency(currencyB, chainId),
      ]),
    [chainId, currencies]
  )

  const pairAddresses = useMemo(
    () =>
      tokens.map(([tokenA, tokenB]) => {
        return tokenA && tokenB && !tokenA.equals(tokenB) ? Pair.getAddress(tokenA, tokenB) : undefined
      }),
    [tokens]
  )

  const results = useMultipleContractSingleData(pairAddresses, PAIR_INTERFACE, 'getReserves')

  return useMemo(() => {
    return results.map((result, i) => {
      const { result: reserves, loading } = result
      const tokenA = tokens[i][0]
      const tokenB = tokens[i][1]

      if (loading) return [PairState.LOADING, null]
      if (!tokenA || !tokenB || tokenA.equals(tokenB)) return [PairState.INVALID, null]
      if (!reserves) return [PairState.NOT_EXISTS, null]
      const { reserve0, reserve1 } = reserves
      const [token0, token1] = tokenA.sortsBefore(tokenB) ? [tokenA, tokenB] : [tokenB, tokenA]
      return [
        PairState.EXISTS,
        new Pair(
          CurrencyAmount.fromRawAmount(token0, reserve0.toString()),
          CurrencyAmount.fromRawAmount(token1, reserve1.toString())
        ),
      ]
    })
  }, [results, tokens])
}

export function usePair(tokenA?: Currency, tokenB?: Currency): [PairState, Pair | null] {
  return usePairs([[tokenA, tokenB]])[0]
}

export function usePairAddr(address?: string) {
  const contract = usePairContract(address)

  const token0Address = useSingleCallResult(contract, 'token0')?.result?.[0]
  const token1Address = useSingleCallResult(contract, 'token1')?.result?.[0]
  const reserves = useSingleCallResult(contract, 'getReserves')?.result
  const totalSupply = useSingleCallResult(contract, 'totalSupply')?.result?.[0]

  const token0 = useToken(token0Address)
  const token1 = useToken(token1Address)

  return useMemo(() => {
    if (!token0 || !token1 || !reserves || !totalSupply) return
    return new BasePair(token0, token1, { reserve0: reserves[0], reserve1: reserves[1] }, totalSupply)
  }, [reserves, token0, token1, totalSupply])
}
