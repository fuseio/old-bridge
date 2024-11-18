import moment from 'moment'
import { useState } from 'react'
import { Card, Flex } from 'rebass/styled-components'

import Filter from '../Filter'
import { useTVL } from '../../../hooks/analytics/useTvl'
import { AnimatedLoader } from '../../../components/Loader'
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis } from 'recharts'

export default function LiquidityChart({ filterAddress, version }: { filterAddress?: any; version?: any }) {
  const [numberOfDays, setNumberOfDays] = useState(360)
  const [activePayload, setActivePayload] = useState(null)

  const data = useTVL(numberOfDays, filterAddress, version)
  const weekly = useTVL(7, filterAddress, version)

  let cardBody = (
    <Flex height={'100%'} width={'100%'} flexDirection={'column'}>
      <Filter
        title="Liquidity"
        amount={activePayload?.totalLiquidityUSD || weekly[weekly.length - 1]?.totalLiquidityUSD || 0}
        numberOfDays={numberOfDays}
        date={activePayload?.date || weekly[weekly.length - 1]?.date || 0}
        setNumberOfDays={setNumberOfDays}
        version={version}
      />

      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          width={500}
          height={400}
          data={data}
          onMouseMove={({ isTooltipActive, activePayload }) => {
            if (!isTooltipActive || !activePayload) return
            setActivePayload(activePayload[0]?.payload)
          }}
          onMouseLeave={() => {
            setActivePayload(null)
          }}
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
            dataKey={({ date }) => {
              if (numberOfDays === 360) return moment(date).format('MMM')
              if (numberOfDays === 30) return moment(date).format('DD')
              if (numberOfDays === 7) return moment(date).format('ddd')
            }}
            tickLine={false}
            axisLine={false}
            fontSize={12}
            color="#6B6B6B"
            opacity={0.5}
          />

          <Tooltip wrapperStyle={{ outline: 'none', visibility: 'hidden' }} />
          <Area type="monotone" dataKey="totalLiquidityUSD" stroke="#70E000" fillOpacity={1} fill="url(#colorPv)" />
        </AreaChart>
      </ResponsiveContainer>
    </Flex>
  )

  if (!weekly?.length || !data?.length) {
    cardBody = (
      <Flex height={'100%'} justifyContent={'center'} alignItems={'center'}>
        <AnimatedLoader />
      </Flex>
    )
  }

  return (
    <Card px={0} width={'100%'} minHeight={390}>
      {cardBody}
    </Card>
  )
}
