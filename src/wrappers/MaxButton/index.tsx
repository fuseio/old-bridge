import React from 'react'
import { Box } from 'rebass/styled-components'

export const MaxButton = ({
  text = 'Max',
  onClick,
}: {
  text?: string
  onClick?: React.MouseEventHandler<HTMLDivElement>
}) => {
  return (
    <Box
      onClick={(e) => {
        onClick(e)
      }}
      sx={{ cursor: 'pointer' }}
      variant="badge"
      bg="gray70"
      fontSize={0}
    >
      {text}
    </Box>
  )
}
