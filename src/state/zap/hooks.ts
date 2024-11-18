import { Currency, CurrencyAmount } from '@voltage-finance/sdk-core'
import { useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { AppDispatch, AppState } from '..'
import { useWeb3 } from '../../hooks'
import { useCurrency } from '../../hooks/Tokens'
import tryParseCurrencyAmount from '../../utils/tryParseCurrencyAmount'
import { useCurrencyBalance } from '../wallet/hooks'
import { Field, replaceZapState, selectCurrency, typeInput } from './actions'

export function useZapState(): AppState['zap'] {
  return useSelector<AppState, AppState['zap']>(state => state.zap)
}

export function useZapActionHandlers(): {
  onCurrencySelection: (field: Field, currency: Currency) => void
  onUserInput: (field: Field, typedValue: string) => void
  onReplaceZapState: (field: Field, inputCurrencyId?: string, outputCurrencyId?: string, typedValue?: string) => void
} {
  const dispatch = useDispatch<AppDispatch>()
  const onCurrencySelection = useCallback(
    (field: Field, currency: Currency) => {
      dispatch(
        selectCurrency({
          field,
          currencyId: currency.isToken ? currency.address : currency.symbol
        })
      )
    },
    [dispatch]
  )

  const onUserInput = useCallback(
    (field: Field, typedValue: string) => {
      dispatch(typeInput({ field, typedValue }))
    },
    [dispatch]
  )

  const onReplaceZapState = useCallback(
    (field: Field, inputCurrencyId?: string, outputCurrencyId?: string, typedValue?: string) => {
      dispatch(replaceZapState({ field, inputCurrencyId, outputCurrencyId, typedValue: typedValue ?? '' }))
    },
    [dispatch]
  )

  return {
    onCurrencySelection,
    onUserInput,
    onReplaceZapState
  }
}

export function useDerivedZapInfo(): {
  currencies: { [field in Field]?: Currency }
  inputCurrencyBalance: CurrencyAmount<Currency> | undefined
  parsedAmount: CurrencyAmount<Currency> | undefined
} {
  const { account } = useWeb3()

  const {
    typedValue,
    [Field.INPUT]: { currencyId: inputCurrencyId },
    [Field.OUTPUT]: { currencyId: outputCurrencyId }
  } = useZapState()

  const inputCurrency = useCurrency(inputCurrencyId)
  const outputCurrency = useCurrency(outputCurrencyId)

  const inputCurrencyBalance = useCurrencyBalance(account ?? undefined, inputCurrency ?? undefined)
  const parsedAmount = tryParseCurrencyAmount(typedValue, inputCurrency ?? undefined)

  const currencies: { [field in Field]?: Currency } = {
    [Field.INPUT]: inputCurrency ?? undefined,
    [Field.OUTPUT]: outputCurrency ?? undefined
  }

  return {
    currencies,
    inputCurrencyBalance,
    parsedAmount
  }
}
