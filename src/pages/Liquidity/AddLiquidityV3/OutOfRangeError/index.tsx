import { Lock } from 'react-feather'
import { Flex, Text } from 'rebass/styled-components'
import { preset } from '../../../../theme/preset'

export const OutOfRangeError = () => {
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
      <Lock size={16} strokeWidth={0.9} />
      <Text lineHeight={1.4} fontSize={1} textAlign={'center'}>
        The market price is outside your specified price range.
      </Text>
    </Flex>
  )
}
