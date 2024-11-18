import { Box, Card, Flex, Text } from 'rebass/styled-components'
import { formatSignificant } from '../../../utils'

export const Prices = ({ currencies = [] }: { currencies: any }) => {
  return (
    <Card>
      <Flex flexDirection={'column'} sx={{ gap: 2 }}>
        <Text fontSize={2} fontWeight={700}>
          Prices
        </Text>
        <Flex pt={3} lineHeight={1.4} width={'100%'} flexDirection={'column'} sx={{ gap: 3 }}>
          {currencies.map(({ currencyA, currencyB, price }, index) => (
            <Box
              key={index}
              style={{ display: 'grid', gridTemplateColumns: '1.5fr 0.5fr 1fr' }}
              fontSize={2}
              sx={{ gap: 2 }}
            >
              <Text>1 {currencyA?.symbol} </Text>
              <Text>=</Text>
              <Text ml="auto">
                {price ? formatSignificant({ value: price, maxLength: 3 }) : '-'} {currencyB?.symbol}
              </Text>
            </Box>
          ))}
        </Flex>
      </Flex>
    </Card>
  )
}
