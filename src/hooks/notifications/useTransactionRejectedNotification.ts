import { useNotifications } from '@web3-onboard/react'
import { ERROR } from '../../state/application/hooks'

export const useTransactionRejectedNotification = () => {
  const [, customNotifications] = useNotifications()

  return () => {
    customNotifications({
      type: 'error',
      message: ERROR.TRANSACTION_REJECTED,
      autoDismiss: 3000,
    })
  }
}
