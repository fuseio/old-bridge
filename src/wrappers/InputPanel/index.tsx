import React from 'react'
import { Box } from 'rebass/styled-components'

export const InputPanel = ({
  className,
  onClick,
  children,
}: {
  onClick?: React.MouseEventHandler<HTMLDivElement>
  className?: string
  loading?: boolean
  children: React.ReactNode
}) => {
  return (
    <Box p={3} width={'100%'} onClick={onClick} className={className}>
      {children}
    </Box>
  )
}
