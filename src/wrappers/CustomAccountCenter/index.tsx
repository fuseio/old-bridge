import { Flex, Box } from 'rebass/styled-components'

import { AccountCenter } from './AccountCenter'

export const CustomAccountCenter = () => {
  return (
    <Box display={['none', 'block', 'block']}>
      <Flex height={36} sx={{ gap: 2 }}>
        <AccountCenter />
      </Flex>
    </Box>
  )
}
