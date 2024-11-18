import JSBI from 'jsbi'
import { useMemo } from 'react'
import { BigNumber, Contract } from 'ethers'
import { Currency, CurrencyAmount, Fraction, Token } from '@voltage-finance/sdk-core'

import { useWeb3 } from '.'
import { Field } from '../state/swap/actions'
import { useUserDeadline } from '../state/user/hooks'
import { useStableSwapContract } from './useContract'
import { isSwapPair, tryFormatAmount } from '../utils'
import { useTransactionAdder } from '../state/transactions/hooks'
import tryParseCurrencyAmount from '../utils/tryParseCurrencyAmount'
import { useCurrencyBalance, useTokenBalance } from '../state/wallet/hooks'
import { NEVER_RELOAD, useSingleCallResult } from '../state/multicall/hooks'
import { BUSD_USDC_USDT_POOL, FUSE_BUSD, FUSE_USDC, FUSE_USDT, StableSwapPool, STABLESWAP_POOLS } from '../constants'

function useStableSwapTokenList(poolAddress: string | null): Token[] {
  return useMemo(() => {
    if (!poolAddress || !STABLESWAP_POOLS[poolAddress]) return []
    return STABLESWAP_POOLS[poolAddress].tokenList
  }, [poolAddress])
}

export function useStableSwapPooledTokenIndex(
  poolAddress: string | null,
  pooledToken: Currency | undefined
): number | null {
  const tokenList = useStableSwapTokenList(poolAddress)

  return useMemo(() => {
    if (!pooledToken || !poolAddress) return null
    const res = tokenList.findIndex((token: Token) => {
      return pooledToken.equals(token)
    })
    return res !== -1 ? res : null
  }, [poolAddress, pooledToken, tokenList])
}

export function useStableSwapCalculateWithdraw(
  poolAddress?: string,
  lpAmount?: CurrencyAmount<Token>
): CurrencyAmount<Token>[] | undefined {
  const poolContract = useStableSwapContract(poolAddress)
  const poolTokens = useMemo(() => {
    if (!poolAddress) return
    return STABLESWAP_POOLS[poolAddress].tokenList
  }, [poolAddress])

  const withdrawResult = useSingleCallResult(
    poolContract,
    'calculateRemoveLiquidity',
    [lpAmount?.quotient.toString()],
    NEVER_RELOAD
  )

  return useMemo(() => {
    if (!withdrawResult || !withdrawResult?.result || !withdrawResult?.valid || withdrawResult?.loading) return
    return poolTokens?.map((token, i) => {
      return CurrencyAmount.fromRawAmount(token, withdrawResult?.result?.[0]?.[i])
    })
  }, [withdrawResult, poolTokens])
}

interface StablePoolInfo {
  logo: string
  name: string
  address: string
  pooledTokens: Token[]
  details: {
    stakedTokens: string
    poolShare: string
    totalValueLocked: string
    tokenAmounts: CurrencyAmount<Token>[] | undefined
  }
}

export function useStablePool(poolAddress?: string): StableSwapPool | undefined {
  return useMemo(() => {
    if (!poolAddress) return
    return STABLESWAP_POOLS[poolAddress]
  }, [poolAddress])
}

export function useStableDepositLPEstimate(
  poolAddress?: string,
  amounts?: (CurrencyAmount<Token> | undefined)[]
): CurrencyAmount<Token> | undefined {
  const poolContract = useStableSwapContract(poolAddress)
  const pool = useStablePool(poolAddress)
  const lpToken = pool?.lpToken
  const callArgs = useMemo(() => {
    return [
      amounts?.map((amount) => BigNumber.from(amount?.quotient.toString() ?? '0').toHexString()),
      '1', // deposit: true
    ]
  }, [amounts])
  const accuredLp = useSingleCallResult(poolContract, 'calculateTokenAmount', callArgs, NEVER_RELOAD)
  return useMemo(() => {
    if (!accuredLp || !accuredLp.valid || accuredLp.error || !accuredLp.result || !lpToken) return
    return CurrencyAmount.fromRawAmount(lpToken, accuredLp.result?.[0] ?? '0')
  }, [accuredLp, lpToken])
}

interface StableWithdrawInfo {
  pool?: StableSwapPool
  lpBalance?: CurrencyAmount<Currency>
  withdrawResult?: CurrencyAmount<Currency>[]
}

