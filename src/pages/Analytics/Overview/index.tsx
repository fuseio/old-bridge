import { useMemo } from 'react'
import { Flex, Card } from 'rebass/styled-components'
import { Version } from '..'
import useAnalyticsOverview from '../../../hooks/analytics/useAnalyticsOverview'
import V2Columns from './Columns/V2Columns'
import V3Columns from './Columns/V3Columns'
import OverviewBase from './OverviewBase'

interface OverviewProps {
  version: Version
}

export default function Overview({ version }: OverviewProps) {
  const { v2Data, v3Data } = useAnalyticsOverview()

  const props = useMemo(() => {
    return version === Version.V2
      ? { title: 'Top Tokens', data: v2Data, columns: V2Columns() }
      : { title: 'Top Pairs', data: v3Data, columns: V3Columns() }
  }, [v2Data, v3Data, version])

  return (
    <Card>
      <Flex width={'100%'} flexDirection={'column'} sx={{ gap: 3 }}>
        <OverviewBase {...props} />
      </Flex>
    </Card>
  )
}
