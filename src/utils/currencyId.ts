import { ChainId, Currency } from '@voltage-finance/sdk-core'
import { nativeOnChain } from '../constants/token'

export function currencyId(currency: Currency): string {
  if (currency.equals(nativeOnChain(ChainId.FUSE))) return 'FUSE'
  if (currency.equals(nativeOnChain(ChainId.BNB))) return 'BNB'
  if (currency.isToken) return currency.address
  throw new Error('invalid currency')
}
