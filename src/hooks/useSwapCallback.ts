import { useMemo } from 'react'
import { useTransactionAdder } from '../state/transactions/hooks'
import { getSigner, isAddress, shortenAddress } from '../utils'
import { useWeb3 } from './index'
import { useTransactionRejectedNotification } from './notifications/useTransactionRejectedNotification'
import useENS from './useENS'
import { Trade } from './useTrade'

export enum SwapCallbackState {
  INVALID,
  LOADING,
  VALID,
}

// returns a function that will execute a swap, if the parameters are all valid
// and the user has approved the slippage adjusted input amount for the trade
export function useSwapCallback(
  trade: Trade, // trade to execute, required\
  recipientAddressOrName: string | null // the ENS name or address of the recipient of the trade, or null if swap should be returned to sender
): { state: SwapCallbackState; callback: null | (() => Promise<string>); error: string | null } {
  const { account, chainId, library } = useWeb3()
  const signer = library && account ? getSigner(library, account) : null
  const rejectTransaction = useTransactionRejectedNotification()

  const addTransaction = useTransactionAdder()

  const { address: recipientAddress } = useENS(recipientAddressOrName)
  const recipient = recipientAddressOrName === null ? account : recipientAddress

  return useMemo(() => {
    if (!trade || !signer || !account || !chainId) {
      return { state: SwapCallbackState.INVALID, callback: null, error: 'Missing dependencies' }
    }
    if (!recipient) {
      if (recipientAddressOrName !== null) {
        return { state: SwapCallbackState.INVALID, callback: null, error: 'Invalid recipient' }
      } else {
        return { state: SwapCallbackState.LOADING, callback: null, error: null }
      }
    }

    return {
      state: SwapCallbackState.VALID,
      callback: async function onSwap(): Promise<string> {
        return signer
          .sendTransaction({ to: trade.to, data: trade.data, value: trade.value.quotient.toString() })
          .then((response: any) => {
            const inputSymbol = trade.inputAmount.currency.symbol
            const outputSymbol = trade.outputAmount.currency.symbol
            const inputAmount = trade.inputAmount.toSignificant(3)
            const outputAmount = trade.outputAmount.toSignificant(3)

            const base = `Swap ${inputAmount} ${inputSymbol} for ${outputAmount} ${outputSymbol}`
            const withRecipient =
              recipient === account
                ? base
                : `${base} to ${
                    recipientAddressOrName && isAddress(recipientAddressOrName)
                      ? shortenAddress(recipientAddressOrName)
                      : recipientAddressOrName
                  }`

            addTransaction(response, {
              summary: withRecipient,
            })

            return response.hash
          })
          .catch((error: any) => {
            if (error?.code === 'ACTION_REJECTED' || error?.code === 4001) {
              rejectTransaction()
            }
            // if the user rejected the tx, pass this along
            if (error?.code === 4001) {
              const rejectedError: any = new Error('Transaction rejected')
              // add error code for use by next handler

              rejectedError.code = 4001
              throw rejectedError
            } else {
              // otherwise, the error was unexpected and we need to convey that
              console.error(`Swap failed`, error)
              throw new Error(`Swap failed: ${error.message}`)
            }
          })
      },
      error: null,
    }
  }, [trade, signer, account, chainId, recipient, recipientAddressOrName, addTransaction, rejectTransaction])
}
