import React from 'react'
import { AlertTriangle } from 'react-feather'
import { Box } from 'rebass'
import { TYPE } from '../../../theme'

const Error = ({ message = '' }: { message: string | undefined }) => {
  return (
    <Box>
      <Box width="fit-content" mx="auto">
        <AlertTriangle color={'red'} style={{ strokeWidth: 1.5 }} size={64} />
      </Box>
      <Box py={2}></Box>
      <Box textAlign={'center'}>
        <TYPE.smallHeader fontWeight={500} style={{ textAlign: 'center', width: '85%' }}>
          {message}
        </TYPE.smallHeader>
      </Box>
      <Box py={2}></Box>
      {/* <Button variant="primary" onClick={onDismiss}>
        Dismiss
      </Button> */}
    </Box>
  )
}

export default Error
