import { Currency } from '@voltage-finance/sdk-core'
import React from 'react'
import { ArrowUpCircle } from 'react-feather'
import { Button, Flex, Box } from 'rebass/styled-components'
import { TYPE } from '../../theme'
import AddTokenToMetamaskButton from '../../components/AddTokenToMetamaskButton'
import ModalLegacy from '../../components/ModalLegacy'

export default function AddTokenToMetamaskModal({
  message,
  isOpen,
  setIsOpen,
  currency
}: {
  message: string
  isOpen: boolean
  setIsOpen: (val: boolean) => void
  chainId?: number
  currency?: Currency
  hash?: string
}) {
  const handleDismiss = () => setIsOpen(false)

  return (
    <ModalLegacy width={350} isOpen={isOpen} onDismiss={handleDismiss}>
      <ModalLegacy.Content>
        <Flex py={3} justifyContent={'center'}>
          <ArrowUpCircle strokeWidth={0.5} size={80} />
        </Flex>
        <Flex flexDirection="column" textAlign={'center'} style={{ gap: '8px' }}>
          <TYPE.smallHeader fontWeight={500} fontSize={20}>
            {message}
          </TYPE.smallHeader>
        </Flex>
      </ModalLegacy.Content>
      <ModalLegacy.Actions>
        <AddTokenToMetamaskButton currency={currency} />
        <Box py={1}></Box>
        <Button variant="primary" onClick={handleDismiss}>
          Close
        </Button>
      </ModalLegacy.Actions>
    </ModalLegacy>
  )
}
