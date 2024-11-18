import { useState } from 'react'
import { Box, Flex } from 'rebass/styled-components'

import AppBody from '../AppBody'
import Overview from './Overview'
import VolumeChart from './VolumeChart'
import Page from '../../collections/Page'
import LiquidityChart from './LiquidityChart'
import Filter from '../../components/Table/Filter'

export enum Version {
  V2 = 'v2',
  V3 = 'v3',
}

export default function Analytics() {
  const [version, setVersion] = useState<Version>(Version.V2)

  const versionFilter = Object.values(Version).map((ver) => ({
    name: ver,
    key: ver,
  }))

  return (
    <AppBody>
      <Page>
        <Page.Header>Voltage Analytics</Page.Header>

        <Page.Body>
          <Box pb={2}>
            <Filter
              activeIndex={versionFilter.findIndex(({ key }) => key === version)}
              filters={versionFilter}
              onFilter={({ key }) => {
                setVersion(key as Version)
              }}
            />
          </Box>

          <Flex flexDirection={'column'} sx={{ gap: 3 }}>
            <Flex maxHeight={390} width={'100%'} sx={{ gap: 4 }}>
              <Flex maxHeight={390} width={1 / 2}>
                <LiquidityChart version={version} />
              </Flex>

              <Flex maxHeight={390} width={1 / 2}>
                <VolumeChart version={version} />
              </Flex>
            </Flex>

            <Overview version={version} />
          </Flex>
        </Page.Body>
      </Page>
    </AppBody>
  )
}
