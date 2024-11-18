/* eslint-disable @typescript-eslint/no-empty-function */
import { CurrencyAmount, Token } from '@voltage-finance/sdk-core'
import { useCallback } from 'react'
import { useTransactionAdder } from '../state/transactions/hooks'
import { useXVoltContract } from './useContract'

export default function useVoltBar() {
  const addTransaction = useTransactionAdder()
  const barContract = useXVoltContract()

  const enter = useCallback(
    async (amount?: CurrencyAmount<Token>) => {
      if (amount && barContract) {
        try {
          const tx = await barContract.enter(amount.quotient.toString())
          addTransaction(tx, { summary: 'Stake Volt' })
        } catch (e) {
          return e
        }
      }
    },
    [addTransaction, barContract]
  )

  const leave = useCallback(
    async (amount?: CurrencyAmount<Token>) => {
      if (amount && barContract) {
        try {
          const tx = await barContract.leave(amount.quotient.toString())
          addTransaction(tx, { summary: 'UnStake Volt' })
        } catch (e) {
          return e
        }
      }
    },
    [addTransaction, barContract]
  )

  return {
    enter,
    leave
  }
}
