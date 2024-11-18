import React, { useState } from 'react'
import { Box } from 'rebass/styled-components'

export const ClickableCard = ({
  children,
  active,
  height,
  width,
  variant = 'card',
  disabled = false,
  onClick,
  minHeight,
  px = 3,
  py = 3,
  bg,
}: {
  children: React.ReactNode
  onClick: () => void
  variant?: string
  active?: boolean
  height?: string | number
  disabled?: boolean
  width?: number | string | Array<string> | Array<number>
  minHeight?: number
  px?: number
  py?: number
  bg?: string
}) => {
  const [hover, setHover] = useState(false)
  return (
    <Box
      px={px}
      py={py}
      width={width}
      height={height}
      bg={bg}
      onMouseEnter={() => {
        setHover(true)
      }}
      onMouseLeave={() => {
        setHover(false)
      }}
      minHeight={minHeight}
      sx={
        !disabled
          ? {
              cursor: 'pointer',
              transition: 'background 200ms ease-in-out',
              opacity: hover || active ? 0.7 : 1,
              borderRadius: 'rounded',
            }
          : {
              transition: 'background 200ms ease-in-out',
              borderRadius: 'rounded',
            }
      }
      variant={variant}
      onClick={onClick}
    >
      {children}
    </Box>
  )
}
