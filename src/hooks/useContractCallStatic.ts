import { PayableOverrides, Contract } from '@ethersproject/contracts'
import { useEffect, useState } from 'react'
import { OptionalMethodInputs } from '../state/multicall/hooks'

export default function useContractCallStatic(
  contract: Contract | null | undefined,
  methodName?: string,
  inputs?: OptionalMethodInputs,
  overrides?: PayableOverrides
) {
  const [result, setResult] = useState()

  useEffect(() => {
    if (contract && methodName && inputs) {
      try {
        contract.callStatic[methodName](...inputs, overrides).then(result => setResult(result))
      } catch (e) {
        console.log('Static contract call failed', e)
      }
    }
  }, [contract, inputs, methodName, overrides])

  return result
}
