import { Currency, CurrencyAmount } from '@voltage-finance/sdk-core'
import { Pool } from '@voltage-finance/v3-sdk'
import { BigNumber } from 'ethers'
import { useEffect, useMemo, useState } from 'react'
import { useBlockNumber } from '../state/application/hooks'
import { useSingleCallResult, useSingleContractMultipleData } from '../state/multicall/hooks'
import { unwrappedToken } from '../utils/wrappedCurrency'
import { useV3NFTPositionManagerContract } from './useContract'

const MAX_UINT128 = BigNumber.from(2).pow(BigNumber.from(128).sub(1))

interface UseV3PositionsResults {
  loading: boolean
  positions?: any[]
}

function useV3PositionsFromTokenIds(tokenIds: BigNumber[] | undefined): UseV3PositionsResults {
  const positionManager = useV3NFTPositionManagerContract()
  const inputs = useMemo(() => (tokenIds ? tokenIds.map((tokenId) => [tokenId.toString()]) : []), [tokenIds])
  const results = useSingleContractMultipleData(positionManager, 'positions', inputs)

  const loading = useMemo(() => results.some(({ loading }) => loading), [results])
  const error = useMemo(() => results.some(({ error }) => error), [results])

  const positions = useMemo(() => {
    if (!loading && !error && tokenIds) {
      return results.map((call, i) => {
        if (!call.result) {
          return
        }

        const tokenId = tokenIds[i]
        const result = call.result
        return {
          tokenId,
          fee: result.fee,
          feeGrowthInside0LastX128: result.feeGrowthInside0LastX128,
          feeGrowthInside1LastX128: result.feeGrowthInside1LastX128,
          liquidity: result.liquidity,
          nonce: result.nonce,
          operator: result.operator,
          tickLower: result.tickLower,
          tickUpper: result.tickUpper,
          token0: result.token0,
          token1: result.token1,
          tokensOwed0: result.tokensOwed0,
          tokensOwed1: result.tokensOwed1,
        }
      })
    }
  }, [loading, error, results, tokenIds])

  return {
    loading,
    positions,
  }
}

interface UseV3PositionResults {
  loading: boolean
  position?: any
}

export function useV3PositionFromTokenId(tokenId: BigNumber | undefined): UseV3PositionResults {
  const position = useV3PositionsFromTokenIds(tokenId ? [tokenId] : undefined)
  return {
    loading: position.loading,
    position: position.positions?.[0],
  }
}

export function useV3Positions(account: string | null | undefined): UseV3PositionsResults {
  const positionManager = useV3NFTPositionManagerContract()

  const { loading: balanceLoading, result: balanceResult } = useSingleCallResult(positionManager, 'balanceOf', [
    account ?? undefined,
  ])

  const accountBalance: number | undefined = balanceResult?.[0]?.toNumber()

  const tokenIdsArgs = useMemo(() => {
    if (accountBalance && account) {
      const tokenRequests = []
      for (let i = 0; i < accountBalance; i++) {
        tokenRequests.push([account, i])
      }
      return tokenRequests
    }
    return []
  }, [account, accountBalance])

  const tokenIdResults = useSingleContractMultipleData(positionManager, 'tokenOfOwnerByIndex', tokenIdsArgs)
  const someTokenIdsLoading = useMemo(() => tokenIdResults.some(({ loading }) => loading), [tokenIdResults])

  const tokenIds = useMemo(() => {
    if (account) {
      return tokenIdResults
        .map(({ result }) => result)
        .filter((result) => !!result)
        .map((result) => BigNumber.from(result[0]))
    }
    return []
  }, [account, tokenIdResults])

  const { positions, loading: positionsLoading } = useV3PositionsFromTokenIds(tokenIds)

  return {
    loading: someTokenIdsLoading || balanceLoading || positionsLoading,
    positions,
  }
}

export function useV3PositionFees(
  pool?: Pool,
  tokenId?: BigNumber,
  asWFUSE = false
): [CurrencyAmount<Currency>, CurrencyAmount<Currency>] | [undefined, undefined] {
  const positionManager = useV3NFTPositionManagerContract(true)

  const [owner, setOwner] = useState()

  useEffect(() => {
    if (tokenId) {
      positionManager.ownerOf(tokenId)
        .then(result => {
          setOwner(result)
        })
    }
  }, [positionManager, tokenId])


  const latestBlockNumber = useBlockNumber()

  const [amounts, setAmounts] = useState<[BigNumber, BigNumber] | undefined>()

  useEffect(() => {
    if (positionManager && typeof tokenId !== 'undefined' && owner) {
      positionManager.callStatic
        .collect({
          tokenId,
          recipient: owner,
          amount0Max: MAX_UINT128,
          amount1Max: MAX_UINT128,
        })
        .then((results) => {
          const [amount0, amount1] = results
          setAmounts([amount0, amount1])
        })
    }
  }, [owner, positionManager, tokenId, latestBlockNumber])

  if (pool && amounts) {
    return [
      CurrencyAmount.fromRawAmount(asWFUSE ? pool.token0 : unwrappedToken(pool.token0), amounts[0].toString()),
      CurrencyAmount.fromRawAmount(asWFUSE ? pool.token1 : unwrappedToken(pool.token1), amounts[1].toString()),
    ]
  }

  return [undefined, undefined]
}
