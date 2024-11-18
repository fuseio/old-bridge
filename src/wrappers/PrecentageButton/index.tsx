import React from 'react'
import { Flex, Text } from 'rebass/styled-components'

export const PercentageButton = ({
  amount,
  active,
  width,
  fontSize = 0,
  minWidth = 45,
  // variant = 'badge',
  onClick,
  py = 2,
  px = 2,
}: {
  amount?: number
  active?: boolean
  variant?: string
  minWidth?: number | string
  fontSize?: number | string
  width?: number | string
  px?: number | string
  py?: number | string

  onClick?: React.MouseEventHandler<HTMLDivElement>
}) => {
  return (
    <Flex
      alignItems={'center'}
      justifyContent="center"
      px={px}
      py={py}
      width={width}
      minWidth={minWidth}
      sx={{ cursor: 'pointer', opacity: active ? 1 : 0.5 }}
      // variant={variant}
      onClick={onClick}
    >
      <Text fontSize={fontSize}>{amount}%</Text>
    </Flex>
  )
}
