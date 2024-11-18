import { constants } from 'ethers'
import { MaxUint256 } from '@ethersproject/constants'
import { useCallback, useMemo, useState } from 'react'
import { TransactionResponse } from '@ethersproject/providers'
import { Currency, CurrencyAmount, Token } from '@voltage-finance/sdk-core'

import { useWeb3 } from './index'
import { calculateGasMargin } from '../utils'
import { useTokenContract } from './useContract'
import ERC20_INTERFACE from '../constants/abis/erc20'
import { useTokenAllowance } from '../data/Allowances'
import { NEVER_RELOAD, useMultipleContractSingleData } from '../state/multicall/hooks'
import { useTransactionAdder, useHasPendingApproval } from '../state/transactions/hooks'

export enum ApprovalState {
  UNKNOWN,
  NOT_APPROVED,
  PENDING,
  APPROVED,
}

// returns a variable indicating the state of the approval and a function which approves if necessary or early returns
export function useApproveCallback(
  amountToApprove?: CurrencyAmount<Currency>,
  spender?: string
): [ApprovalState, () => Promise<void>] {
  const { account, chainId } = useWeb3()
  const token = amountToApprove ? (amountToApprove.currency.isToken ? amountToApprove.currency : undefined) : undefined

  const [prevAllowance, setPrevAllowance] = useState(null)
  const pendingApproval = useHasPendingApproval(token?.address, spender)
  const currentAllowance = useTokenAllowance(token, account ?? undefined, spender)

  // check the current approval status
  const approvalState: ApprovalState = useMemo(() => {
    let approvalState: ApprovalState = null

    if (prevAllowance === currentAllowance?.toSignificant(18) || pendingApproval) {
      approvalState = ApprovalState.PENDING
    } else if (!amountToApprove || !spender) {
      approvalState = ApprovalState.UNKNOWN
    } else if (amountToApprove.currency.isNative || spender === constants.AddressZero) {
      approvalState = ApprovalState.APPROVED
    }
    // we might not have enough data to know whether or not we need to approve
    else if (!currentAllowance) {
      approvalState = ApprovalState.UNKNOWN
    } else {
      // amountToApprove will be defined if currentAllowance is
      approvalState = currentAllowance.lessThan(amountToApprove) ? ApprovalState.NOT_APPROVED : ApprovalState.APPROVED
    }

    return approvalState
  }, [amountToApprove, currentAllowance, prevAllowance, pendingApproval, spender])

  const tokenContract = useTokenContract(token?.address)
  const addTransaction = useTransactionAdder()

  const approve = useCallback(async (): Promise<void> => {
    if (approvalState !== ApprovalState.NOT_APPROVED) {
      console.error('approve was called unnecessarily')
      return
    }
    if (!token) {
      console.error('no token')
      return
    }

    if (!tokenContract) {
      console.error('tokenContract is null')
      return
    }

    if (!amountToApprove) {
      console.error('missing amount to approve')
      return
    }

    if (!spender) {
      console.error('no spender')
      return
    }

    let useExact = false
    const estimatedGas = await tokenContract.estimateGas.approve(spender, MaxUint256).catch(() => {
      // general fallback for tokens who restrict approval amounts
      useExact = true
      return tokenContract.estimateGas.approve(spender, amountToApprove.quotient.toString())
    })

    return tokenContract
      .approve(spender, useExact ? amountToApprove.quotient.toString() : MaxUint256, {
        gasLimit: calculateGasMargin(estimatedGas),
      })
      .then((response: TransactionResponse) => {
        setPrevAllowance(currentAllowance?.toSignificant(18))
        addTransaction(response, {
          summary: 'Approve ' + amountToApprove.currency.symbol,
          approval: { tokenAddress: token.address, spender: spender },
        })
      })
      .catch((error: any) => {
        // only handle if user didn't reject transaction
        if (error?.code !== 4001) {
          throw error
        }
        console.debug('Failed to approve token', error)
      })
  }, [approvalState, token, tokenContract, amountToApprove, spender, currentAllowance, addTransaction, chainId])

  return [approvalState, approve]
}

export function useAllApproved(amounts?: (CurrencyAmount<Token> | undefined)[], spender?: string): boolean {
  const { account } = useWeb3()
  const tokenAddresses = useMemo(() => amounts?.map((amount) => amount?.currency.address), [amounts])
  const allowances = useMultipleContractSingleData(
    tokenAddresses ?? [],
    ERC20_INTERFACE,
    'allowance',
    [account ?? undefined, spender],
    NEVER_RELOAD
  )
  return useMemo(() => {
    if (!amounts || !allowances.length) return false
    return amounts.reduce<boolean>((approved, amount, i) => {
      return (
        approved &&
        ((amount?.lessThan(allowances[i].result?.[0]?.toString() ?? '0') ?? true) ||
          (amount?.equalTo(allowances[i].result?.[0]?.toString() ?? '0') ?? true))
      )
    }, true)
  }, [allowances, amounts])
}
