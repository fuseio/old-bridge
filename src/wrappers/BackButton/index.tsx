import { ChevronLeft } from 'react-feather'
import { useHistory } from 'react-router-dom'
import { Box, Flex, Text } from 'rebass/styled-components'

import NoSelect from '../NoSelect'

export const BackButton = ({ pb = 3, path }: { pb?: number; path?: string }) => {
  const history = useHistory()
  return (
    <NoSelect>
      <Box
        pb={pb}
        fontSize={1}
        sx={{ cursor: 'pointer', opacity: '0.6' }}
        onClick={() => {
          if (path) {
            history.push(path)
          } else {
            history.goBack()
          }
        }}
      >
        <Flex alignItems={'center'} sx={{ gap: 1 }}>
          <ChevronLeft size={16} />
          <Text fontSize={'18px'} fontWeight={600}>Back</Text>
        </Flex>
      </Box>
    </NoSelect>
  )
}
