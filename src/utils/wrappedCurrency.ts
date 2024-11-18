import { ChainId, Currency, CurrencyAmount, Token } from '@voltage-finance/sdk-core'
import { nativeOnChain, WRAPPED_NATIVE_CURRENCY } from '../constants/token'

export function wrappedCurrency(currency: Currency | undefined, chainId: ChainId | undefined): Token | undefined {
  return chainId && currency?.isNative ? WRAPPED_NATIVE_CURRENCY[chainId] : currency?.isToken ? currency : undefined
}

export function wrappedCurrencyAmount(
  currencyAmount: CurrencyAmount<Currency> | undefined,
  chainId: ChainId | undefined
): CurrencyAmount<Currency> | undefined {
  const token = currencyAmount && chainId ? wrappedCurrency(currencyAmount.currency, chainId) : undefined
  return token && currencyAmount ? CurrencyAmount.fromRawAmount(token, currencyAmount.quotient) : undefined
}

export function unwrappedToken(token?: Token): Currency | undefined {
  if (token && token.equals(WRAPPED_NATIVE_CURRENCY[token.chainId as keyof typeof WRAPPED_NATIVE_CURRENCY])) return nativeOnChain(token.chainId)
  return token
}
