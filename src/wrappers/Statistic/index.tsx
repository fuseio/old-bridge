import { Flex, Text } from 'rebass/styled-components'
import CountUp from 'react-countup';

import { TextLoader } from '../TextLoader';

export const Statistic = ({ amount, label, loading, prefix }: { amount: number; label: string; loading?: boolean, prefix?: string }) => {
  return (
    <Flex
      minWidth={loading ? '200px' : 'auto'}
      justifyContent={'center'}
      width={'100%'}
      sx={{ gap: 1 }}
      flexDirection={'column'}
    >
      <TextLoader
        width="200px"
        loading={loading}
        variant="loadingDark"
        mx={["auto", '0']}
        my={["auto", '0']}
      >
        <CountUp
          start={0}
          end={amount}
          duration={2.75}
          prefix={prefix}
          enableScrollSpy={true}
          scrollSpyOnce={true}
        >
          {({ countUpRef }) => (
            <Text fontWeight={800} fontSize={[3, 4, 5]} ref={countUpRef} as="p">
              {loading ? 0 : amount}
            </Text>
          )}
        </CountUp>

      </TextLoader>
      <Text fontSize={1} fontWeight={500} opacity={0.6} as="p">
        {label}
      </Text>
    </Flex>
  )
}
