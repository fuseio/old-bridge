import { useCallback, useState } from 'react'
import { useSelector } from 'react-redux'
import { useParams } from 'react-router-dom'
import { Box, Flex } from 'rebass/styled-components'
import ModalLegacy from '../../components/ModalLegacy'
import LAUNCH_ABI from '../../constants/abis/launchpad.json'
import { useTransactionRejectedNotification } from '../../hooks/notifications/useTransactionRejectedNotification'
import { useApproveCallback } from '../../hooks/useApproveCallback'
import { useContract } from '../../hooks/useContract'
import { useTransactionAdder } from '../../state/transactions/hooks'
import { ApprovalButton } from '../../wrappers/ApprovalButton'
import { CheckConnectionWrapper } from '../../wrappers/CheckConnectionWrapper'
import { CurrencyInput } from '../../wrappers/CurrencyInput'
import TxHashSubmmitedModal from '../TxSubmmitedModal'
import { useCurrencyBalance } from '../../state/wallet/hooks'
import { useWeb3 } from '../../hooks'
import { formatSignificant } from '../../utils'
import tryParseCurrencyAmount from '../../utils/tryParseCurrencyAmount'

interface FundModalProps {
  isOpen: boolean
  onDismiss: any
}

const LaunchFundModal = ({ isOpen, onDismiss }: FundModalProps) => {
  const params = useParams()
  const launches = useSelector((state: any) => state.launch.launches)
  const { account } = useWeb3()
  const { saleToken, contractAddress, user } = launches.find(
    (launch: any) => launch.contractAddress === (params as any).id
  )

  const [typedValue, setTypedValue] = useState('0.0')
  const parsedAmount = tryParseCurrencyAmount(typedValue, saleToken)
  const [approval, approveCallback] = useApproveCallback(parsedAmount, contractAddress)
  const currencyBalance = useCurrencyBalance(account ?? undefined, saleToken)

  const [txHash, setTxHash] = useState(null)
  const addTransaction = useTransactionAdder()
  const rejectTransaction = useTransactionRejectedNotification()
  const launchContract = useContract(contractAddress, LAUNCH_ABI)
  const remainingAllowance = Number(user?.allocation) - Number(user?.balance)
  const fund = useCallback(
    async (amount: string) => {
      try {
        const tx = await launchContract.buy(amount)
        setTxHash(tx?.hash)
        addTransaction(tx, { summary: 'Fund Launchpad' })
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
        <ModalLegacy.Header>Fund</ModalLegacy.Header>

        <ModalLegacy.Content>
          <Box pt={3} pb={2}>
            <CurrencyInput
              value={typedValue}
              currency={saleToken}
              onUserInput={setTypedValue}
              onMax={() => {
                if (parseFloat(currencyBalance?.toSignificant(18)) > remainingAllowance) {
                  return setTypedValue(remainingAllowance?.toString())
                } else {
                  setTypedValue(currencyBalance?.toExact())
                }
              }}
            />
          </Box>
          <Flex pb={2} flexDirection={'column'} sx={{ gap: 2 }} pt={2}>
            <ModalLegacy.Text
              title={`Your Contribution`}
              content={`${formatSignificant({ value: user?.balance })} ${saleToken?.symbol}`}
            />
            <ModalLegacy.Text
              title="Your Allocation"
              content={`${formatSignificant({ value: Number(user?.allocation) - Number(user?.balance) })}  ${
                saleToken?.symbol
              }`}
            />
          </Flex>
        </ModalLegacy.Content>

        <ModalLegacy.Actions>
          <CheckConnectionWrapper>
            <ApprovalButton
              error={
                parseFloat(typedValue) + Number(user?.balance) > Number(user?.allocation) &&
                `Insufficient ${saleToken?.symbol} Allocation`
              }
              onClick={async () => {
                await fund(parsedAmount?.quotient?.toString())
              }}
              approval={approval}
              approveCallback={approveCallback}
            >
              Fund
            </ApprovalButton>
          </CheckConnectionWrapper>
        </ModalLegacy.Actions>
      </ModalLegacy>
    </>
  )
}

export default LaunchFundModal
