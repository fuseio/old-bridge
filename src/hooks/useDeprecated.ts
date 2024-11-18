import { useState } from 'react'
import { Currency } from '@voltage-finance/sdk-core'
import { WrappedTokenInfo } from '../state/lists/hooks'

export const useDeprecated = () => {
  const [isDeprecated] = useState(false)
  const [tokenDep] = useState<Partial<WrappedTokenInfo>>()
  const [currencyDep] = useState<Currency>()

  return {
    isDeprecated,
    tokenDep,
    currencyDep
  }
}
