import moment from 'moment'
import { Box, Flex } from 'rebass/styled-components'
import { useCallback, useMemo, useState } from 'react'

import { useWeb3 } from '../../hooks'
import { ChainId } from '../../constants/chains'
import useAnalytics from '../../hooks/useAnalytics'
import useVoteEscrow from '../../hooks/useVoteEscrow'
import TxHashSubmmitedModal from '../TxSubmmitedModal'
import ModalLegacy from '../../components/ModalLegacy'
import { useTokenBalance } from '../../state/wallet/hooks'
import { VEVOLT_MAX_LOCK_TIMESTAMP } from '../../constants'
import { useVeVoltContract } from '../../hooks/useContract'
import { CurrencyInput } from '../../wrappers/CurrencyInput'
import { ApprovalButton } from '../../wrappers/ApprovalButton'
import { VEVOLT_ADDRESS, VOLT } from '../../constants/addresses'
import { useApproveCallback } from '../../hooks/useApproveCallback'
import tryParseCurrencyAmount from '../../utils/tryParseCurrencyAmount'
import { CheckConnectionWrapper } from '../../wrappers/CheckConnectionWrapper'
import { TransactionKey, useTransactionAdder } from '../../state/transactions/hooks'
import { useTransactionRejectedNotification } from '../../hooks/notifications/useTransactionRejectedNotification'

interface IncreaseLockAmountProps {
  isOpen: boolean
  onDismiss: () => void
}

export default function IncreaseLockAmountModal({ isOpen, onDismiss }: IncreaseLockAmountProps) {
  const { chainId, account } = useWeb3()
  const { lock, veVoltBalance } = useVoteEscrow()

  const [typedValue, setTypedValue] = useState('')
  const [txHash, setTxHash] = useState(null)
  const rejectTransaction = useTransactionRejectedNotification()
  const voltToken = useMemo(() => VOLT[chainId] || VOLT[ChainId.FUSE], [chainId])
  const voltBalance = useTokenBalance(account ?? undefined, voltToken)
  const { sendEvent } = useAnalytics()
  const parsedAmount = tryParseCurrencyAmount(typedValue, voltToken)

  const newVeVoltBalance = useMemo(() => {
    if (!parsedAmount || !lock?.end) return

    const duration = lock?.end - moment().unix()
    return lock?.amount?.add(parsedAmount).multiply(String(duration)).divide(String(VEVOLT_MAX_LOCK_TIMESTAMP))
  }, [parsedAmount, lock])

  const veVoltContract = useVeVoltContract()
  const addTransaction = useTransactionAdder()

  const onIncreaseLockAmount = useCallback(async () => {
    if (!veVoltContract || !parsedAmount) return
    try {
      const response = await veVoltContract.increase_amount(parsedAmount.quotient.toString())
      setTxHash(response?.hash)
      sendEvent('Increase locked Volt', { amount: parsedAmount.toSignificant(6) })

      addTransaction(response, {
        summary: `Increased veVolt Lockup amount to ${newVeVoltBalance?.toSignificant(6)}`,
        key: TransactionKey.VEVOLT,
      })
      onDismiss()
    } catch (e: any) {
      if (e?.code === 4001 || e?.code === 'ACTION_REJECTED') {
        rejectTransaction()
      }
    }
  }, [veVoltContract, parsedAmount, sendEvent, addTransaction, newVeVoltBalance, onDismiss, rejectTransaction])

  const [approval, approveCallback] = useApproveCallback(parsedAmount, VEVOLT_ADDRESS[chainId])

  let error
  if (!parsedAmount) {
    error = 'Enter amount'
  }

  return (
    <>
      <TxHashSubmmitedModal txHash={txHash} setTxHash={setTxHash} currency={VOLT[chainId]} />
      <ModalLegacy width={350} isOpen={isOpen} onDismiss={onDismiss} onClose={onDismiss}>
        <ModalLegacy.Header>Increase VOLT</ModalLegacy.Header>
        <ModalLegacy.Content>
          <Box pt={3} pb={2}>
            <CurrencyInput
              value={typedValue}
              currency={voltToken}
              onUserInput={setTypedValue}
              onMax={() => setTypedValue(voltBalance?.toExact())}
            />
          </Box>
          <Flex flexDirection={'column'} sx={{ gap: 2 }} py={2}>
            <ModalLegacy.Text title="Locked Balance" content={`${lock?.amount?.toSignificant(4)} VOLT`} />
            <ModalLegacy.Text title="Current Voting Power" content={`${veVoltBalance?.toSignificant(4)} veVOLT`} />
            <ModalLegacy.Text title=" New Voting Power" content={`${newVeVoltBalance?.toSignificant(4) || 0} veVOLT`} />
          </Flex>
        </ModalLegacy.Content>
        <ModalLegacy.Actions>
          <CheckConnectionWrapper>
            <ApprovalButton
              approval={approval}
              approveCallback={approveCallback}
              error={error}
              onClick={() => onIncreaseLockAmount()}
            >
              Increase
            </ApprovalButton>
          </CheckConnectionWrapper>
        </ModalLegacy.Actions>
      </ModalLegacy>
    </>
  )
}
