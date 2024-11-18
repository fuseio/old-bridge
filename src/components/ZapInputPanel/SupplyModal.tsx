import { Currency, Fraction, Token } from '@voltage-finance/sdk-core'
import React from 'react'
import { Flex } from 'rebass'
import { Box, Button, Card } from 'rebass/styled-components'
import { TYPE } from '../../theme'
import CurrencyLogo from '../Logo/CurrencyLogo'
import DoubleCurrencyLogo from '../DoubleLogo'
import ModalLegacy from '../ModalLegacy'

interface SupplyModalProps {
  title: string
  description?: string
  from: {
    inputCurrency?: Currency
    amount: string
  }
  to: {
    tokens:
      | {
          token0?: Token
          token1?: Token
          ratios?: {
            token0Amount: Fraction
            token1Amount: Fraction
          }
        }
      | undefined

    amount: string
  }
  slippage?: boolean | undefined
  slippageAmount?: string | undefined
  isOpen: boolean
  onDismiss: () => void
  onConfirm: () => void
}

export default function SupplyModal({ from, to, isOpen, onDismiss, onConfirm }: SupplyModalProps) {
  return (
    <ModalLegacy isOpen={isOpen} onDismiss={onDismiss}>
      <ModalLegacy.Content>
        <Box width={[1, 500]} mx="auto">
          <Card>
            <Flex style={{ gap: '4px' }} alignItems="center">
              <TYPE.mediumHeader fontWeight={500} marginRight={10}>
                {to.amount}
              </TYPE.mediumHeader>
              <DoubleCurrencyLogo currency0={to.tokens?.token0} currency1={to.tokens?.token1} size={30} />
            </Flex>
            <Box py={1}></Box>
            <TYPE.mediumHeader>
              {to.tokens?.token0?.symbol + '/' + to.tokens?.token1?.symbol + ' Pool Tokens'}
            </TYPE.mediumHeader>
            <Box py={1}></Box>

            <TYPE.italic color="text2" textAlign="left" padding={'8px 0 0 0 '}>
              {`Output is estimated`}
            </TYPE.italic>
            <Box py={1}></Box>

            <Flex justifyContent={'space-between'} alignItems={'center'}>
              <TYPE.main color="text2">{to.tokens?.token0?.symbol} Estimated:</TYPE.main>
              <Flex alignItems={'center'} style={{ gap: '4px' }}>
                <TYPE.main>{from.amount}</TYPE.main>

                <CurrencyLogo currency={from.inputCurrency} />
              </Flex>
            </Flex>
            <Box py={1}></Box>
            <Flex justifyContent={'space-between'} alignItems={'center'}>
              <TYPE.main color="text2">{to.tokens?.token0?.symbol} Estimated:</TYPE.main>
              <Flex alignItems={'center'} style={{ gap: '4px' }}>
                <TYPE.main>{to.tokens?.ratios?.token0Amount.toSignificant(6) || 0}</TYPE.main>

                <CurrencyLogo currency={to.tokens?.token0} />
              </Flex>
            </Flex>
            <Box py={1}></Box>
            <Flex justifyContent={'space-between'} alignItems={'center'}>
              <TYPE.main color="text2">{to.tokens?.token1?.symbol} Estimated:</TYPE.main>
              <Flex alignItems={'center'} style={{ gap: '4px' }}>
                <TYPE.main>{to.tokens?.ratios?.token1Amount.toSignificant(6) || 0}</TYPE.main>

                <CurrencyLogo currency={to.tokens?.token1} />
              </Flex>
            </Flex>
            <Box py={1}></Box>

            <Button variant={'primary'} onClick={onConfirm}>
              Confirm Zap
            </Button>
          </Card>
        </Box>
      </ModalLegacy.Content>
    </ModalLegacy>
  )
}