export function useStableWithdrawInfo(poolAddress?: string): StableWithdrawInfo {
  const { account } = useWeb3()
  const pool = useStablePool(poolAddress)
  const lpToken = pool?.lpToken
  const lpBalance = useTokenBalance(account ?? undefined, lpToken)
  const withdrawResult = useStableSwapCalculateWithdraw(poolAddress, lpBalance)

  return useMemo(() => {
    return {
      pool,
      lpBalance,
      withdrawResult,
    }
  }, [pool, lpBalance, withdrawResult])
}

export function useStableSwapStorageInfo(poolAddress?: string): any {
  const swapStorage = useSingleCallResult(
    useStableSwapContract(poolAddress),
    'swapStorage',
    undefined,
    NEVER_RELOAD
  )?.result
  return useMemo(() => swapStorage, [swapStorage])
}

function useTokenLiquidity(pool: Contract | null, tokenIndex?: number | null, token?: Currency) {
  const liquidity = useSingleCallResult(pool, 'getTokenBalance', [tokenIndex?.toString()], NEVER_RELOAD)?.result?.[0]
  return tryFormatAmount(liquidity?.toString(), token?.decimals)
}

export enum StableSwapType {
  INVALID = 'INVALID',
  VALID = 'VALID',
  PAUSED = 'PAUSED',
}

export function useStableSwapCallback(
  inputCurrency: Currency | undefined,
  outputCurrency: Currency | undefined,
  typedValue: string | undefined
) {
  const poolAddress = BUSD_USDC_USDT_POOL
  const pool = useStableSwapContract(poolAddress)
  const { account } = useWeb3()

  const inputCurrencyIndex = useStableSwapPooledTokenIndex(poolAddress, inputCurrency)
  const outputCurrencyIndex = useStableSwapPooledTokenIndex(poolAddress, outputCurrency)

  const balance = useCurrencyBalance(account ?? undefined, inputCurrency)

  const inputAmount = useMemo(() => tryParseCurrencyAmount(typedValue, inputCurrency), [inputCurrency, typedValue])
  const liquidity = useTokenLiquidity(pool, outputCurrencyIndex, outputCurrency)

  const swapOutput: string =
    useSingleCallResult(pool, 'calculateSwap', [
      inputCurrencyIndex ?? undefined,
      outputCurrencyIndex ?? undefined,
      inputAmount?.quotient?.toString(),
    ])?.result?.[0] ?? '0'

  const parsedAmounts = useMemo(
    () => ({
      [Field.INPUT]: inputAmount,
      [Field.OUTPUT]: outputCurrency ? CurrencyAmount.fromRawAmount(outputCurrency as Token, swapOutput) : undefined,
    }),
    [swapOutput, inputAmount, outputCurrency]
  )

  const swapStorage = useStableSwapStorageInfo(poolAddress)

  const fee = useMemo(() => new Fraction(swapStorage?.swapFee ?? '0', JSBI.BigInt('100000000')), [swapStorage])
  const swapFee = useMemo(
    () => fee.divide(JSBI.BigInt('100')).multiply(JSBI.BigInt(inputAmount?.quotient ?? '0')),
    [fee, inputAmount?.quotient]
  )

  const trade = useMemo(
    () =>
      inputCurrency instanceof Token && outputCurrency && inputAmount && swapOutput
        ? {
            inputCurrency,
            outputCurrency,
            swapFee: CurrencyAmount.fromRawAmount(inputCurrency, swapFee.quotient),
          }
        : undefined,
    [inputAmount, inputCurrency, outputCurrency, swapFee.quotient, swapOutput]
  )

  const isPaused = useSingleCallResult(pool, 'paused', undefined, NEVER_RELOAD)?.result?.[0]

  const [deadline] = useUserDeadline()

  const addTransaction = useTransactionAdder()

  return useMemo(() => {
    if (!pool || inputCurrencyIndex === null || outputCurrencyIndex === null)
      return { stableSwapType: StableSwapType.INVALID }

    if (
      isSwapPair(inputCurrency, outputCurrency, FUSE_BUSD, FUSE_USDC) ||
      isSwapPair(inputCurrency, outputCurrency, FUSE_USDC, FUSE_USDT) ||
      isSwapPair(inputCurrency, outputCurrency, FUSE_BUSD, FUSE_USDT)
    ) {
      const outputAmount =
        swapOutput && swapOutput !== '0'
          ? CurrencyAmount.fromRawAmount(outputCurrency as Token, JSBI.BigInt(swapOutput?.toString()))
          : undefined

      let error

      if (inputAmount && balance && balance.lessThan(inputAmount)) {
        error = `Insufficient ${inputCurrency?.symbol} Balance`
      } else if (Number(liquidity) < Number(outputAmount?.toSignificant())) {
        error = 'Insufficient liquidity'
      } else if (isPaused) {
        error = 'Pool is closed'
      } else if (!swapOutput || !deadline) {
        error = 'Swap'
      }

      return {
        parsedAmounts,
        trade,
        inputError: error,
        execute: async () => {
          try {
            const response = await pool.swap(
              inputCurrencyIndex,
              outputCurrencyIndex,
              inputAmount?.quotient.toString(),
              outputAmount?.quotient.toString(),
              deadline + Math.floor(Date.now() / 1000)
            )

            addTransaction(response, {
              summary: `StableSwap: Swap ${inputAmount?.toSignificant(6)} ${inputCurrency?.symbol} to ${
                outputCurrency?.symbol
              }`,
            })

            return response
          } catch (error) {
            console.error(error)
          }
        },
      }
    } else {
      return { stableSwapType: StableSwapType.INVALID }
    }
  }, [
    pool,
    inputCurrencyIndex,
    outputCurrencyIndex,
    inputCurrency,
    outputCurrency,
    swapOutput,
    inputAmount,
    balance,
    liquidity,
    isPaused,
    deadline,
    parsedAmounts,
    trade,
    addTransaction,
  ])
}

