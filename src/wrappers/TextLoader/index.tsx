import React from 'react'
import { Box } from 'rebass/styled-components'

export const TextLoader = ({
  width = 'fit-content',
  variant = 'loading',
  loading,
  mx = loading ? 1 : 0,
  my = loading ? 1 : 0,
  children,
}: {
  loading?: boolean
  variant?: 'loading' | 'loadingDark'
  width?: string | number
  mx?: string[] | number
  my?: string[] | number
  children?: React.ReactNode
}) => {
  return (
    <Box
      style={{ zIndex: '10', position: 'relative' }}
      width={width}
      mx={mx}
      my={my}
      variant={loading ? variant : ''}
    >
      <Box style={loading ? { visibility: 'hidden' } : { visibility: 'visible' }}>{children}</Box>
    </Box>
  )
}
