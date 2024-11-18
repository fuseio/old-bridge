import React from 'react'
import { Box } from 'rebass/styled-components'

const ModalContent = ({
  px = 3,
  children,
}: {
  px?: number | string
  children: React.ReactNode | string
  _elements?: any
}) => {
  return <Box px={px}>{children}</Box>
}

ModalContent.displayName = 'ModalContent'
export default ModalContent
