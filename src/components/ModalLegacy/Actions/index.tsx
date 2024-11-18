import React from 'react'
import { Box } from 'rebass/styled-components'

const ModalActions = ({ children }: { children: React.ReactNode | string; _elements?: any }) => {
  return (
    <Box px={3} pt={2}>
      {children}
    </Box>
  )
}

ModalActions.displayName = 'ModalActions'
export default ModalActions
