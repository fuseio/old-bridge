import { useCallback } from 'react'
import { useTransactionAdder } from '../state/transactions/hooks'
import { useUserDeadline } from '../state/user/hooks'
import { useVoltRollContract } from './useContract'

export default function useVoltRoll() {
  const voltRollContract = useVoltRollContract()
  const addTransaction = useTransactionAdder()
  const [deadline] = useUserDeadline()

  const migrate = useCallback(
    async (pair: any, amount: string) => {
      if (!voltRollContract || !pair || !amount || !deadline) return

      const tx = await voltRollContract.migrate(
        pair.token0.id,
        pair.token1.id,
        amount,
        '0',
        '0',
        Math.ceil(Date.now() / 1000) + deadline
      )

      addTransaction(tx, {
        summary: `Migrate ${pair.token0.symbol} and ${pair.token1.symbol} liquidity`
      })
    },
    [voltRollContract, deadline, addTransaction]
  )

  return {
    migrate
  }
}
