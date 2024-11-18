import { useMemo } from 'react'
import { Token, CurrencyAmount, Currency } from '@voltage-finance/sdk-core'

import { useTokenContract } from '../hooks/useContract'
import { useSingleCallResult } from '../state/multicall/hooks'

export function useTokenAllowance(
  token?: Token,
  owner?: string,
  spender?: string
): CurrencyAmount<Currency> | undefined {
  const contract = useTokenContract(token?.address, false)
  const inputs = useMemo(() => [owner, spender], [owner, spender])
  const allowance = useSingleCallResult(contract, 'allowance', inputs).result

  return useMemo(
    () => (token && allowance ? CurrencyAmount.fromRawAmount(token, allowance.toString()) : undefined),
    [token, allowance]
  )
}
