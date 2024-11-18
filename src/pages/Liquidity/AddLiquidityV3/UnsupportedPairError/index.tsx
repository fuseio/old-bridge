import { AlertTriangle } from 'react-feather'
import { Flex, Text } from 'rebass/styled-components'
import { preset } from '../../../../theme/preset'

export const UnsupportedError = () => {
  return (
    <Flex
      sx={{ borderRadius: 'default', gap: 2 }}
      py={3}
      justifyContent={'center'}
      width={'100%'}
      alignItems={'center'}
      bg={preset?.colors.gray70}
      flexDirection={'column'}
    >
      <AlertTriangle strokeWidth={0.9} />
      <Text lineHeight={1.4} textAlign={'center'}>
        Unsupported Pair
      </Text>
    </Flex>
  )
}
