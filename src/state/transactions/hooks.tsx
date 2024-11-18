import { useDispatch, useSelector } from 'react-redux'
import { useNotifications } from '@web3-onboard/react'
import { TransactionResponse } from '@ethersproject/providers'
import { useCallback, useEffect, useMemo, useState } from 'react'

import { useWeb3 } from '../../hooks'
import { addTransaction } from './actions'
import { getExplorerLink } from '../../utils'
import { TransactionDetails } from './reducer'
import { AppDispatch, AppState } from '../index'

export enum TransactionKey {
  VEVOLT = 'VEVOLT',
}

function newTransactionsFirst(a: TransactionDetails, b: TransactionDetails) {
  return b.addedTime - a.addedTime
}

// helper that can take a ethers library transaction response and add it to the list of transactions
export function useTransactionAdder(): (
  response: TransactionResponse,
  customData?: { summary?: string; key?: string; text?: string; approval?: { tokenAddress: string; spender: string } }
) => void {
  const { chainId, account } = useWeb3()
  const dispatch = useDispatch<AppDispatch>()
  const [, customNotifications] = useNotifications()

  return useCallback(
    (
      response: TransactionResponse,
      {
        summary,
        text,
        key,
        approval,
      }: { key?: string; summary?: string; text?: string; approval?: { tokenAddress: string; spender: string } } = {}
    ) => {
      if (!account) return
      if (!chainId) return

      const { hash } = response
      if (!hash) {
        throw Error('No transaction hash found.')
      }
      const { dismiss, update } = customNotifications({
        type: 'pending',
        eventCode: hash,
        message: summary,
        link: getExplorerLink(chainId, hash, 'transaction'),
        autoDismiss: 0,
      })
      dispatch(addTransaction({ hash, key, from: account, chainId, approval, summary, text, dismiss, update }))
    },
    [dispatch, chainId, account]
  )
}

// returns all the transactions for the current chain
export function useAllTransactions(): { [txHash: string]: TransactionDetails } {
  const { chainId } = useWeb3()

  const state = useSelector<AppState, AppState['transactions']>((state) => state.transactions)

  return useMemo(() => {
    return chainId ? state[chainId] ?? {} : {}
  }, [state, chainId])
}

export function useTransactionStatus(hash: string | undefined) {
  const { chainId } = useWeb3()

  const [status, setStatus] = useState('INITIAL')

  const transactions = useSelector<any, any>((state) => state.transactions)
  const allTransactions = chainId ? transactions[chainId] : []

  useEffect(() => {
    if (!hash) {
      setStatus('INITIAL')
    } else {
      if (allTransactions[hash]?.addedTime && !allTransactions[hash]?.confirmedTime) {
        setStatus('PENDING')
      }
      if (allTransactions[hash]?.addedTime && allTransactions[hash]?.confirmedTime) {
        setStatus('COMPLETED')
      }
    }
  }, [allTransactions, hash])

  return status
}

export const useAllPendingTransactions = (key?: string) => {
  const allTransactions = useAllTransactions()

  const sortedRecentTransactions = useMemo(() => {
    const txs = Object.values(allTransactions)
    return txs.filter(isTransactionRecent).sort(newTransactionsFirst)
  }, [allTransactions])

  const pending = sortedRecentTransactions.filter((tx) => !tx.receipt)
  if (key) {
    return pending.filter((tx) => tx?.key === key)
  }
  return pending
}

export function useIsTransactionPending(transactionHash?: string): boolean {
  const transactions = useAllTransactions()

  if (!transactionHash || !transactions[transactionHash]) return false

  return !transactions[transactionHash].receipt
}

/**
 * Returns whether a transaction happened in the last day (86400 seconds * 1000 milliseconds / second)
 * @param tx to check for recency
 */
export function isTransactionRecent(tx: TransactionDetails): boolean {
  return new Date().getTime() - tx.addedTime < 86_400_000
}

// returns whether a token has a pending approval transaction
export function useHasPendingApproval(tokenAddress: string | undefined, spender: string | undefined): boolean {
  const allTransactions = useAllTransactions()
  return useMemo(
    () =>
      typeof tokenAddress === 'string' &&
      typeof spender === 'string' &&
      Object.keys(allTransactions).some((hash) => {
        const tx = allTransactions[hash]
        if (!tx) return false
        if (tx.receipt) {
          return false
        } else {
          const approval = tx.approval
          if (!approval) return false
          return approval.spender === spender && approval.tokenAddress === tokenAddress && isTransactionRecent(tx)
        }
      }),
    [allTransactions, spender, tokenAddress]
  )
}
