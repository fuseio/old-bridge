import { useState } from 'react'
import { Box, Card, Text } from 'rebass/styled-components'

import AppBody from '../AppBody'
import Tabs from '../../wrappers/Tabs'
import MultiMint from './Multi/MultiMint'
import MultiRedeem from './Multi/MultiRedeem'
import { BackButton } from '../../wrappers/BackButton'
import SwitchNetwork from '../../components/SwitchNetwork'

export enum Version {
  v2 = 'v2',
  v3 = 'v3',
}

export default function Mint() {
  const [activeTab, setActiveTab] = useState('Mint')
  const [activeVersion, setActiveVersion] = useState(Version.v2)

  return (
    <>
      <SwitchNetwork />

      <AppBody>
        <BackButton path="/pool" />
        <Box width={[1, 500]} mx="auto">
          <Box py={2}></Box>
          <Card p={0}>
            <Box px={3} pt={3} pb={3}>
              <Tabs
                mb={1}
                onChange={(tab) => {
                  setActiveTab(tab)
                }}
                items={[
                  {
                    name: 'Mint',
                  },
                  {
                    name: 'Redeem',
                  },
                ]}
              />
              {activeTab === 'Redeem' && (
                <Tabs
                  mb={1}
                  onChange={(tab: any) => {
                    setActiveVersion(tab)
                  }}
                  items={[
                    {
                      name: Version.v2,
                    },
                    {
                      name: Version.v3,
                    },
                  ]}
                />
              )}
              <Text opacity={0.4} pt={1} fontSize={0}>
                {activeTab === 'Mint'
                  ? 'Mint USDT V2, USDC V2, and recieve fUSD'
                  : activeVersion === Version.v2
                  ? 'Redeem USDT, USDC, and BUSD using fUSD'
                  : 'Redeem USDT V2, USDC V2 using fUSD'}
              </Text>
            </Box>

            {activeTab === 'Mint' ? <MultiMint /> : <MultiRedeem version={activeVersion} />}
          </Card>
        </Box>
      </AppBody>
    </>
  )
}
