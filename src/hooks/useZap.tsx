import { useEffect, useMemo, useState } from 'react'
import { ChainId, Currency, CurrencyAmount, Fraction, Token } from '@voltage-finance/sdk-core'

import { useWeb3 } from '.'
import { useLPPrice } from '../graphql/hooks'
import { useZapContract } from './useContract'
import { useTokenPriceV2 } from './useUSDPrice'
import { getLPTokensByVolume } from '../graphql/queries'
import { BasePair, usePairAddr } from '../data/Reserves'
import { useCurrencyBalance } from '../state/wallet/hooks'
import useContractCallStatic from './useContractCallStatic'
import { WRAPPED_NATIVE_CURRENCY } from '../constants/token'
import { useTransactionAdder } from '../state/transactions/hooks'
import tryParseCurrencyAmount from '../utils/tryParseCurrencyAmount'
import { useTransactionRejectedNotification } from './notifications/useTransactionRejectedNotification'

export default function useZapCallback(
  inputCurrency: Currency | undefined,
  outputCurrency: Currency | undefined,
  typedValue: string | undefined,
  fromToken: string | undefined,
  toLPToken: string | undefined
): {
  inputError?: string
  outputAmount?: string
  parsedAmounts?: {
    inputAmount: CurrencyAmount<Currency> | undefined
    outputAmount: CurrencyAmount<Currency> | undefined
  }
  formattedAmounts?: {
    inputAmount: string | undefined
    outputAmount: string | undefined
  }
  pair?: BasePair
  ratios?: {
    token0Amount: Fraction
    token1Amount: Fraction
  }
  priceImpact?: number
  execute?: () => Promise<any>
} {
  const { account } = useWeb3()
  const contract = useZapContract()
  const balance = useCurrencyBalance(account ?? undefined, inputCurrency)
  const inputAmount = useMemo(() => tryParseCurrencyAmount(typedValue, inputCurrency), [inputCurrency, typedValue])
  const rejectTransaction = useTransactionRejectedNotification()

  const pair = usePairAddr(toLPToken)

  const { method, args, overrides } = useMemo(() => {
    let method: any, args: any, overrides: any

    if (inputCurrency && inputCurrency.isNative && inputAmount) {
      method = 'zapIn'
      args = [toLPToken]
      overrides = { value: inputAmount?.quotient.toString() }
    } else if (inputCurrency && inputAmount) {
      method = 'zapInToken'
      args = [fromToken, inputAmount?.quotient.toString(), toLPToken]
      overrides = {}
    }

    return { method, args, overrides }
  }, [fromToken, inputAmount, inputCurrency, toLPToken])

  const output: string | undefined = useContractCallStatic(contract, method, args, overrides)
  const outputAmount: CurrencyAmount<Currency> | undefined = useMemo(
    () => (output && outputCurrency ? CurrencyAmount.fromRawAmount(outputCurrency, output) : undefined),
    [output, outputCurrency]
  )

  const lpRatio = outputAmount && pair ? outputAmount.divide(pair.totalSupply.toString()) : undefined
  const ratios = useMemo(() => {
    if (!lpRatio || !pair) return
    return {
      token0Amount: lpRatio.multiply(pair.reserve0.toString()),
      token1Amount: lpRatio.multiply(pair.reserve1.toString()),
    }
  }, [lpRatio, pair])

  const inputTokenPrice = useTokenPriceV2(
    fromToken === 'FUSE' ? WRAPPED_NATIVE_CURRENCY[ChainId.FUSE].address : fromToken
  )
  const inputPrice = Number(inputTokenPrice)
  const lpPrice = useLPPrice({ lpAddress: toLPToken })

  const priceImpact =
    inputPrice && lpPrice && outputAmount
      ? ((inputPrice - Number(outputAmount?.toSignificant(10)) * lpPrice) / inputPrice) * 100
      : 0

  const addTransaction = useTransactionAdder()

  return useMemo(() => {
    let error

    if (inputAmount && balance && balance.lessThan(inputAmount)) {
      error = `Insufficient ${inputCurrency?.symbol} Balance`
    }

    return {
      inputError: error,
      parsedAmounts: {
        inputAmount,
        outputAmount,
      },
      formattedAmounts: {
        inputAmount: typedValue,
        outputAmount: outputAmount?.toSignificant(),
      },
      pair,
      ratios,
      priceImpact,
      execute: async () => {
        try {
          const txReceipt = await contract?.[method](...args, overrides)

          addTransaction(txReceipt, {
            summary: `ZAP: Zapped ${inputAmount?.toSignificant(6)} ${inputCurrency?.symbol} to ${
              outputCurrency?.symbol
            }`,
          })
          return txReceipt
        } catch (error: any) {
          if (error?.code === 4001 || error?.code === 'ACTION_REJECTED') {
            rejectTransaction()
          }
          console.error(error)
          throw new Error('Could not perfrom zap ' + (error as any)?.toString())
        }
      },
    }
  }, [
    inputAmount,
    balance,
    outputAmount,
    typedValue,
    pair,
    ratios,
    priceImpact,
    inputCurrency?.symbol,
    contract,
    method,
    args,
    overrides,
    addTransaction,
    outputCurrency?.symbol,
    rejectTransaction,
  ])
}

export const useLPTokensList = () => {
  const [data, setData] = useState<
    Array<{
      currency: Token
      tokens: Array<Token>
      stats: { totalSupply: any; volumeUSD: any; volumeToken0: 0; volumeToken1: 0; reserveToken0: 0; reserveToken1: 0 }
    }>
  >()

  async function fetchData() {
    const response = await getLPTokensByVolume()

    const result = await response.map(
      (res: {
        id: string
        reserve0: any
        reserve1: any
        token0: { symbol: any; name: any; id: any }
        token1: { symbol: any; name: any; id: any }
        volumeToken0: any
        volumeToken1: any
        volumeUSD: any
        totalSupply: any
      }) => ({
        currency: new Token(
          122,
          res.id,
          18,
          res.token0.symbol + ' - ' + res.token1.symbol,
          res.token0.name + ' - ' + res.token1.name
        ),
        tokens: [res.token0, res.token1],
        stats: {
          reserveToken0: res.reserve0,
          reserveToken1: res.reserve1,
          volumeToken0: res.volumeToken0,
          volumeToken1: res.volumeToken1,
          volumeUSD: res.volumeUSD,
          totalSupply: res.totalSupply,
        },
      })
    )
    setData(result)
  }

  useEffect(() => {
    fetchData()
  }, [])
  return data
}
