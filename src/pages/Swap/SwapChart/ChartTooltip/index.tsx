import moment from 'moment'

import { Card, Flex, Text } from 'rebass/styled-components'
import { calculatePercentageChange, formattedNum } from '../../../../utils'

interface ChartTooltipProps {
  active?: boolean
  payload?: any
  data?: any
  attribute?: string
}

/**
 * Tooltip when hovering over the line in the chart
 */
export const ChartTooltip = ({ active, payload, data, attribute = 'priceUSD' }: ChartTooltipProps) => {
  if (!active || !payload || payload.length < 1) {
    return null
  }

  const chartPayload = payload[0]
  const currentTimestamp = chartPayload.payload.timestamp
  const currentPrice = chartPayload.payload[attribute]

  let previousPrice
  for (let i = 1; i < data.length; i++) {
    // Start from 1 because there's no previous item for the first
    if (data[i].timestamp === currentTimestamp) {
      previousPrice = data[i - 1]?.[attribute]
    }
  }

  let priceChangeText = null
  if (previousPrice) {
    // Price change from previous day to chosen day
    const priceChange = calculatePercentageChange(previousPrice, currentPrice)
    const formattedPriceChange = `${parseFloat(priceChange.toString()).toFixed(2)}%`

    priceChangeText = (
      <Text color={priceChange < 0 ? 'error' : 'highlight'} fontWeight={600}>
        {formattedPriceChange}
      </Text>
    )
  }

  return (
    <Card px={3} py={3}>
      <Flex sx={{ gap: 1 }} flexDirection={'column'}>
        <Text fontSize={3} fontWeight={600}>
          {formattedNum(payload[0].payload[attribute], attribute === 'priceUSD' ? true : false)}
        </Text>
        <Flex fontSize={1} sx={{ gap: 2 }}>
          {priceChangeText}
          <Text color={'blk50'}>{moment(payload[0].payload.date).format('MMM DD')}</Text>
        </Flex>
      </Flex>
    </Card>
  )
}
