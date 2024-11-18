import { Flex, Box, Text } from 'rebass/styled-components'
import Faq from '../../../wrappers/Faq'

export default function FAQ() {
  return (
    <Flex
      height={'fit-content'}
      sx={{ gap: 4 }}
      width={'100%'}
      flexDirection={['column', 'row']}
      minHeight={[700, 500]}
    >
      <Box width={['100%', 5 / 16]}>
        <Text fontSize={[28, 48]} width={['100%', '80%']} fontWeight={700}>
          Frequently Asked Questions
        </Text>
      </Box>
      <Flex justifyContent={'flex-end'} width={['100%', 11 / 16]}>
        <Faq />
      </Flex>
    </Flex>
  )
}
