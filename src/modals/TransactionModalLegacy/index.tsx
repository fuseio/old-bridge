import { FC } from 'react'
import { Box, Button, Flex, Text } from 'rebass/styled-components'
import ModalLegacy from '../../components/ModalLegacy'
import { useWeb3 } from '../../hooks'
import { useTransactionStatus } from '../../state/transactions/hooks'
import Error from './Error'
import Submitted from './Submitted'
import { Currency } from '@voltage-finance/sdk-core'

interface ConfirmationModalLegacyProps {
  isOpen: boolean
  onDismiss: () => void
  hash: string | undefined
  error?: string | undefined
  header?: string
  tradeDetails: any
  transactionDetails: any
  onConfirm?: any
  message?: string
  confirmButtonText?: string
  addCurrency?: Currency
}

export default function TransactionConfirmationModalLegacy({
  isOpen,
  onDismiss,
  header,
  hash,
  error,
  addCurrency,
  message = 'Output is estimated. If the price changes by more than 0.5% your transaction will revert.',
  onConfirm,
  confirmButtonText = 'Confirm',
  tradeDetails = [],
  transactionDetails = [],
}: ConfirmationModalLegacyProps) {
  const status = useTransactionStatus(hash)
  const { chainId } = useWeb3()

  if (!chainId) return null

  const getModalContent = () => {
    if (error) {
      return (
        <>
          <ModalLegacy.Content>
            <Error message={error} />
          </ModalLegacy.Content>
          <ModalLegacy.Actions>
            <Box mx="auto" width={'fit-content'}>
              <Button variant="secondary" onClick={onDismiss}>
                Close
              </Button>
            </Box>
          </ModalLegacy.Actions>
        </>
      )
    }
    if (status === 'PENDING' || status === 'COMPLETED') {
      return (
        <>
          <ModalLegacy.Content>
            <Submitted currency={addCurrency} onClose={onDismiss} hash={hash} />
          </ModalLegacy.Content>
        </>
      )
    }

    if (status === 'INITIAL') {
      return (
        <>
          <ModalLegacy.Header>{header}</ModalLegacy.Header>
          <ModalLegacy.Content>
            <Box width={[1, 500]}>
              {tradeDetails.map(
                (
                  {
                    amount,
                    LogoComponent,
                    symbol,
                    SeperatorComponent,
                  }: {
                    amount: string
                    LogoComponent: FC
                    symbol: string
                    SeperatorComponent: FC
                  },
                  index
                ) => (
                  <Box key={index}>
                    <Flex my={3} alignItems={'center'} justifyContent={'space-between'}>
                      <>
                        <Flex style={{ gap: '4px' }} alignItems={'center'}>
                          <LogoComponent />
                          <Text fontSize={3} fontWeight={600}>
                            {amount}
                          </Text>
                        </Flex>
                        <Text fontSize={3} fontWeight={600}>
                          {symbol}
                        </Text>
                      </>
                    </Flex>
                    {SeperatorComponent && <SeperatorComponent />}
                  </Box>
                )
              )}

              <Text my={2} style={{ fontStyle: 'italic' }} fontSize={1}>
                {message}
              </Text>
              <Flex pb={2} flexDirection={'column'} style={{ gap: '4px' }}>
                {transactionDetails.map(({ header, Component }: { header: string; Component: FC }, index) => (
                  <Flex key={index} justifyContent={'space-between'}>
                    {header && (
                      <Text opacity={0.7} fontSize={1}>
                        {header}
                      </Text>
                    )}
                    <Text fontSize={1}>
                      <Component />
                    </Text>
                  </Flex>
                ))}
              </Flex>
            </Box>
          </ModalLegacy.Content>

          <ModalLegacy.Actions>
            <Button
              style={onConfirm ? { opacity: 1, pointerEvents: 'all' } : { opacity: 0.7, pointerEvents: 'none' }}
              onClick={onConfirm}
            >
              {confirmButtonText}
            </Button>
          </ModalLegacy.Actions>
        </>
      )
    }
    return <div></div>
  }

  return (
    <ModalLegacy width={'fit-content'} isOpen={isOpen} onDismiss={onDismiss} onClose={onDismiss}>
      {getModalContent()}
    </ModalLegacy>
  )
}
