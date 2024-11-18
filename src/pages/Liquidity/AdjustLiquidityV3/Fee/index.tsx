import { Flex, Text } from 'rebass/styled-components'
import MultiCurrencyLogo from '../../../../components/MultiCurrencyLogo'
import { formatSignificant } from '../../../../utils'
import { IconDivider } from '../../../../wrappers/IconDivider'

const FeeItem = ({ currency }: any) => {
  return (
    <Flex alignItems={'center'} justifyContent={'space-between'} width={'100%'}>
      <Flex sx={{ gap: 2 }} alignItems={'center'}>
        <MultiCurrencyLogo size={'30'} tokenAddresses={[currency?.address]} />
        <Text fontSize={3} fontWeight={500}>
          {currency?.symbol}
        </Text>
      </Flex>
      <Flex sx={{ gap: 1 }} alignItems={'flex-end'} flexDirection={'column'}>
        <Text fontSize={3} fontWeight={500}>
          {formatSignificant({
            value: 0.0,
          })}
        </Text>
        <Text fontSize={1} color="blk70" fontWeight={500}>
          {formatSignificant({
            value: 0.0,
            prefix: '$',
          })}
        </Text>
      </Flex>
    </Flex>
  )
}

export const Fee = ({ feeTier = 0, currencyA, currencyB }: any) => {
  return (
    <Flex flexDirection={'column'} sx={{ gap: 3 }}>
      <FeeItem currency={currencyA} />
      <FeeItem currency={currencyB} />
      <IconDivider />
      <Flex alignItems={'center'} justifyContent={'space-between'} width={'100%'}>
        <Text fontSize={3} fontWeight={500}>
          Fee Tier
        </Text>
        <Text fontSize={3} fontWeight={500}>
          {formatSignificant({
            value: feeTier,
          })}
        </Text>
      </Flex>
    </Flex>
  )
}