export default function useStableSwapCallbackV1(
  poolAddress: string,
  inputCurrency: Currency | undefined,
  outputCurrency: Currency | undefined,
  typedValue: string | undefined
): {
  exactOutput?: CurrencyAmount<Currency>
  inputError?: string
  execute?: () => Promise<any>
} {
  const { account } = useWeb3()
  const pool = useStableSwapContract(poolAddress)
  const inputIndex = useStableSwapPooledTokenIndex(poolAddress, inputCurrency)
  const outputIndex = useStableSwapPooledTokenIndex(poolAddress, outputCurrency)

  const balance = useCurrencyBalance(account ?? undefined, inputCurrency)
  const inputAmount = useMemo(() => tryParseCurrencyAmount(typedValue, inputCurrency), [inputCurrency, typedValue])
  const liquidity = useTokenLiquidity(pool, outputIndex, outputCurrency)
  const exactOutput = useSingleCallResult(pool, 'calculateSwap', [
    inputIndex ?? undefined,
    outputIndex ?? undefined,
    inputAmount?.quotient?.toString(),
  ])?.result?.[0]

  const isPaused = useSingleCallResult(pool, 'paused', undefined, NEVER_RELOAD)?.result?.[0]

  const [deadline] = useUserDeadline()
  const addTransaction = useTransactionAdder()

  return useMemo(() => {
    if (!pool || inputIndex === null || outputIndex === null) return { stableSwapType: StableSwapType.INVALID }

    const outputAmount =
      exactOutput && exactOutput !== '0'
        ? CurrencyAmount.fromRawAmount(outputCurrency as Token, JSBI.BigInt(exactOutput?.toString()))
        : undefined

    let error

    if (inputAmount && balance && balance.lessThan(inputAmount)) {
      error = `Insufficient ${inputCurrency?.symbol} Balance`
    } else if (Number(liquidity) < Number(outputAmount?.toSignificant())) {
      error = 'Insufficient liquidity'
    } else if (isPaused) {
      error = 'Pool is closed'
    } else if (!exactOutput || !deadline) {
      error = 'Swap'
    }

    return {
      exactOutput: outputAmount,
      inputError: error,
      execute: async () => {
        try {
          const txReceipt = await pool.swap(
            inputIndex,
            outputIndex,
            inputAmount?.quotient.toString(),
            outputAmount?.quotient.toString(),
            deadline + Math.floor(Date.now() / 1000)
          )

          addTransaction(txReceipt, {
            summary: `StableSwap: Swap ${inputAmount?.toSignificant(6)} ${inputCurrency?.symbol} to ${
              outputCurrency?.symbol
            }`,
          })

          return txReceipt
        } catch (error) {
          console.error(error)
          throw new Error('Could not Stable swap ' + (error as any)?.toString())
        }
      },
    }
  }, [
    pool,
    inputIndex,
    outputIndex,
    inputAmount,
    balance,
    liquidity,
    isPaused,
    exactOutput,
    deadline,
    inputCurrency,
    addTransaction,
    outputCurrency,
  ])
}
