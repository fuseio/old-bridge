import React from 'react'
import { Box } from 'rebass/styled-components'

export const ComponentLoader = ({
  width = 'fit-content',
  height = 'fit-content',
  loading,
  children,
  dark,
}: {
  loading?: boolean
  height?: string | number
  width?: any
  children?: React.ReactNode
  dark?: boolean
}) => {
  if (!loading) {
    return <Box>{children}</Box>
  } else {
    return (
      <Box
        style={{ zIndex: '10', position: 'relative' }}
        height={height}
        width={width}
        variant={loading ? `loading${dark ? 'Dark' : ''}` : ''}
      ></Box>
    )
  }
}
