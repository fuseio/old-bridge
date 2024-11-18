import { Box, Flex, Text } from 'rebass/styled-components'
import { Statistic } from '../../../components/Statistic'
import { tryFormatPercentageAmount } from '../../../utils'
const AprItem = ({ apr, symbol }: { apr: number; symbol: string }) => {
  return (
    <Flex alignItems={'center'} width="100%" justifyContent={'space-between'}>
      <Text fontWeight={500} fontSize={3}>
        {tryFormatPercentageAmount(apr)}%
      </Text>
      <Text fontWeight={300} fontSize={2}>
        {symbol}
      </Text>
    </Flex>
  )
}

const APR = ({ farm }: { farm: any }) => {
  const baseApr = isNaN(farm.baseAprPercent) ? 0 : farm.baseAprPercent
  const bonusApr = isNaN(farm.bonusAprPercent) ? 0 : farm.bonusAprPercent
  return (
    <Box backgroundColor={'transparent'} height={'100%'} pr={3} width={'100%'}>
      <Statistic
        name="Total APR"
        decimals={0}
        size={1}
        value={(tryFormatPercentageAmount(baseApr + bonusApr) || 0) + '%'}
      />

      <Box pt={3}>
        <Text fontSize={1} color="blk50" fontWeight={600} pb={2}>
          Breakdown
        </Text>
        <Flex style={{ gap: '10px' }} flexDirection={'column'}>
          {baseApr !== 0 && <AprItem apr={baseApr} symbol={farm.baseRewardSymbol} />}
          {bonusApr !== 0 && <AprItem apr={bonusApr} symbol={farm.bonusRewardSymbol} />}
        </Flex>
      </Box>
    </Box>
  )
}
export default APR
