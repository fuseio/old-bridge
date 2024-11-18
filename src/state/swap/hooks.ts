import { ParsedQs } from 'qs'
import { useDispatch, useSelector } from 'react-redux'
import { useCallback, useEffect, useState, useMemo } from 'react'
import JSBI from 'jsbi'

import { useWeb3 } from '../../hooks'
import { SwapState } from './reducer'
import { DEFAULT_MAX_SLIPPAGE, VOLT } from '../../constants'
import { ChainId } from '../../constants/chains'
import { useCurrency } from '../../hooks/Tokens'
import { AppDispatch, AppState } from '../index'
import { Percent, Token } from '@voltage-finance/sdk-core'
import { nativeOnChain } from '../../constants/token'
import { useCurrencyBalances } from '../wallet/hooks'
import { isAddress, safeParseJSON } from '../../utils'
import useParsedQueryString from '../../hooks/useParsedQueryString'
import { useTrade, Trade as RouterTrade } from '../../hooks/useTrade'
import tryParseCurrencyAmount from '../../utils/tryParseCurrencyAmount'
import { Field, replaceSwapState, selectCurrency, setRecipient, switchCurrencies, typeInput } from './actions'

import type { Address } from '@web3-onboard/core/dist/types'
import type { Currency, CurrencyAmount } from '@voltage-finance/sdk-core'
import { useSwapTaxes } from '../../hooks/useSwapTaxes'
import { useUserState } from '../user/hooks'

export function useSwapState(): AppState['swap'] {
  return useSelector<AppState, AppState['swap']>((state) => state.swap)
}

