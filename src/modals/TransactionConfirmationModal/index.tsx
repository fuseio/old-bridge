import { FC } from 'react'
import { X } from 'react-feather'
import { Currency } from '@voltage-finance/sdk-core'
import { Box, Flex, Text, Button } from 'rebass/styled-components'

import { useWeb3 } from '../../hooks'
import Modal from '../../components/Modal'
import { useTransactionStatus } from '../../state/transactions/hooks'

interface TransactionConfirmationModalProps {
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

export default function TransactionConfirmationModal({
  isOpen,
  onDismiss,
  tradeDetails,
  transactionDetails,
  hash,
  onConfirm,
  confirmButtonText,
  header,
}: TransactionConfirmationModalProps) {
  const status = useTransactionStatus(hash)

  const { chainId } = useWeb3()

  if (!chainId) {
    return null
  }

  if (status !== 'INITIAL') {
    return null
  }

  return (
    <Modal width={'fit-content'} isOpen={isOpen} onDismiss={onDismiss} onClose={onDismiss}>
      <Box width={[1, 420]} backgroundColor="white" style={{ borderRadius: '20px' }} overflow="hidden">
        <Flex justifyContent={'space-between'} alignItems={'center'} padding={'22px 30px'}>
          <Text fontSize={18} fontWeight={700}>
            {header}
          </Text>
          {onDismiss && (
            <Button
              variant={'icon'}
              onClick={() => {
                onDismiss()
              }}
            >
              <X size={20} color={'black'} />
            </Button>
          )}
        </Flex>

        <Flex flexDirection={'column'} padding={'0px 30px 22px 30px'}>
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
              <Box key={index} lineHeight={1}>
                <Flex alignItems={'center'} justifyContent={'space-between'}>
                  <>
                    <Flex alignItems={'center'}>
                      <LogoComponent />
                      <Text fontSize={24} fontWeight={500} marginLeft={'0.5rem'}>
                        {amount}
                      </Text>
                    </Flex>
                    <Text fontSize={24} fontWeight={500}>
                      {symbol}
                    </Text>
                  </>
                </Flex>

                {SeperatorComponent && (
                  <Flex marginTop={'2px'} marginBottom={'2px'}>
                    <SeperatorComponent />
                  </Flex>
                )}
              </Box>
            )
          )}
        </Flex>

        <Flex backgroundColor={'gray70'} flexDirection={'column'} padding={'22px 30px 0px 30px'}>
          {transactionDetails.map(({ header, Component }: { header: string; Component: FC }, index) => (
            <Flex key={index} justifyContent={'space-between'} paddingBottom={'18px'}>
              {header && (
                <Text opacity={0.7} fontSize={14} fontWeight={500}>
                  {header}
                </Text>
              )}

              <Text fontSize={1}>
                <Component />
              </Text>
            </Flex>
          ))}
        </Flex>

        <Flex backgroundColor={'gray70'} padding={'0px 30px 26px 30px'}>
          <Button
            onClick={() => {
              if (onConfirm) {
                onConfirm()
              }
            }}
            disabled={!onConfirm}
          >
            {confirmButtonText}
          </Button>
        </Flex>
      </Box>
    </Modal>
  )
}
