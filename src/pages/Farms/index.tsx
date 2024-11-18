import React, { useState } from 'react'
import { useSelector } from 'react-redux'
import { ChevronRight } from 'react-feather'
import { useHistory } from 'react-router-dom'
import { Token } from '@voltage-finance/sdk-core'
import { Box, Card, Flex, Text } from 'rebass/styled-components'

import APR from './APR'
import V3APR from './V3/APR'
import Rewards from './Rewards'
import AppBody from '../AppBody'
import Positions from './Positions'
import V3Rewards from './V3/Rewards'
import { useWeb3 } from '../../hooks'
import V3Positions from './V3/Positions'
import Page from '../../collections/Page'
import Table from '../../components/Table'
import FarmUpdater from '../../state/farm/updater'
import Filter from '../../components/Table/Filter'
import { Statistic } from '../../components/Statistic'
import { AnimatedLoader } from '../../components/Loader'
import SwitchNetwork from '../../components/SwitchNetwork'
import { addTokenToWallet, shortenAddress } from '../../utils'
import { useAllFarmColumns, useMyFarmColumns, useV3FarmColumns } from './columns'

const FARM_FILTERS = [
  {
    name: 'V2',
    key: 'V2_FARMS',
  },
  {
    name: 'V3',
    key: 'V3_FARMS',
  },
  {
    name: 'My Farms',
    key: 'MY_FARMS',
  },
]

