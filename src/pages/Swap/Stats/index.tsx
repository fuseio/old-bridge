import { BarChart } from 'react-feather'
import { Card, Flex, Text } from 'rebass/styled-components'
import { useVoltageExchange } from '../../../hooks/useVoltageExchange'
import { preset } from '../../../theme/preset'
import { formatSignificant, formattedNum } from '../../../utils'
import { ComponentLoader } from '../../../wrappers/ComponentLoader'

const StatItem = ({ name, value, loading }: any) => {
  return (
    <Flex sx={{ gap: 2 }} flexDirection={'column'}>
      <ComponentLoader height={16.79} width={85} loading={loading}>
        <Text color="blk70" fontSize={1} fontWeight={400}>
          {name}
        </Text>
      </ComponentLoader>

      <ComponentLoader height={28.78} width={115} loading={loading}>
        <Text fontSize={[4]} fontWeight={600}>
          {value}
        </Text>
      </ComponentLoader>
    </Flex>
  )
}

const Stats = ({
  token0 = {
    symbol: 'FUSE',
  },
}: any) => {
  const [exchange, loading] = useVoltageExchange(40, token0)
  return (
    <Card minHeight={157}>
      <Flex flexDirection={'column'} sx={{ gap: 2 }}>
        <Text fontSize={2} fontWeight={700}>
          {token0?.symbol || 'FUSE'} Market Stats
        </Text>

        {exchange?.length === 0 && !loading && (
          <Flex width={'100%'} alignItems={'center'} sx={{ gap: 3 }} flexDirection={'column'} justifyContent={'center'}>
            <Flex
              justifyContent={'center'}
              alignItems={'center'}
              px={1}
              py={1}
              sx={{ border: `1px solid ${preset.colors.gray}`, borderRadius: 6 }}
            >
              <BarChart size={16} color={preset.colors.blk50} />
            </Flex>
            <Text fontSize={0} color={'blk70'}>
              We dont have data for this token
            </Text>
          </Flex>
        )}

        {exchange?.length !== 0 && !loading && (
          <Flex pt={3} sx={{ gap: 3 }} flexDirection={['column', 'row']} justifyContent={'space-between'}>
            <StatItem
              name="Total Liquidity"
              value={formattedNum(exchange[exchange?.length - 1]?.totalLiquidityUSD || 0, true)}
            />

            <StatItem name="24h Volume" value={formattedNum(exchange[exchange?.length - 1]?.volumeUSD || 0, true)} />

            <StatItem
              name="# Tokens"
              value={formatSignificant({
                value:
                  exchange[exchange?.length - 1]?.totalLiquidityUSD / exchange[exchange?.length - 1]?.priceUSD || 0,
              })}
            />
          </Flex>
        )}
        {loading && (
          <Flex pt={3} sx={{ gap: 3 }} flexDirection={['column', 'row']} justifyContent={'space-between'}>
            <StatItem loading={true} name="Total Liquidity" value={formattedNum(1000, true)} />

            <StatItem loading={true} name="24h Volume" value={formattedNum(1000, true)} />

            <StatItem
              loading={true}
              name="# Tokens"
              value={formatSignificant({
                value: 1000 || 0,
              })}
            />
          </Flex>
        )}
      </Flex>
    </Card>
  )
}
export default Stats
