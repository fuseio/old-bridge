import { Flex, Box, Text } from 'rebass/styled-components'

import { ComponentLoader } from '../../../../wrappers/ComponentLoader'
import { calculatePercentageChange, formattedNum } from '../../../../utils'

const TIME_INTERVALS = {
  7: 'Last Week',
  30: 'Last Month',
  360: 'Last Year',
}

export const Title = ({ attribute = 'priceUSD', isUsd = true, loading = false, data = [], numberOfDays = 7 }: any) => {
  const oldestPrice = data[0]?.[attribute]
  const latestPrice = data[data.length - 1]?.[attribute]

  // Price change from oldest price to latest price in timeframe (numberOfDays)
  const priceChange = calculatePercentageChange(oldestPrice, latestPrice)
  const formattedPriceChange = `${parseFloat(priceChange.toString()).toFixed(2)}%`

  const priceText = (
    <>
      <Text
        fontWeight={500}
        fontSize={'18.47px'}
        sx={{
          display: ['block', 'none', 'none'],
          visibility: !loading && data.length === 0 ? 'hidden' : 'visible',
        }}
      >
        {!loading && data.length !== 0 ? formattedNum(latestPrice, isUsd, 2) : formattedNum(0, isUsd)}
      </Text>

      <Text
        fontWeight={500}
        fontSize={'24px'}
        sx={{
          display: ['none', 'block', 'none'],
          visibility: !loading && data.length === 0 ? 'hidden' : 'visible',
        }}
      >
        {!loading && data.length !== 0 ? formattedNum(latestPrice, isUsd, 3) : formattedNum(0, isUsd)}
      </Text>

      <Text
        fontWeight={500}
        fontSize={'34px'}
        sx={{
          display: ['none', 'none', 'block'],
          visibility: !loading && data.length === 0 ? 'hidden' : 'visible',
        }}
      >
        {!loading && data.length !== 0 ? formattedNum(latestPrice, isUsd) : formattedNum(0, isUsd)}
      </Text>
    </>
  )

  return (
    <Flex px={4} flexDirection={'column'}>
      <Flex flexDirection={'column'}>
        <ComponentLoader height={50.4} width={200} loading={loading}>
          {priceText}
        </ComponentLoader>

        <Box pb={1} pt={1}>
          <ComponentLoader height={16.8} width={100} loading={loading}>
            <Flex
              alignItems={'center'}
              style={{ gap: '4px' }}
              sx={{ visibility: !loading && data.length === 0 ? 'hidden' : 'visible' }}
            >
              <Text
                fontWeight={600}
                fontSize={['7.6px', '9px', '14px']}
                color={priceChange < 0 ? 'error' : 'highlight'}
              >
                {formattedPriceChange}
              </Text>

              <Text fontSize={['7.6px', '9px', '14px']} mr={'1px'} color={'blk70'} fontWeight={600}>
                {TIME_INTERVALS[numberOfDays]}
              </Text>
            </Flex>
          </ComponentLoader>
        </Box>
      </Flex>
    </Flex>
  )
}
