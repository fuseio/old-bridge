import { Flex, Box } from 'rebass/styled-components'
import MultiCurrencyLogo from '../../../../components/MultiCurrencyLogo'
import { appendV2, formattedNum } from '../../../../utils'

export default function V2Columns() {
  return [
    {
      Header: () => <Box textAlign={'left'}>Name</Box>,
      id: 'name',
      width: [6 / 16],
      accessor: ({ symbol, id }) => {
        return (
          <Flex style={{ gap: 10 }} alignItems={'center'}>
            <MultiCurrencyLogo size={'28'} tokenAddresses={[id || '']} />
            {appendV2(id, symbol)}
          </Flex>
        )
      },
    },
    {
      Header: () => <Box textAlign={'left'}>Price (24h)</Box>,
      id: 'price',
      width: [3 / 16],
      accessor: ({ priceUSD }) => {
        return (
          <Flex style={{ gap: 10 }} alignItems={'center'}>
            {formattedNum(priceUSD, true)}
          </Flex>
        )
      },
    },
    {
      Header: () => <Box textAlign={'left'}>Liquidity (24h)</Box>,
      id: 'liquidity',
      width: [3 / 16],
      accessor: ({ totalLiquidityUSD }) => {
        return (
          <Flex style={{ gap: 10 }} alignItems={'center'}>
            {formattedNum(totalLiquidityUSD, true)}
          </Flex>
        )
      },
    },
    {
      Header: () => <Box textAlign={'left'}>Volume (24h)</Box>,
      id: 'volume',
      width: [3 / 16],
      accessor: ({ volumeUSD }) => {
        return (
          <Flex style={{ gap: 10 }} alignItems={'center'}>
            {formattedNum(volumeUSD, true)}
          </Flex>
        )
      },
    },
    {
      Header: () => <Box textAlign={'left'}># Tokens</Box>,
      id: 'change',
      width: [3 / 16],
      accessor: ({ totalLiquidityUSD, priceUSD }) => {
        return (
          <Flex style={{ gap: 10 }} alignItems={'center'}>
            {formattedNum(totalLiquidityUSD / priceUSD, false)}
          </Flex>
        )
      },
    },
  ]
}
