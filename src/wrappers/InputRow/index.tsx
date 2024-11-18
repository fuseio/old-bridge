import React from 'react'
import { Box, Flex } from 'rebass/styled-components'

interface InputRowProps {
  onClick?: React.MouseEventHandler<HTMLDivElement>
  className?: string
  loading?: boolean
  error?: boolean
  bg?: string
  height?: number | string
  disabled?: boolean
  px?: number | string
  children: React.ReactNode
}

export const InputRow = ({
  className,
  onClick,
  disabled,
  bg = 'transparent',
  height = 65,
  px = 3,
  children,
}: InputRowProps) => {
  return (
    <Box
      sx={
        disabled
          ? { pointerEvents: 'none', opacity: '0.7', position: 'relative' }
          : { pointerEvents: 'all', opacity: '1', position: 'relative' }
      }
      px={px}
      bg={bg}
      width={'100%'}
      height={height}
      minHeight={height}
      variant="outline"
      onClick={onClick}
      className={className}
    >
      <Flex height={'100%'} alignItems={'center'}>
        {children}
      </Flex>
    </Box>
  )
}
