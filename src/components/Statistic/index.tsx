import { Box, Flex, Text } from 'rebass/styled-components'

export interface StatisticsProps {
  name: string
  value: string | number
  decimals?: number
  prefix?: string
  suffix?: any
  fontSize?: number
  tooltip?: string | undefined
  size?: number
  loading?: boolean
  onClick?: any
}

const SIZES = {
  0: {
    name: 1,
    value: 4,
  },
  1: {
    name: 2,
    value: 5,
  },
}

export const Statistic = ({ name = '', size = 0, value = '', suffix }: StatisticsProps) => {
  return (
    <Flex flexDirection={'column'}>
      <Flex alignItems={'center'} justifyContent={'space-between'}>
        <Text pb={0} fontSize={SIZES[size]?.name} color="blk50" fontWeight={500}>
          {name}
        </Text>
        {suffix}
      </Flex>

      <Box pt={2}></Box>
      <Text fontSize={SIZES[size]?.value} color="secondary" fontWeight={600}>
        {value}
      </Text>
    </Flex>
  )
}
