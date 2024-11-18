import moment from 'moment'
import { useEffect, useState } from 'react'
import { Box, Card, Flex } from 'rebass/styled-components'
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis } from 'recharts'

import { Title } from './Title'
import { TimeFilters } from './Filter'
import { Placeholder } from './Placeholder'
import { ChartTooltip } from './ChartTooltip'
import { usePair } from '../../../hooks/usePair'
import { CurrencyDropdown } from './CurrencyDropdown'
import { ComponentLoader } from '../../../wrappers/ComponentLoader'
import { useVoltageExchange } from '../../../hooks/useVoltageExchange'

export enum Views {
  USD,
  RATE,
}

export const NUMBER_OF_DAYS = {
  WEEK: 7,
  MONTH: 30,
  YEAR: 365,
}

export const MOD = {
  [NUMBER_OF_DAYS.WEEK]: 1,
  [NUMBER_OF_DAYS.MONTH]: 2,
  [NUMBER_OF_DAYS.YEAR]: 2,
}
const CHART_HEIGHT = 250

const SwapChart = ({ token0, token1 }: { token0: any; token1: any; onCurrencySelection?: any }) => {
  const [numberOfDays, setNumberOfDays] = useState(NUMBER_OF_DAYS.WEEK)
  const [view, setView] = useState(Views.USD)

  const [exchange, loadingExchange] = useVoltageExchange(numberOfDays, token0)
  const [rates, loadingRates] = usePair(numberOfDays, token0, token1)

  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)

  const [attribute, setAttribute] = useState('priceUSD')

  useEffect(() => {
    if (view === Views.USD) {
      setAttribute('priceUSD')
      setData(exchange)
      setLoading(loadingExchange)
    } else if (view === Views.RATE) {
      setAttribute('rate')
      setData(rates)
      setLoading(loadingRates)
    }
  }, [exchange, rates, view])

  return (
    <Card pb={3} pt={4} minHeight={395} sx={{ position: 'relative' }} px={0}>
      {!loading && data?.length === 0 && <Placeholder />}

      <Flex justifyContent={'space-between'}>
        <Title
          data={data}
          loading={loading}
          attribute={attribute}
          numberOfDays={numberOfDays}
          isUsd={attribute === 'priceUSD'}
        />

        <Flex sx={{ gap: [3, 2, 3] }}>
          <CurrencyDropdown setView={setView} view={view} token0={token0} token1={token1} />

          <TimeFilters view={view} setNumberOfDays={setNumberOfDays} numberOfDays={numberOfDays} />
        </Flex>
      </Flex>

      <Box my={!loading && data?.length !== 0 ? 4 : 3}></Box>

      {loading && (
        <Box height={CHART_HEIGHT} width={'100%'} px={3}>
          <ComponentLoader width={'100%'} height={CHART_HEIGHT} loading={loading} />
        </Box>
      )}

      {!loading && data?.length !== 0 && (
        <ResponsiveContainer height={CHART_HEIGHT}>
          <AreaChart
            width={500}
            height={420}
            data={data}
            margin={{
              top: 10,
              right: 0,
              left: 0,
              bottom: 0,
            }}
          >
            <defs>
              <linearGradient id="colorPv" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#70E000" stopOpacity={0.15} />
                <stop offset="100%" stopColor="#70E000" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis
              tickFormatter={(t) => {
                if (numberOfDays === NUMBER_OF_DAYS.YEAR) {
                  return moment(t).format('MMM, YY')
                } else if (numberOfDays === NUMBER_OF_DAYS.MONTH || numberOfDays === NUMBER_OF_DAYS.WEEK) {
                  return moment(t).format('DD')
                }
              }}
              dataKey={({ date }) => date}
              fontSize={12}
              ticks={
                // Do not repeat months on the year view
                numberOfDays === NUMBER_OF_DAYS.YEAR
                  ? Array.from(new Set(data.map(({ date }) => moment(date).format('YYYY-MM')))).map(
                      (monthYear) => monthYear + '-01'
                    )
                  : Array.from(new Set(data.map(({ date }) => date)))
              }
              interval={'preserveStartEnd'}
              tickLine={false}
              axisLine={false}
              color="#6B6B6B"
              opacity={0.5}
            />

            <Tooltip content={<ChartTooltip attribute={attribute} data={data} />} />

            <Area type="monotone" dataKey={attribute} stroke="#70E000" fillOpacity={1} fill="url(#colorPv)" />
          </AreaChart>
        </ResponsiveContainer>
      )}
    </Card>
  )
}

export default SwapChart
