import { get } from 'lodash'
import { useCallback, useState } from 'react'
import { useSelector } from 'react-redux'
import { useParams } from 'react-router-dom'
import { Box, Button } from 'rebass/styled-components'
import ModalLegacy from '../../components/ModalLegacy'
import LAUNCH_ABI from '../../constants/abis/launchpad.json'
import { useTransactionRejectedNotification } from '../../hooks/notifications/useTransactionRejectedNotification'
import { useContract } from '../../hooks/useContract'
import { useTransactionAdder } from '../../state/transactions/hooks'
import tryParseCurrencyAmount from '../../utils/tryParseCurrencyAmount'
import { CheckConnectionWrapper } from '../../wrappers/CheckConnectionWrapper'
import { CurrencyInput } from '../../wrappers/CurrencyInput'
import TxHashSubmmitedModal from '../TxSubmmitedModal'

interface WithdrawModalProps {
  isOpen: boolean
  onDismiss: any
}

const LaunchWithdrawModal = ({ isOpen, onDismiss }: WithdrawModalProps) => {
  const params = useParams()
  const launches = useSelector((state: any) => state.launch.launches)
  const { saleToken, contractAddress, user } = launches.find(
    (launch: any) => launch.contractAddress === (params as any).id
  )

  const balance = get(user, 'balance', 0)

  const [typedValue, setTypedValue] = useState('0.0')

  const parsedAmount = tryParseCurrencyAmount(typedValue, saleToken)

  const [txHash, setTxHash] = useState(null)
  const addTransaction = useTransactionAdder()
  const rejectTransaction = useTransactionRejectedNotification()
  const launchContract = useContract(contractAddress, LAUNCH_ABI)

  const withdraw = useCallback(
    async (amount: string) => {
      try {
        const tx = await launchContract.withdraw(amount)
        setTxHash(tx?.hash)
        addTransaction(tx, { summary: 'Withdraw Launchpad' })
        onDismiss()
        setTypedValue('0.0')
      } catch (e: any) {
        if (e?.code === 4001 || e?.code === 'ACTION_REJECTED') {
          rejectTransaction()
        }
        return e
      }
    },
    [addTransaction, launchContract, onDismiss, rejectTransaction]
  )

  return (
    <>
      <TxHashSubmmitedModal txHash={txHash} setTxHash={setTxHash} />
      <ModalLegacy width={400} onClose={onDismiss} onDismiss={onDismiss} isOpen={isOpen}>
        <ModalLegacy.Header>Withdraw</ModalLegacy.Header>

        <ModalLegacy.Content>
          <Box pt={3} pb={2}>
            <CurrencyInput
              balance={balance}
              value={typedValue}
              currency={saleToken}
              onUserInput={setTypedValue}
              onMax={() => {
                setTypedValue(balance.toString())
              }}
            />
          </Box>
        </ModalLegacy.Content>

        <ModalLegacy.Actions>
          <CheckConnectionWrapper>
            <Button
              onClick={async () => {
                await withdraw(parsedAmount?.quotient?.toString())
              }}
            >
              Withdraw
            </Button>
          </CheckConnectionWrapper>
        </ModalLegacy.Actions>
      </ModalLegacy>
    </>
  )
}

export default LaunchWithdrawModal
