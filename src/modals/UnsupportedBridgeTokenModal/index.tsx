import React from 'react'
import { Box, Flex } from 'rebass/styled-components'
import ModalLegacy from '../../components/ModalLegacy'
export default function UnsupportedBridgeTokenModal({
  isOpen,
  setIsOpen
}: {
  isOpen: boolean
  setIsOpen: (val: boolean) => void
}) {
  const handleDismiss = () => setIsOpen(false)

  return (
    <ModalLegacy isOpen={isOpen} onClose={handleDismiss} onDismiss={handleDismiss}>
      <ModalLegacy.Header>Unsupported Token</ModalLegacy.Header>
      <ModalLegacy.Content>
        <Flex flexDirection={'column'}>
          <Box>
            The bridge supports only ERC20 and as Fuse is a native currency moving it to mainnet through this interface
            coming soon. In the meanwhile you can contact support hello@fuse.io
          </Box>
        </Flex>
      </ModalLegacy.Content>
    </ModalLegacy>
  )
}
