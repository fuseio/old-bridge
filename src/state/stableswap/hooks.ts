import { BigNumber } from 'ethers'
import { useCallback, useMemo } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Currency, CurrencyAmount, Token } from '@voltage-finance/sdk-core'

import { useWeb3 } from '../../hooks'
import { AppDispatch, AppState } from '..'
import { useCurrency } from '../../hooks/Tokens'
import { tryFormatDecimalAmount } from '../../utils'
import { useSingleCallResult } from '../multicall/hooks'
import { useStableSwapContract } from '../../hooks/useContract'
import { useStableswapSubgraphLiquidity } from '../../graphql/hooks'
import { useStableDepositLPEstimate } from '../../hooks/useStableSwap'
import tryParseCurrencyAmount from '../../utils/tryParseCurrencyAmount'
import { useCurrencyBalances, useTokenBalance, useTokenBalances } from '../wallet/hooks'
import { StableSwapPool, ONE_ETH, STABLESWAP_POOLS, BUSD_USDC_USDT_POOL } from '../../constants'
import { Field, replaceSwapState, selectCurrency, selectPool, switchCurrencies, typeInput } from './actions'

export function useStableSwapState(): AppState['stableswap'] {
  return useSelector<AppState, AppState['stableswap']>(state => state.stableswap)
}

export function calculatePriceImpact(
  tokenInputAmount: BigNumber, // assumed to be 18d precision
  tokenOutputAmount: BigNumber,
  virtualPrice = BigNumber.from(10).pow(18),
  isWithdraw = false
): BigNumber {
  // We want to multiply the lpTokenAmount by virtual price
  // Deposits: (VP * output) / input - 1
  // Swaps: (1 * output) / input - 1
  // Withdraws: output / (input * VP) - 1
  if (tokenInputAmount.lte(0)) return BigNumber.from(0)

  return isWithdraw
    ? tokenOutputAmount
        .mul(BigNumber.from(10).pow(36))
        .div(tokenInputAmount.mul(virtualPrice))
        .sub(BigNumber.from(10).pow(18))
    : virtualPrice
        .mul(tokenOutputAmount)
        .div(tokenInputAmount)
        .sub(BigNumber.from(10).pow(18))
}

export function useStableswapTotalLiquidity() {
  const data = useStableswapSubgraphLiquidity()

  return useMemo(
    () =>
      data?.[0]?.balances?.reduce(
        (prev: any, cur: any, idx: any) =>
          prev + cur / Math.pow(10, STABLESWAP_POOLS?.[BUSD_USDC_USDT_POOL]?.tokenList[idx]?.decimals),
        0
      ),
    [data]
  )
}


export function useStableSwapActionHandlers(): {
  onCurrencySelection: (field: Field, currency: Currency) => void
  onSwitchTokens: () => void
  onUserInput: (field: Field, typedValue: string) => void
  onPoolSelect: (pool: string) => void
  onReplaceSwapState: (
    field: Field,
    inputCurrencyId?: string,
    outputCurrencyId?: string,
    typedValue?: string,
    pool?: string
  ) => void
} {
  const dispatch = useDispatch<AppDispatch>()
  const onCurrencySelection = useCallback(
    (field: Field, currency: Currency) => {
      dispatch(
        selectCurrency({
          field,
          currencyId: currency.isToken ? currency.address : 'FUSE'
        })
      )
    },
    [dispatch]
  )

  const onSwitchTokens = useCallback(() => {
    dispatch(switchCurrencies())
  }, [dispatch])

  const onUserInput = useCallback(
    (field: Field, typedValue: string) => {
      dispatch(typeInput({ field, typedValue }))
    },
    [dispatch]
  )

  const onPoolSelect = useCallback(
    (pool: string) => {
      dispatch(selectPool(pool))
    },
    [dispatch]
  )

  const onReplaceSwapState = useCallback(
    (field: Field, inputCurrencyId?: string, outputCurrencyId?: string, typedValue?: string, pool?: string) => {
      dispatch(replaceSwapState({ field, inputCurrencyId, outputCurrencyId, pool, typedValue: typedValue ?? '' }))
    },
    [dispatch]
  )

  return {
    onSwitchTokens,
    onCurrencySelection,
    onUserInput,
    onPoolSelect,
    onReplaceSwapState
  }
}

export function useDerivedStableSwapInfo(): {
  currencies: { [field in Field]?: Currency }
  currencyBalances: { [field in Field]?: CurrencyAmount<Currency> }
  parsedAmount: CurrencyAmount<Currency> | undefined
} {
  const { account } = useWeb3()

  const {
    typedValue,
    [Field.INPUT]: { currencyId: inputCurrencyId },
    [Field.OUTPUT]: { currencyId: outputCurrencyId }
  } = useStableSwapState()

  const inputCurrency = useCurrency(inputCurrencyId)
  const outputCurrency = useCurrency(outputCurrencyId)

  const relevantTokenBalances = useCurrencyBalances(account ?? undefined, [
    inputCurrency ?? undefined,
    outputCurrency ?? undefined
  ])

  const currencyBalances = {
    [Field.INPUT]: relevantTokenBalances[0],
    [Field.OUTPUT]: relevantTokenBalances[1]
  }

  const parsedAmount = tryParseCurrencyAmount(typedValue, inputCurrency ?? undefined)

  const currencies: { [field in Field]?: Currency } = {
    [Field.INPUT]: inputCurrency ?? undefined,
    [Field.OUTPUT]: outputCurrency ?? undefined
  }

  return {
    currencies,
    currencyBalances,
    parsedAmount
  }
}