export default function Farms() {
  const [filter, setFilter] = useState('V2_FARMS')
  const [activeIndex, setActiveIndex] = useState(0)

  const { library } = useWeb3()
  const history = useHistory()
  const { activeFarms, v3Farms, myFarms, loadingFarms } = useSelector((state: any) => state?.farm?.farms)
  const allColumns = useAllFarmColumns()
  const myColumns = useMyFarmColumns()
  const v3FarmColumns = useV3FarmColumns()

  const renderRowSubComponent = React.useCallback(({ row }) => {
    if (row?.original?.version === 'v2') {
      return (
        <Flex p={3} flexDirection={['column', 'row']} sx={{ gap: 3 }} height={['fit-content']} width={['100%']}>
          <Box width={['100%', '30%']}>
            <APR farm={row?.original} />
          </Box>
          <Box pt={[2, 0]} width={['100%', '35%']}>
            <Positions farm={row?.original} />
          </Box>
          <Box width={['100%', '35%']}>
            <Rewards farm={row?.original} />
          </Box>
        </Flex>
      )
    } else {
      return (
        <Flex p={3} width={'100%'} sx={{ gap: 3 }} flexDirection={'column'}>
          {row?.original?.positions?.length > 0 ? (
            row?.original?.positions?.map((position, index) => (
              <Flex
                p={3}
                key={index}
                flexDirection={['column', 'row']}
                sx={{ gap: 3 }}
                height={['fit-content']}
                width={['100%']}
              >
                <Box width={['100%', '30%']}>
                  <V3APR pool={position} apr={row?.original?.apr} />
                </Box>
                <Box pt={[2, 0]} width={['100%', '35%']}>
                  <V3Positions pool={position} />
                </Box>
                <Box width={['100%', '35%']}>
                  <V3Rewards pool={position} />
                </Box>
              </Flex>
            ))
          ) : (
            <Flex p={3} flexDirection={['column', 'row']} sx={{ gap: 3 }} height={['fit-content']} width={['100%']}>
              <Box width={['100%', '30%']}>
                <Flex
                  fontSize={1}
                  justifyContent={'center'}
                  width={'100%'}
                  sx={{ gap: 3, cursor: 'pointer' }}
                  flexDirection={'column'}
                >
                  <Statistic
                    name="APR"
                    decimals={0}
                    size={1}
                    value={
                      typeof row?.original?.apr === 'number' && row?.original?.apr === Infinity
                        ? row?.original?.apr
                        : row?.original?.apr?.toFixed(2) + '%'
                    }
                  />

                  <Flex sx={{ gap: 2 }} flexDirection={'column'}>
                    <Text fontSize={1} color="blk50" fontWeight={600}>
                      Contract Address
                    </Text>
                    <Text>{shortenAddress(row?.original?.v3Pool, 6)}</Text>
                  </Flex>
                  <Flex sx={{ gap: 3 }} width={'100%'}>
                    <Text
                      onClick={() => {
                        window.open('https://explorer.fuse.io/address/' + row?.original?.v3Pool, '_blank')
                      }}
                    >{`View Contract`}</Text>
                    <Text
                      onClick={() => {
                        addTokenToWallet(
                          new Token(
                            122,
                            row?.original?.v3Pool,
                            row?.original?.token0?.decimals,
                            row?.original?.token0?.symbol.replace('V2', '') +
                              '-' +
                              row?.original?.token1?.symbol.replace('V2', ''),
                            row?.original?.token0?.symbol.replace('V2', '') +
                              '-' +
                              row?.original?.token1?.symbol.replace('V2', '')
                          ),
                          library
                        )
                      }}
                    >{`Add LP Token`}</Text>
                  </Flex>
                </Flex>
              </Box>

              <Box width={['100%', '35%']}>
                <Card px={3} py={3} backgroundColor={'white'} height={'100%'} width={'100%'}>
                  <Flex sx={{ gap: 3 }} flexDirection={'column'}>
                    <Text pb={2} fontSize={1}>
                      Position
                    </Text>
                    <Text py={2} lineHeight={1.4} textAlign="center" fontSize={1}>
                      You have no positions yet, add liquidity to start earning.
                    </Text>
                  </Flex>
                </Card>
              </Box>
              <Box width={['100%', '35%']}>
                <Card px={3} py={3} backgroundColor={'white'} height={'100%'} width={'100%'}>
                  <Flex sx={{ gap: 3 }} flexDirection={'column'}>
                    <Text pb={2} fontSize={1}>
                      Rewards
                    </Text>
                    <Text py={2} lineHeight={1.4} textAlign="center" fontSize={1}>
                      You have no rewards yet, add liquidity to start earning.
                    </Text>
                    <Flex pt={2} alignItems={'end'} justifyContent="end" width={'100%'} style={{ gap: '2px' }}>
                      <Flex style={{ gap: '8px' }}>
                        <Text
                          onClick={() => {
                            history.push(
                              `/add/${row?.original?.token0?.id}/${row?.original?.token1?.id}?version=v3&feeAmount=3000`
                            )
                          }}
                          fontSize={1}
                          color="#4FB2DC"
                          style={{ cursor: 'pointer' }}
                          fontWeight={500}
                        >
                          Add Liquidity
                        </Text>
                      </Flex>
                      <ChevronRight color="#4FB2DC" style={{ marginTop: '2px' }} size={16} />
                    </Flex>
                  </Flex>
                </Card>
              </Box>
            </Flex>
          )}
        </Flex>
      )
    }
  }, [])

  let columns = []
  let data = []

  switch (filter) {
    case 'MY_FARMS':
      columns = myColumns
      data = myFarms
      break

    case 'V3_FARMS':
      columns = v3FarmColumns
      data = v3Farms
      break

    case 'V2_FARMS':
    default:
      columns = allColumns
      data = activeFarms
      break
  }

  const showEmptyMessage = (filter === 'MY_FARMS' || filter === 'V3_FARMS') && data.length === 0

  let body = (
    <Card>
      <Box py={1}></Box>
      <Filter
        filters={FARM_FILTERS}
        activeIndex={activeIndex}
        onFilter={({ key }) => {
          setFilter(key)
          setActiveIndex(FARM_FILTERS.findIndex((item) => item?.key === key))
        }}
      />
      <Box py={2}></Box>

      {showEmptyMessage ? (
        <Box minHeight={200} fontSize={3} textAlign="center" pt={70}>
          {`You don't have any positions.`}
        </Box>
      ) : (
        <Table columns={columns} renderRowSubComponent={renderRowSubComponent} data={data} />
      )}
    </Card>
  )

  if (loadingFarms && activeFarms?.length === 0) {
    body = (
      <Flex justifyContent={'center'}>
        <AnimatedLoader />
      </Flex>
    )
  }

  return (
    <AppBody>
      <Page>
        <SwitchNetwork />
        <FarmUpdater />

        <Page.Header>
          <Text display={'inline'}>Farms</Text>
        </Page.Header>

        <Page.Subheader> Stake your LP tokens and earn more.</Page.Subheader>

        <Page.Body>{body}</Page.Body>
      </Page>
    </AppBody>
  )
}
