import { isAddress } from '../../utils'
import { Token, CurrencyAmount, Currency } from '@voltage-finance/sdk-core'
import { WrappedTokenInfo } from '../../state/lists/hooks'

export function filterTokens(tokens: Token[], search: string): Token[] {
  if (search.length === 0) return tokens

  const searchingAddress = isAddress(search)

  if (searchingAddress) {
    return tokens.filter(token => token.address === searchingAddress)
  }

  const lowerSearchParts = search
    .toLowerCase()
    .split(/\s+/)
    .filter(s => s.length > 0)

  if (lowerSearchParts.length === 0) {
    return tokens
  }

  const matchesSearch = (s: string): boolean => {
    const sParts = s
      .toLowerCase()
      .split(/\s+/)
      .filter(s => s.length > 0)

    return lowerSearchParts.every(p => p.length === 0 || sParts.some(sp => sp.startsWith(p) || sp.endsWith(p)))
  }

  return tokens.filter(token => {
    const { symbol, name } = token

    return (symbol && matchesSearch(symbol)) || (name && matchesSearch(name))
  })
}

export const filterZeroBalance = (currencyAmount: CurrencyAmount<Currency> | undefined) => {
  if (!currencyAmount) return false

  const wrappedToken = currencyAmount.currency as WrappedTokenInfo
  if (wrappedToken.isDeprecated) {
    return Number(currencyAmount.toSignificant()) > 0
  } else {
    return true
  }
}