export function useSwapActionHandlers(): {
  onCurrencySelection: (field: Field, currency: Currency) => void
  onSwitchTokens: () => void
  onUserInput: (field: Field, typedValue: string) => void
  onChangeRecipient: (recipient: string | null) => void
} {
  const dispatch = useDispatch<AppDispatch>()
  const onCurrencySelection = useCallback(
    (field: Field, currency: Currency) => {
      dispatch(
        selectCurrency({
          field,
          currencyId: currency.isToken ? currency.address : currency.symbol,
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

  const onChangeRecipient = useCallback(
    (recipient: string | null) => {
      dispatch(setRecipient({ recipient }))
    },
    [dispatch]
  )

  return {
    onSwitchTokens,
    onCurrencySelection,
    onUserInput,
    onChangeRecipient,
  }
}

// from the current swap inputs, compute the best trade and return it.
export function useDerivedSwapInfo(takerAddress: Address): {
  currencies: { [field in Field]?: Currency }
  currencyBalances: { [field in Field]?: CurrencyAmount<Currency> }
  parsedAmount: CurrencyAmount<Currency> | undefined
  inputError?: string
  trade: RouterTrade | undefined
  parsedPegAmounts: { [field in Field]?: CurrencyAmount<Currency> }
  allowedSlippage: number
  autoSlippageMode: boolean
  inputTax: Percent
  outputTax: Percent
  isQuoteLoading: boolean
} {
  const { account } = useWeb3()

  const {
    independentField,
    typedValue,
    [Field.INPUT]: { currencyId: inputCurrencyId },
    [Field.OUTPUT]: { currencyId: outputCurrencyId },
  } = useSwapState()

  const inputCurrency = useCurrency(inputCurrencyId)
  const outputCurrency = useCurrency(outputCurrencyId)

  const relevantTokenBalances = useCurrencyBalances(account ?? undefined, [inputCurrency, outputCurrency])

  const parsedAmount = tryParseCurrencyAmount(
    typedValue,
    (independentField === Field.INPUT ? inputCurrency : outputCurrency) ?? undefined
  )
  
  const currencyBalances = useMemo(
    () => ({
      [Field.INPUT]: relevantTokenBalances[0],
      [Field.OUTPUT]: relevantTokenBalances[1],
    }),
    [relevantTokenBalances]
  )

  const currencies: { [field in Field]?: Currency } = useMemo(
    () => ({
      [Field.INPUT]: inputCurrency,
      [Field.OUTPUT]: outputCurrency,
    }),
    [inputCurrency, outputCurrency]
  )

  const { autoSlippageMode, userSlippageTolerance: customSlippage } = useUserState()

  const { inputTax, outputTax } = useSwapTaxes(
    inputCurrency?.isToken ? inputCurrency.address : undefined,
    outputCurrency?.isToken ? outputCurrency.address : undefined
  )

  const autoSlippage = useMemo(() => {
    if (!inputTax || !outputTax || (inputTax.equalTo('0') && outputTax.equalTo('0'))) return DEFAULT_MAX_SLIPPAGE

    if (inputTax.greaterThan('0') && outputTax.greaterThan('0'))
      return parseInt(JSBI.add(inputTax.numerator, outputTax.numerator).toString())

    if (inputTax.greaterThan('0')) return parseInt(inputTax.numerator.toString()) + 500

    if (outputTax.greaterThan('0')) return parseInt(outputTax.numerator.toString()) + 500

    return DEFAULT_MAX_SLIPPAGE
  }, [inputTax, outputTax])

  const allowedSlippage = autoSlippageMode ? autoSlippage : customSlippage

  const isExactIn = independentField === Field.INPUT
  
  const { isLoading, trade } = useTrade(inputCurrency, outputCurrency, parsedAmount, isExactIn, allowedSlippage, takerAddress)

  const parsedPegAmounts = useMemo(
    () => ({
      [Field.INPUT]: tryParseCurrencyAmount(typedValue, currencies[Field.INPUT]),
      // prevent fractional component exceeds decimals error, we use the input decimals
      [Field.OUTPUT]: tryParseCurrencyAmount(typedValue, currencies[Field.INPUT]),
    }),
    [currencies, typedValue]
  )

  const error = useCallback(() => {
    let inputError: string | undefined
    if (!account) {
      inputError = 'Connect Wallet'
    }

    if (!parsedAmount) {
      inputError = 'Enter an amount'
    }

    if (!currencies[Field.INPUT] || !currencies[Field.OUTPUT]) {
      inputError = inputError ?? 'Select a token'
    }

    if (trade && currencyBalances[Field.INPUT]) {
      if (trade.inputAmount.greaterThan(currencyBalances[Field.INPUT])) {
        inputError = 'Insufficient ' + trade.inputAmount.currency.symbol + ' balance'
        return inputError
      }
    }
  }, [account, parsedAmount, currencies, trade, currencyBalances])

  return {
    currencies,
    currencyBalances,
    parsedAmount,
    inputError: error(),
    isQuoteLoading: isLoading,
    trade,
    parsedPegAmounts,
    autoSlippageMode,
    allowedSlippage,
    inputTax,
    outputTax,
  }
}

function parseCurrencyFromURLParameter(urlParam: any): string {
  if (typeof urlParam !== 'string') {
    return null
  }

  const valid = isAddress(urlParam)
  const isFuse = urlParam.toUpperCase() === 'FUSE'

  if (valid) {
    return valid
  } else if (isFuse) {
    return urlParam.toUpperCase()
  } else {
    return null
  }
}

function parseTokenAmountURLParameter(urlParam: any): string {
  return typeof urlParam === 'string' && !isNaN(parseFloat(urlParam)) ? urlParam : ''
}

function parseIndependentFieldURLParameter(urlParam: any): Field {
  return typeof urlParam === 'string' && urlParam.toLowerCase() === 'output' ? Field.OUTPUT : Field.INPUT
}

const ENS_NAME_REGEX = /^[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&/=]*)?$/
const ADDRESS_REGEX = /^0x[a-fA-F0-9]{40}$/
function validatedRecipient(recipient: any): string | null {
  if (typeof recipient !== 'string') return null
  const address = isAddress(recipient)
  if (address) return address
  if (ENS_NAME_REGEX.test(recipient)) return recipient
  if (ADDRESS_REGEX.test(recipient)) return recipient
  return null
}

export function queryParametersToSwapState(parsedQs: ParsedQs): SwapState {
  const inputCurrency = parseCurrencyFromURLParameter(parsedQs.inputCurrency)
  const outputCurrency = parseCurrencyFromURLParameter(parsedQs.outputCurrency)

  const recipient = validatedRecipient(parsedQs.recipient)

  return {
    [Field.INPUT]: {
      currencyId: inputCurrency,
    },
    [Field.OUTPUT]: {
      currencyId: outputCurrency,
    },
    typedValue: parseTokenAmountURLParameter(parsedQs.exactAmount),
    independentField: parseIndependentFieldURLParameter(parsedQs.exactField),
    recipient,
  }
}

/**
 * Chooses tokens with this priority:
 * - URL tokens (TODO)
 * - Local storage tokens
 * - Default (FUSE/VOLT)
 */
export function useSwapDefaultTokens(): { inputCurrencyId: string; outputCurrencyId: string } {
  let { chainId } = useWeb3()
  const dispatch = useDispatch<AppDispatch>()
  const [result, setResult] = useState<{ inputCurrencyId: string; outputCurrencyId: string }>({
    inputCurrencyId: '',
    outputCurrencyId: '',
  })

  const parsedQs = useParsedQueryString()

  if (!chainId) {
    chainId = ChainId.FUSE
  }

  useEffect(() => {
    const parsed = queryParametersToSwapState(parsedQs)

    const parsedInputToken = parsed[Field.INPUT].currencyId
    const parsedOutputToken = parsed[Field.OUTPUT].currencyId

    let lastInput = safeParseJSON(localStorage.getItem(`${chainId}-SWAP_INPUT`)) as Token
    let lastOutput = safeParseJSON(localStorage.getItem(`${chainId}-SWAP_OUTPUT`)) as Token

    // In order to show the native fuse
    if (lastInput?.symbol === nativeOnChain(chainId).symbol) {
      lastInput = {
        ...lastInput,
        address: null,
      } as Token
    } else if (lastOutput?.symbol === nativeOnChain(chainId).symbol) {
      lastOutput = {
        ...lastOutput,
        address: null,
      } as Token
    }

    const lastInpuCurrencyId = lastInput?.address ?? lastInput?.symbol
    const lastOutpuCurrencyId = lastOutput?.address ?? lastOutput?.symbol

    const defaultInputCurrencyId = nativeOnChain(chainId).symbol // Native tokens
    const defaultOutputCurrencyId = VOLT.address

    const newSwapState = {
      typedValue: parsed.typedValue,
      field: parsed.independentField,
      inputCurrencyId: parsedInputToken ?? lastInpuCurrencyId ?? defaultInputCurrencyId,
      outputCurrencyId: parsedOutputToken ?? lastOutpuCurrencyId ?? defaultOutputCurrencyId,
      recipient: parsed.recipient,
    }

    dispatch(replaceSwapState(newSwapState))
    setResult({ inputCurrencyId: parsed[Field.INPUT].currencyId, outputCurrencyId: parsed[Field.OUTPUT].currencyId })
  }, [dispatch, chainId, parsedQs])

  return result
}
