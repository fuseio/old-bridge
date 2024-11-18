import moment from 'moment'
import { useState } from 'react'
import { Card, Flex } from 'rebass/styled-components'
import { ResponsiveContainer, XAxis, Tooltip, Bar, BarChart } from 'recharts'

import { Version } from '..'
import Filter from '../Filter'
import { AnimatedLoader } from '../../../components/Loader'
import useAnalyticsVolume from '../../../hooks/analytics/useAnalyticsVolume'

const VolumeChart = ({ version }: { version?: Version }) => {
  const [active, setActive] = useState(null)
  const [numberOfDays, setNumberOfDays] = useState(360)

  const { v2Data, v2Placeholder, v3Data, v3Placeholder } = useAnalyticsVolume(numberOfDays, version)

  const data = version === Version.V2 ? v2Data : v3Data
  const placeholderData = version === Version.V2 ? v2Placeholder : v3Placeholder

  let cardBody = (
    <Flex flexDirection={'column'} height={'100%'} width={'100%'}>
      <Filter
        title="Volume"
        amount={active?.volumeUSD || placeholderData?.volumeUSD || 0}
        date={active?.date || placeholderData?.date || 0}
        numberOfDays={numberOfDays}
        setNumberOfDays={setNumberOfDays}
        version={version}
      />
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          width={500}
          height={300}
          data={data}
          margin={{
            top: 5,
            right: 0,
            left: 0,
            bottom: 5,
          }}
          onMouseMove={({ isTooltipActive, activePayload }) => {
            if (!isTooltipActive || !activePayload) return
            setActive(activePayload[0]?.payload)
          }}
          onMouseLeave={() => {
            setActive(null)
          }}
        >
          <XAxis
            dataKey={({ date }) => {
              if (numberOfDays === 360) return moment(date).format('MMM')
              if (numberOfDays === 30) return moment(date).format('D/M')
              if (numberOfDays === 7) return moment(date).format('D')
            }}
            tickLine={false}
            axisLine={false}
            fontSize={12}
            color="#6B6B6B"
            opacity={0.5}
          />
          <Tooltip wrapperStyle={{ outline: 'none', visibility: 'hidden' }} />

          <Bar dataKey="volumeUSD" fill="#70E000" />
        </BarChart>
      </ResponsiveContainer>
    </Flex>
  )

  if (!v2Data?.length || !v3Data?.length) {
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

export default VolumeChart
