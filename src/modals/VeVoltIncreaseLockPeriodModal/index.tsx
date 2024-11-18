import moment from 'moment'
import { useCallback, useMemo, useState } from 'react'
import { Button, Flex, Text } from 'rebass/styled-components'
import ModalLegacy from '../../components/ModalLegacy'
import { VEVOLT_MAX_LOCK_TIMESTAMP } from '../../constants'
import { useTransactionRejectedNotification } from '../../hooks/notifications/useTransactionRejectedNotification'
import { useVeVoltContract } from '../../hooks/useContract'
import useVoteEscrow from '../../hooks/useVoteEscrow'
import { TransactionKey, useTransactionAdder } from '../../state/transactions/hooks'
import { formatFromSeconds, roundSecondsFromWeeks } from '../../utils'
import SliderBar from '../../wrappers/Slider'
import TxHashSubmmitedModal from '../TxSubmmitedModal'
import { CheckConnectionWrapper } from '../../wrappers/CheckConnectionWrapper'

interface IncreaseLockPeriodProps {
  isOpen: boolean
  onDismiss: () => void
}

const IncreaseLockPeriodModal = ({ isOpen, onDismiss }: IncreaseLockPeriodProps) => {
  const [months, setMonths] = useState(1)
  const [txHash, setTxHash] = useState(null)

  const { lock, monthsRemaining } = useVoteEscrow()
  const newUnlockTime = useMemo(() => {
    if (!lock?.end) return
    return roundSecondsFromWeeks(
      moment(parseFloat(lock?.end) * 1000)
        .add(months, 'months')
        .unix()
    )
  }, [lock, months])

  const newVeVoltBalance = useMemo(() => {
    if (!lock?.amount || !newUnlockTime) return

    const duration = newUnlockTime - moment().unix()
    return lock?.amount.multiply(String(duration)).divide(String(VEVOLT_MAX_LOCK_TIMESTAMP))
  }, [lock, newUnlockTime])

  const addTransaction = useTransactionAdder()

  const veVoltContract = useVeVoltContract()
  const rejectTransaction = useTransactionRejectedNotification()

  const onIncreaseLockTime = useCallback(async () => {
    if (!veVoltContract || !newUnlockTime) return

    try {
      const response = await veVoltContract.increase_unlock_time(newUnlockTime)
      setTxHash(response?.hash)
      addTransaction(response, {
        summary: `Increased veVolt Lockup by ${months} months`,
        key: TransactionKey.VEVOLT,
      })

      onDismiss()
    } catch (e: any) {
      if (e?.code === 4001 || e?.code === 'ACTION_REJECTED') {
        rejectTransaction()
      }
    }
  }, [veVoltContract, newUnlockTime, months])

  const getIncreaseModalDate = () => {
    return formatFromSeconds(
      roundSecondsFromWeeks(
        moment(parseFloat(lock?.end) * 1000)
          .add(months, 'months')
          .unix()
      )
    )
  }
  return (
    <>
      <TxHashSubmmitedModal txHash={txHash} setTxHash={setTxHash} />
      <ModalLegacy width={350} isOpen={isOpen} onDismiss={onDismiss} onClose={onDismiss}>
        <ModalLegacy.Header>Increase Lock Period</ModalLegacy.Header>
        <ModalLegacy.Content>
          <Flex pt={3} pb={2} sx={{ gap: 2 }}>
            <Text fontSize={2} fontWeight={600}>
              Locking Period:
            </Text>
            <Text fontWeight={600} sx={{ color: 'primary' }} textAlign={'center'} fontSize={2}>
              {months} M
            </Text>
          </Flex>
          {monthsRemaining > 1 && (
            <SliderBar
              min={1}
              max={monthsRemaining}
              value={months}
              defaultValue={1}
              id="period"
              name="period"
              onChange={(val) => {
                setMonths(val)
              }}
            />
          )}

          <Flex pt={monthsRemaining === 1 ? 2 : 3} pb={2} flexDirection={'column'} sx={{ gap: 2 }}>
            <ModalLegacy.Text title="Current VeVolt Balance" content={`${lock?.amount?.toSignificant(4)} VOLT`} />
            <ModalLegacy.Text title="New VeVolt Balance" content={`${newVeVoltBalance?.toSignificant(4)} veVOLT`} />
            <ModalLegacy.Text title="New Lockup Expiry" content={`${newUnlockTime && getIncreaseModalDate()}`} />
          </Flex>
        </ModalLegacy.Content>
        <ModalLegacy.Actions>
          <CheckConnectionWrapper>
            <Button variant="primary" onClick={() => onIncreaseLockTime()}>
              Increase
            </Button>
          </CheckConnectionWrapper>
        </ModalLegacy.Actions>
      </ModalLegacy>
    </>
  )
}
export default IncreaseLockPeriodModal
