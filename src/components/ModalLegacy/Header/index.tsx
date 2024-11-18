import React from 'react'
import { Box, Text } from 'rebass/styled-components'
const TEXT_ALIGN_MARGINS = {
  center: 'auto',
  left: '0px auto',
  right: 'auto 0px',
}

const ModalHeader = ({
  textAlign = 'left',
  children,
  _onPrevious,
}: {
  border?: boolean
  textAlign?: string
  _onPrevious?: any
  children: React.ReactNode | string
}) => {
  return (
    <Box>
      <Text
        px={3}
        pt={2}
        width={'90%'}
        style={{ wordWrap: 'break-word', marginLeft: _onPrevious ? '18px' : '0px' }}
        mx={TEXT_ALIGN_MARGINS[textAlign]}
        fontSize={3}
        pb={2}
        fontWeight="bold"
      >
        {children}
      </Text>
      <Box pt={2}></Box>
      <Box variant={'border'}></Box>
    </Box>
  )
}

ModalHeader.displayName = 'ModalHeader'
export default ModalHeader
