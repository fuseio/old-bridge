import { ChefRewardProgram } from '@fuseio/earn-sdk'
import { useCallback, useMemo, useState } from 'react'

import { useWeb3 } from './index'
import useAnalytics from './useAnalytics'
import { getProgram } from '../utils/farm'
import { formatSignificant } from '../utils'
import { useTransactionAdder } from '../state/transactions/hooks'
import { useTransactionRejectedNotification } from './notifications/useTransactionRejectedNotification'

export enum FarmFundType {
  DEPOSIT = 'Deposit',
  WITHDRAW = 'Withdraw',
}

const getFarmTypePretty = (type) => {
  if (type === FarmFundType.DEPOSIT) return 'Deposit'
  if (type === FarmFundType.WITHDRAW) return 'Withdraw'
}

export const useAdjustFarmFunds = (farm: any, amount, type: FarmFundType) => {
  const { account, library } = useWeb3()
  const [txHash, setTXHash] = useState(null)
  const rejectTransaction = useTransactionRejectedNotification()
  const addTransaction = useTransactionAdder()
  const { sendEvent } = useAnalytics()

  const rewardProgram = useMemo(() => {
    if (!farm || !library) return undefined
    return getProgram(farm?.contractAddress, library?.provider, farm?.type)
  }, [farm, library])

  const func = useCallback(async () => {
    setTXHash(null)

    if (!farm || !library || !amount || !account || !rewardProgram) return

    let txn
    try {
      if (type === FarmFundType.DEPOSIT) {
        txn = rewardProgram.deposit(
          amount.quotient.toString(),
          account,
          rewardProgram instanceof ChefRewardProgram && farm?.id
        )
      }
      if (type === FarmFundType.WITHDRAW) {
        txn = rewardProgram.withdraw(
          amount.quotient.toString(),
          account,
          rewardProgram instanceof ChefRewardProgram && farm?.id
        )
      }
    } catch (e: any) {
      console.error(e, 'e')
    }
    //TODO: Remove the reward sdk in future
    txn.on('error', (e: any) => {
      if (e?.code === 4001 || e?.code === 'ACTION_REJECTED') {
        rejectTransaction()
      }
    })
    //TODO: Remove the reward sdk in future
    txn.on('transactionHash', (hash: any) => {
      setTXHash(hash)
      addTransaction(
        {
          hash: hash,
          confirmations: 0,
          from: null,
          wait: null,
          nonce: 0,
          gasLimit: null,
          data: null,
          value: null,
          chainId: null,
        },
        {
          summary: `${getFarmTypePretty(type)} ${farm?.pairName} farm`,
        }
      )

      // Deposit / Withdraw event
      sendEvent(`${getFarmTypePretty(type)} V2 Farm`, {
        pairId: farm?.pair,
        pairName: farm?.pairName,
        pairToken0: farm?.tokens[0]?.id,
        pairToken1: farm?.tokens[1]?.id,
        amount: formatSignificant({ value: Number(amount.quotient) / 1e18 }),
      })
    })
  }, [farm, library, amount, account, rewardProgram, addTransaction, farm?.pairName, sendEvent])

  return [func, txHash, setTXHash]
}
