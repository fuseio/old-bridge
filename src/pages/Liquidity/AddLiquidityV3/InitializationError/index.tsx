import { Flex, Text } from 'rebass/styled-components'
import { preset } from '../../../../theme/preset'

export const InitializationError = () => {
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
      <Text lineHeight={1.4} fontSize={1} textAlign={'center'}>
        This pool must be initialized before you can add liquidity.
      </Text>
    </Flex>
  )
}
