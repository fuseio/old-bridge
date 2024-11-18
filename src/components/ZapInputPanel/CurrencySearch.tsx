import { Currency, Token } from '@voltage-finance/sdk-core'
import { chunk, orderBy } from 'lodash'
import { useSelector } from 'react-redux'
import { Box, Flex, Text } from 'rebass/styled-components'
import styled from 'styled-components'
import { numberFormat } from '../../utils'
import MultiCurrencyLogo from '../MultiCurrencyLogo'
import Row from '../Row'
import Loader from '../../components/Loader'
export const Item = styled(Row)`
  padding-left: 25px;
  :hover {
    background: black;
    cursor: pointer;
  }
  img {
    margin-block: 10px;
    margin-right: 20px;
  }
`
interface CurrencySearchProps {
  isOpen: boolean
  onCurrencySelect: (currency: Currency, tokens: Array<Token>) => void
}

export function CurrencySearch({ onCurrencySelect }: CurrencySearchProps) {
  const { pairs, loadingPairs } = useSelector((state: any) => state?.pool)

  return (
    <Flex
      minWidth={[370, 480]}
      justifyContent="flex-start"
      flexDirection="column"
      px={2}
      style={{ width: '100%', flex: '1 1', cursor: 'pointer' }}
    >
      <Box sx={{ overflow: 'scroll' }} height={420}>
        {!loadingPairs ? (
          chunk(orderBy(pairs, 'liquidity', ['desc', 'asc']), 10)[0]?.map((pair) => {
            return (
              <Flex
                onClick={() => onCurrencySelect(pair?.lpToken, [pair.token0, pair.token1])}
                key={pair?.lpToken?.address}
                px={2}
                py={2}
                my={2}
                minHeight={55}
                sx={{
                  borderRadius: 'default',

                  ':hover': {
                    background: '#F7F7F8',
                    transition: 'background 300ms ease-in-out',
                  },
                }}
                justifyContent={'space-between'}
                width={'100%'}
              >
                <Flex sx={{ gap: 3 }} alignItems={'center'}>
                  <MultiCurrencyLogo size={24} tokenAddresses={[pair?.token0?.id, pair?.token1?.id]} />
                  <Flex sx={{ gap: 1 }} flexDirection={'column'}>
                    <Text fontWeight={500}> {pair?.lpToken?.symbol}</Text>
                  </Flex>
                </Flex>

                <Flex sx={{ gap: 2 }} alignItems={'center'} flexDirection={'column'}>
                  <Text fontSize={0} color="blk50" fontWeight={500}>
                    Liquidity
                  </Text>
                  <Text fontSize={0}>{numberFormat(pair?.liquidity, pair?.liquidity < 100 ? 2 : 0, true)}</Text>
                </Flex>
              </Flex>
            )
          })
        ) : (
          <Loader width="60px" />
        )}
      </Box>
    </Flex>
  )
}
