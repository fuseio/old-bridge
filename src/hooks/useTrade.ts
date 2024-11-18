import axios from 'axios'
import { useEffect, useMemo, useState } from 'react'
import { Currency, CurrencyAmount, Percent, TradeType } from '@voltage-finance/sdk-core'

import { FUSE } from '../data/Currency'
import { basisPointsToPercent } from '../utils'
import { VOLTAGE_FINANCE_API_ROUTER } from '../constants/config'

import type { Address } from '@web3-onboard/core/dist/types'

interface Source {
  name: string
  proportion: number
}

export interface Trade {
  inputAmount: CurrencyAmount<Currency>
  outputAmount: CurrencyAmount<Currency>
  data: string
  allowanceTarget: string
  to: string
  value: CurrencyAmount<Currency>
  priceImpact: Percent
  tradeType: TradeType
  sources: Array<Source>
  price: number
}

interface Quote {
  sellAmount: string
  buyAmount: string
  data: string
  allowanceTarget: string
  value: string
  to: string
  price: string
  sources: Array<Source>
  estimatedPriceImpact: string
}

async function getTrade(
  inputToken: string,
  outputToken: string,
  inputAmount: string,
  exactIn: boolean,
  slippage: number,
  takerAddress: Address
) {
  const typeOfAmount = exactIn ? 'sellAmount' : 'buyAmount'
  const formattedSlippage = basisPointsToPercent(slippage).divide(100).toSignificant(2)

  return axios.get<Quote>(VOLTAGE_FINANCE_API_ROUTER, {
    params: {
      sellToken: inputToken,
      buyToken: outputToken,
      [typeOfAmount]: inputAmount,
      slippagePercentage: formattedSlippage,
      takerAddress: takerAddress.toLowerCase(),
    },
  })
}

function getToken(currency?: Currency) {
  return currency ? (currency.isToken ? currency.address : currency.symbol) : undefined
}

export function useTrade(
  inputCurrency: Currency,
  outputCurrency: Currency,
  parsedAmount: CurrencyAmount<Currency>,
  isExactIn: boolean,
  slippage: number,
  takerAddress: Address
): { trade: Trade | null; isLoading: boolean } {
  const [quote, setQuote] = useState<Quote | null>()
  const [quoteLoading, setQuoteLoading] = useState<boolean>()

  const inputToken = getToken(inputCurrency)

  const outputToken = getToken(outputCurrency)

  const amount = useMemo(() => parsedAmount?.quotient.toString(), [parsedAmount])

  useEffect(() => {
    let canceled = false

    if (inputToken && outputToken && amount && slippage && takerAddress) {
      setQuote(null)
      setQuoteLoading(true)

      getTrade(inputToken, outputToken, amount, isExactIn, slippage, takerAddress).then((qoute) => {
        if (!canceled) {
          setQuote(qoute.data)
          setQuoteLoading(false)
        }
      })
    }

    return () => {
      canceled = true
    }
  }, [amount, inputToken, isExactIn, outputToken, slippage, takerAddress])

  return useMemo(() => {
    let trade: Trade
    if (!quote || !inputCurrency || !outputCurrency) {
      trade = null
    } else {
      trade = {
        inputAmount: CurrencyAmount.fromRawAmount(inputCurrency, quote.sellAmount),
        outputAmount: CurrencyAmount.fromRawAmount(outputCurrency, quote.buyAmount),
        data: quote.data,
        allowanceTarget: quote.allowanceTarget,
        value: CurrencyAmount.fromRawAmount(FUSE, quote.value),
        priceImpact: new Percent(String(parseInt(String(+quote.estimatedPriceImpact * 100))), String(10000)),
        price: parseFloat(quote.price),
        to: quote.to,
        tradeType: isExactIn ? TradeType.EXACT_INPUT : TradeType.EXACT_OUTPUT,
        sources: quote.sources,
      }
    }

    return {
      trade,
      isLoading: quoteLoading,
    }
  }, [inputCurrency, isExactIn, outputCurrency, quote, quoteLoading])
}
