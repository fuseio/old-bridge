import { Flex, Box } from 'rebass/styled-components'
import MultiCurrencyLogo from '../../../../components/MultiCurrencyLogo'
import { appendV2, formatFeeAmount, formattedNum } from '../../../../utils'

export default function V3Columns() {
  return [
    {
      Header: () => <Box textAlign={'left'}>Name</Box>,
      id: 'name',
      width: [8 / 16],
      accessor: ({ token0, token1, feeTier }) => {
        return (
          <Flex style={{ gap: 10 }} alignItems={'center'}>
            <MultiCurrencyLogo size={'28'} tokenAddresses={[token0?.id || '', token1?.id || '']} />
            {appendV2(token0?.id, token0?.symbol)}-{appendV2(token1?.id, token1?.symbol)}
            <Box sx={{ borderRadius: '5px' }} fontSize={1} px={2} py={1} bg="gray70">
              {formatFeeAmount(feeTier)}%
            </Box>
          </Flex>
        )
      },
    },

    {
      Header: () => <Box textAlign={'left'}>Liquidity (24h)</Box>,
      id: 'liquidity',
      width: [4 / 16],
      accessor: ({ tvlUSD }) => {
        return (
          <Flex style={{ gap: 10 }} alignItems={'center'}>
            {formattedNum(tvlUSD, true)}
          </Flex>
        )
      },
    },
    {
      Header: () => <Box textAlign={'left'}>Volume (24h)</Box>,
      id: 'volume',
      width: [4 / 16],
      accessor: ({ volumeUSD }) => {
        return (
          <Flex style={{ gap: 10 }} alignItems={'center'}>
            {formattedNum(volumeUSD, true)}
          </Flex>
        )
      },
    },
  ]
}
