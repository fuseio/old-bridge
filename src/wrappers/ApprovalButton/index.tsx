import { Currency, Token } from '@voltage-finance/sdk-core'

import { Button } from 'rebass/styled-components'
import { ApprovalState } from '../../hooks/useApproveCallback'

interface ApprovalButtonProps {
  id?: string
  approval: number
  approveCallback: () => void
  onClick?: any
  enableApprove?: boolean
  currencyToApprove?: Currency | Token
  error?: string | null | undefined
  children?: React.ReactChild
}

export const ApprovalButton = ({
  id,
  onClick,
  currencyToApprove,
  error,
  approval,
  approveCallback,
  enableApprove = true,
  children,
}: ApprovalButtonProps) => {
  if (error) {
    return (
      <Button id={id} width={'100%'} variant="error">
        {error}
      </Button>
    )
  }

  if (enableApprove) {
    if (approval === ApprovalState.PENDING) {
      return (
        <Button id={id} width={'100%'} variant="error">
          {currencyToApprove?.symbol ? `Approving ${currencyToApprove?.symbol}...` : 'Approving...'}
        </Button>
      )
    }

    if (approval === ApprovalState.NOT_APPROVED) {
      return (
        <Button id={id} variant="primary" onClick={approveCallback}>
          Approve {currencyToApprove?.symbol || ''}
        </Button>
      )
    }

    if (approval === ApprovalState.APPROVED) {
      return (
        <Button id={id} variant="primary" onClick={onClick}>
          {children || <div></div>}
        </Button>
      )
    }
  }

  return (
    <Button id={id} variant="primary" disabled={enableApprove && approval === ApprovalState.UNKNOWN} onClick={onClick}>
      {children || <div></div>}
    </Button>
  )
}
