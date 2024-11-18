import React from 'react'
import { Box, Flex } from 'rebass/styled-components'
import ModalLegacy from '../../components/ModalLegacy'
import binance from '../../assets/svg/pairs/binance.svg'
import eth from '../../assets/svg/pairs/eth.svg'
import { TYPE } from '../../theme'

export default function BridgeInfoModal({ open, setOpen }: { open: boolean; setOpen: any }) {
  return (
    <ModalLegacy
      isOpen={open}
      onClose={() => {
        setOpen(false)
      }}
      width={640}
      onDismiss={() => {
        setOpen(false)
      }}
    >
      <ModalLegacy.Header>
        <Box textAlign={'center'}>Bridge Fees</Box>
      </ModalLegacy.Header>
      <ModalLegacy.Content>
        <Flex pt={3} flexDirection={'column'}>
          <Flex flexDirection={'column'}>
            <Flex pb={3} alignItems={'center'} style={{ gap: '8px' }}>
              <img style={{ height: '28px' }} src={eth} alt="ETH Icon" />
              <TYPE.mediumHeader>Ethereum</TYPE.mediumHeader>
            </Flex>
            <Flex style={{ gap: '12px' }} justifyContent={'space-between'}>
              <Box width={1} p={2} variant={'outline'}>
                <TYPE.mediumHeader>Free</TYPE.mediumHeader>
                <TYPE.small>Deposit Fee</TYPE.small>
              </Box>
              <Box width={1} p={2} variant={'outline'}>
                <TYPE.mediumHeader>
                  0.5 <span>%</span>
                </TYPE.mediumHeader>
                <TYPE.small>Withdrawal Fee</TYPE.small>
              </Box>
              <Box width={1} p={2} variant={'outline'}>
                <TYPE.mediumHeader>
                  $1000 <span>&nbsp;USD</span>
                </TYPE.mediumHeader>
                <TYPE.small>Withdrawal Minimum</TYPE.small>
              </Box>
            </Flex>
            <Box py={3}></Box>
            <Flex pb={3} alignItems={'center'} style={{ gap: '8px' }}>
              <img style={{ height: '28px' }} src={binance} alt="Binance Icon" />
              <TYPE.mediumHeader>Binance</TYPE.mediumHeader>
            </Flex>
            <Flex style={{ gap: '12px' }} justifyContent={'space-between'}>
              <Box width={1} p={2} variant={'outline'}>
                <TYPE.mediumHeader>Free</TYPE.mediumHeader>
                <TYPE.small>Deposit Fee</TYPE.small>
              </Box>
              <Box width={1} p={2} variant={'outline'}>
                <TYPE.mediumHeader>
                  0.5 <span>%</span>
                </TYPE.mediumHeader>
                <TYPE.small>Withdrawal Fee</TYPE.small>
              </Box>
              <Box width={1} p={2} variant={'outline'}>
                <TYPE.mediumHeader>
                  $100 <span>&nbsp;USD</span>
                </TYPE.mediumHeader>
                <TYPE.small>Withdrawal Minimum</TYPE.small>
              </Box>
            </Flex>
            <Box py={2}></Box>

            <Box>
              <TYPE.small>
                Please note that there are minimum limits to bridge the tokens back from Fuse network to Ethereum
                network. This is due to the high gas fees on ethereum network.
              </TYPE.small>
            </Box>
          </Flex>
        </Flex>
      </ModalLegacy.Content>
    </ModalLegacy>
  )
}
