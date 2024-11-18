import { Currency, CurrencyAmount } from '@voltage-finance/sdk-core'
import React from 'react'
import { Box, Flex } from 'rebass/styled-components'
import { TYPE } from '../../theme'

interface Percentage {
  selectPercentage: any
  tokenAmount?: CurrencyAmount<Currency>
  decimals?: number | undefined | null
}

export default function PercentageInputPanel({ selectPercentage, tokenAmount, decimals }: Percentage) {
  function setPercentage(amount: string) {
    if (tokenAmount) {
      selectPercentage(
        tokenAmount
          .multiply(amount)
          .divide('100')
          .toSignificant(decimals || 18, undefined, 0)
      )
    } else {
      selectPercentage(amount)
    }
  }

  return (
    <Flex style={{ gap: '8px' }}>
      <Box
        px={2}
        py={1}
        variant="outline"
        onClick={() => {
          setPercentage('25')
        }}
      >
        <TYPE.small> 25%</TYPE.small>
      </Box>
      <Box
        px={2}
        py={1}
        variant="outline"
        onClick={() => {
          setPercentage('50')
        }}
      >
        <TYPE.small>50%</TYPE.small>
      </Box>
      <Box
        px={2}
        py={1}
        variant="outline"
        onClick={() => {
          setPercentage('75')
        }}
      >
        <TYPE.small>75%</TYPE.small>
      </Box>
      <Box
        px={2}
        py={1}
        variant="outline"
        onClick={() => {
          setPercentage('100')
        }}
      >
        <TYPE.small>100%</TYPE.small>
      </Box>
    </Flex>
  )
}
