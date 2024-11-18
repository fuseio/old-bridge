import { Flex, Text } from 'rebass'
import { BarChart } from 'react-feather'

import { preset } from '../../../../theme/preset'

export const Placeholder = () => {
  return (
    <Flex
      pt={3}
      pb={3}
      width={'100%'}
      alignItems={'center'}
      sx={{ gap: 3, position: 'absolute', bottom: 135 }}
      flexDirection={'column'}
      justifyContent={'center'}
    >
      <Flex
        justifyContent={'center'}
        alignItems={'center'}
        px={1}
        py={1}
        sx={{ border: `1px solid ${preset.colors.gray}`, borderRadius: 6 }}
      >
        <BarChart color={preset.colors.blk50} />
      </Flex>
      <Text fontSize={1} color={'blk70'}>
        We don&apos;t have data for this token
      </Text>
    </Flex>
  )
}
