import { useState, useMemo, useEffect } from 'react'
import { Currency, CurrencyAmount, Token } from '@voltage-finance/sdk-core'

import { useWeb3 } from '.'
import { Field } from '../state/swap/actions'
import { useMassetContractV3 } from './useContract'
import { useApproveCallback } from './useApproveCallback'
import { useTransactionAdder } from '../state/transactions/hooks'
import { FUSE_USDC_V2, FUSE_USDT_V2, FUSD_V3 } from '../constants'
import tryParseCurrencyAmount from '../utils/tryParseCurrencyAmount'
import { useTransactionRejectedNotification } from './notifications/useTransactionRejectedNotification'

export enum FusdMethod {
  SWAP = 'Swap',
  MINT = 'Mint',
  REDEEM = 'Redeem',
}

function getFusdMethodName(inputCurrency: Currency | undefined, outputCurrency: Currency | undefined) {
  if (!inputCurrency || !outputCurrency) return
  if ((outputCurrency.equals(FUSE_USDC_V2) || outputCurrency.equals(FUSE_USDT_V2)) && inputCurrency.equals(FUSD_V3)) {
    return FusdMethod.REDEEM
  }
  if ((inputCurrency.equals(FUSE_USDC_V2) || inputCurrency.equals(FUSE_USDT_V2)) && outputCurrency.equals(FUSD_V3))
    return FusdMethod.MINT

  return
}

export function useFusdCallback(
  inputCurrency: Currency | undefined,
  outputCurrency: Currency | undefined,
  typedValue: string | undefined
) {
  const [data, setData] = useState<any>({})
  const { account } = useWeb3()
  const fAsset = useMassetContractV3()
  const addTransaction = useTransactionAdder()

  const inputAmount = useMemo(() => tryParseCurrencyAmount(typedValue, inputCurrency), [inputCurrency, typedValue])
  const [approval, approveCallback] = useApproveCallback(inputAmount, (inputCurrency as any)?.address)

  const methodName = useMemo(() => getFusdMethodName(inputCurrency, outputCurrency), [inputCurrency, outputCurrency])
  const rejectTransaction = useTransactionRejectedNotification()
  useEffect(() => {
    async function getData() {
      if (!account || !fAsset || !(inputCurrency instanceof Token) || !(outputCurrency instanceof Token)) return

      let methodFn: any, args: any, outputAmount: any
      if (methodName === FusdMethod.MINT) {
        methodFn = fAsset.mint
        if (inputAmount) {
          outputAmount = await fAsset.getMintOutput(inputCurrency.address, inputAmount.quotient.toString())
        }

        args = [inputCurrency.address, inputAmount?.quotient?.toString() ?? '0', '0', account]
      } else if (methodName === FusdMethod.REDEEM) {
        methodFn = fAsset.redeem

        if (inputAmount) {
          outputAmount = await fAsset.getRedeemOutput(outputCurrency.address, inputAmount.quotient.toString())
        }

        args = [outputCurrency.address, inputAmount?.quotient?.toString() ?? '0', '0', account]
      }

      const parsedAmounts = {
        [Field.INPUT]: inputAmount,
        [Field.OUTPUT]: outputAmount ? CurrencyAmount.fromRawAmount(outputCurrency, outputAmount) : undefined,
      }

      const execute = async () => {
        try {
          const response = await methodFn(...args)
          addTransaction(response, {
            summary: `${methodName} ${inputCurrency?.symbol}`,
          })
        } catch (e: any) {
          console.log(e, 'error')
          if (e?.code === 4001 || e?.code === 'ACTION_REJECTED') {
            rejectTransaction()
          }
          return e
        }
      }

      let error

      setData({ error, methodName, parsedAmounts, execute, approval, approveCallback })
    }

    getData().catch((e) => {
      setData({ error: e, methodName, approval, approveCallback })
    })
  }, [
    account,
    addTransaction,
    approval,
    fAsset,
    inputAmount?.toSignificant(18),
    inputCurrency,
    methodName,
    outputCurrency,
    typedValue,
  ])

  return useMemo(() => data, [data])
}
