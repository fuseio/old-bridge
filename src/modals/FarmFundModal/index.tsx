import { Token } from '@voltage-finance/sdk-core'
import { useEffect } from 'react'
import { Box, Flex, Text } from 'rebass/styled-components'
import ModalLegacy from '../../components/ModalLegacy'
import { FarmFundType } from '../../hooks/useAdjustFarmFunds'
import { useApproveCallback } from '../../hooks/useApproveCallback'
import { ApprovalButton } from '../../wrappers/ApprovalButton'
import { CurrencyInput } from '../../wrappers/CurrencyInput'
import { MultiCurrencyInput } from '../../wrappers/MultiCurrencyInput'
import { CheckConnectionWrapper } from '../../wrappers/CheckConnectionWrapper'

const FarmFundModal = ({
  farm,
  modalOpen,
  onClose,
  amount,
  setAmount,
  onTransfer,
  parsedAmount,
  type,
  balance,
}: {
  amount: string
  type: FarmFundType
  onTransfer: () => void
  setAmount: any
  balance: string | number
  parsedAmount: any
  onClose?: () => void
  modalOpen: boolean
  farm: any
}) => {
  const [approval, approveCallback] = useApproveCallback(parsedAmount, farm?.contractAddress)

  let error = ''
  if (!parsedAmount) {
    error = 'Enter an amount'
  }

  useEffect(() => {
    if (!modalOpen) {
      setAmount((0).toFixed(1))
    }
  }, [modalOpen, setAmount])

  return (
    <>
      <ModalLegacy
        width={400}
        onDismiss={() => {
          onClose()
        }}
        onClose={() => {
          onClose()
        }}
        isOpen={modalOpen}
      >
        <ModalLegacy.Header textAlign="right">
          <Flex style={{ gap: '8px' }}>
            <Text>{type}</Text>
            <Text>{farm?.pairName}</Text>
          </Flex>
        </ModalLegacy.Header>

        <ModalLegacy.Content>
          <Box>
            <Flex pt={3} flexDirection={'column'}>
              {!farm?.tokens[1] ? (
                <CurrencyInput
                  value={amount}
                  onUserInput={setAmount}
                  balance={balance}
                  currency={new Token(122, farm?.tokens[0]?.id, 18, farm?.tokens[0]?.symbol, farm?.tokens[0]?.name)}
                  onMax={() => {
                    if (balance) {
                      setAmount(balance)
                    }
                  }}
                />
              ) : (
                <MultiCurrencyInput
                  value={amount}
                  onUserInput={setAmount}
                  balance={balance}
                  token0={new Token(122, farm?.tokens[0]?.id, 18, farm?.tokens[0]?.symbol, farm?.tokens[0]?.name)}
                  token1={new Token(122, farm?.tokens[1]?.id, 18, farm?.tokens[1]?.symbol, farm?.tokens[1]?.name)}
                  onMax={() => {
                    if (balance) {
                      setAmount(balance)
                    }
                  }}
                />
              )}

              <Box py={2}></Box>
              <Flex style={{ gap: '8px' }} justifyContent={'flex-end'}>
                <CheckConnectionWrapper>
                  <ApprovalButton
                    onClick={() => {
                      onTransfer()
                    }}
                    approval={approval}
                    approveCallback={approveCallback}
                    enableApprove={type !== 'Withdraw'}
                    error={error}
                  >
                    {type}
                  </ApprovalButton>
                </CheckConnectionWrapper>
              </Flex>
            </Flex>
          </Box>
        </ModalLegacy.Content>
      </ModalLegacy>
    </>
  )
}

export default FarmFundModal
