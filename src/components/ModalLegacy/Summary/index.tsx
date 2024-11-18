import { Box, Flex } from 'rebass/styled-components'

const ModalSummary = ({ bordered, children }: { bordered?: any; children: any }) => {
  return (
    <Box pt={bordered ? 3 : 0}>
      {bordered && <Box pt={3} variant={'borderLight'} px={3}></Box>}

      <Flex flexDirection={'column'} sx={{ gap: 2 }} px={bordered ? 3 : 0}>
        {children}
      </Flex>
    </Box>
  )
}

ModalSummary.displayName = 'ModalSummary'
export default ModalSummary
