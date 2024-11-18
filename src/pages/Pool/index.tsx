import { useSelector } from 'react-redux'
import { useEffect, useMemo, useState } from 'react'
import { useHistory, useLocation } from 'react-router-dom'
import { Box, Card, Flex, Text, Image } from 'rebass/styled-components'

import AppBody from '../AppBody'
import PoolPageSearch from './Search'
import Page from '../../collections/Page'
import Table from '../../components/Table'
import PoolPageSubheader from './Subheader'
import MyPositions from './Tables/MyPositions'
import PoolUpdater from '../../state/pool/updater'
import BoostedRewards from './Tables/BoostedRewards'
import { PAIR_VERSION } from '../../state/pool/updater'
import { AnimatedLoader } from '../../components/Loader'
import { InfoTooltip } from '../../components/InfoTooltip'
import SwitchNetwork from '../../components/SwitchNetwork'
import MultiCurrencyLogo from '../../components/MultiCurrencyLogo'
import { appendV2, formatFeeAmount, formatSignificant, numberFormat } from '../../utils'

import BoostedRewardsBolt from '../../assets/svg/pool/boosted-rewards-bolt.svg'

export const POOL_PAGE_TABLE_FILTERS = {
  ALL_POOLS: { key: 'all_pools', name: 'All' },
  V2: { key: 'v2', name: 'V2' },
  V3: { key: 'v3', name: 'V3' },
  MY_POSITIONS: { key: 'my_positions', name: 'My Positions' },
  BOOSTED_REWARDS: { key: 'boosted_rewards', name: 'Boosted Rewards' },
}

const useAllPairsColumn = (filter: string) => {
  const columns = useMemo(() => {
    const textFontSize = ['11px', '12px', '14px']
    const columns = [
      {
        Header: () => (
          <Text textAlign={'left'} fontSize={textFontSize}>
            Name
          </Text>
        ),
        id: 'name',
        width: [9 / 16, 14 / 16, 9 / 16],
        accessor: ({ version, token0, token1, feeTier, isBoosted }) => {
          const multiLogos = (
            <>
              <Box display={['none', 'block']}>
                <MultiCurrencyLogo size={'30'} tokenAddresses={[token0?.id || '', token1?.id || '']} />
              </Box>
              <Box display={['block', 'none']}>
                <MultiCurrencyLogo size={'21'} tokenAddresses={[token0?.id || '', token1?.id || '']} />
              </Box>
            </>
          )

          const token0Name = appendV2(token0?.id, token0?.symbol)
          const token1Name = appendV2(token1?.id, token1?.symbol)

          const name = (
            <Text fontSize={textFontSize}>
              {token0Name}
              <Text as="span" color={'gray100'}>
                {' '}
                /{' '}
              </Text>
              {token1Name}
            </Text>
          )

          const versionTag = (
            <Box
              px={2}
              py={1}
              fontSize={textFontSize}
              sx={{ borderRadius: '6px', height: ['19.46px', '23.87px'] }}
              bg={version === PAIR_VERSION.V3 ? 'green100' : 'gray70'}
              color={version === PAIR_VERSION.V3 ? 'green900' : 'primary'}
            >
              {version === PAIR_VERSION.V3 ? 'V3' : 'V2'}
            </Box>
          )

          const feePercentage = version === PAIR_VERSION.V3 && (
            <Box
              px={2}
              py={1}
              bg="gray70"
              color={'primary'}
              fontSize={textFontSize}
              sx={{ borderRadius: '6px', height: ['19.46px', '23.87px'] }}
            >
              {formatFeeAmount(feeTier)}%
            </Box>
          )

          return (
            <Flex flexDirection={'column'} sx={{ gap: ['5px', '8px'] }}>
              <Flex alignItems={'center'} sx={{ gap: ['5px', '8px'] }}>
                {multiLogos}
                {name}

                <Box display={['none', 'block']} sx={{ textAlign: 'center' }}>
                  <Flex sx={{ gap: ['5px', '8px'] }}>
                    {versionTag}
                    {feePercentage}
                    {isBoosted && (
                      <InfoTooltip text={'Boosted Rewards'}>
                        <Image
                          src={BoostedRewardsBolt}
                          sx={{
                            height: ['20px'],
                          }}
                        />
                      </InfoTooltip>
                    )}
                  </Flex>
                </Box>
              </Flex>

              <Box display={['block', 'none']} sx={{ textAlign: 'center' }}>
                <Flex sx={{ gap: 1 }}>
                  {versionTag}
                  {feePercentage}
                </Flex>
              </Box>
            </Flex>
          )
        },
      },
      {
        Header: () => (
          <Text display={['none', 'block']} textAlign={['center', 'center', 'left']} fontSize={textFontSize}>
            Liquidity
          </Text>
        ),
        id: 'liquidity',
        width: [0, 3 / 16],
        accessor: ({ liquidity }) => {
          return (
            <Text display={['none', 'block']} fontSize={textFontSize} textAlign={['center', 'center', 'left']}>
              {numberFormat(liquidity, liquidity < 100 ? 2 : 0, true)}
            </Text>
          )
        },
      },
      {
        Header: () => (
          <>
            <Flex justifyContent={'left'} display={['none', 'none', 'block']}>
              <Text textAlign={'left'} fontSize={textFontSize} display={['none', 'none', 'block']}>
                Volume (24hr)
              </Text>
            </Flex>
            <Flex justifyContent={'center'} display={['block', 'block', 'none']}>
              <Text textAlign={'center'} fontSize={textFontSize} display={['block', 'block', 'none']}>
                Vol (24hr)
              </Text>
            </Flex>
          </>
        ),
        id: 'volume24hour',
        width: 4 / 16,
        accessor: ({ volume24Hours }) => {
          return (
            <Flex flexDirection={'column'} sx={{ gap: ['5px', '8px'] }}>
              <Text fontSize={textFontSize} textAlign={['center', 'center', 'left']}>
                {numberFormat(volume24Hours, volume24Hours < 100 ? 2 : 0, true)}
              </Text>

              <Box display={['block', 'none']} sx={{ textAlign: 'center', height: '20px' }} />
            </Flex>
          )
        },
      },
      {
        Header: () => (
          <Text textAlign={['center', 'center', 'left']} fontSize={textFontSize}>
            {' '}
            7D APR{' '}
          </Text>
        ),
        id: '7D APR',
        width: 3 / 16,
        accessor: ({ feeTier, volume7Days, liquidity, boostedApr, isBoosted }) => {
          let feeMultiplier = 0.0025 // 0.25% of v2 pairs go to LP holders
          if (feeTier) {
            feeMultiplier = feeTier / 1000000 // bips to % mutiplier eg: 10000/1000000 = 0.01 which is (1%)
          }

          const fees = (volume7Days ?? 0) * feeMultiplier
          const weeklyReturnRate = liquidity ? (fees / liquidity) * 100 : 0
          const sevenDaysAPR = weeklyReturnRate * 52

          const sevenDaysBoostedApr = boostedApr ?? 0

          return (
            <Box sx={{ position: 'relative' }}>
              <Flex flexDirection={'column'} sx={{ gap: ['5px', '8px'] }}>
                <Flex sx={{ minHeight: '20px', alignItems: 'center', justifyContent: ['center', 'left'] }}>
                  <Text fontSize={textFontSize} color={'lightGreen'} textAlign={['center', 'center', 'left']}>
                    +{formatSignificant({ value: sevenDaysAPR + sevenDaysBoostedApr })}%
                  </Text>
                </Flex>

                <Box display={['block', 'none']} sx={{ textAlign: 'center', height: '20px' }}>
                  {isBoosted && (
                    <InfoTooltip text={'Boosted Rewards'}>
                      <Box
                        sx={{
                          px: 2,
                          py: 1,
                          right: 0,
                          color: 'white',
                          display: 'flex',
                          bg: 'highlight',
                          borderRadius: '6px',
                          alignItems: 'center',
                          position: 'absolute',
                          fontSize: textFontSize,
                          width: '130px',
                          height: ['19.46px', '23.87px'],
                        }}
                      >
                        <Image
                          src={BoostedRewardsBolt}
                          sx={{
                            height: ['12px'],
                            filter: 'brightness(0) invert(1)',
                            mr: 1,
                          }}
                        />
                        Boosted Rewards
                      </Box>
                    </InfoTooltip>
                  )}
                </Box>
              </Flex>
            </Box>
          )
        },
      },
    ]

    return columns
  }, [filter])

  return columns
}

export default function Pool() {
  const [search, setSearch] = useState('')
  const [tableData, setTableData] = useState([])
  const [filteredData, setFilteredData] = useState([])
  const [filter, setFilter] = useState(POOL_PAGE_TABLE_FILTERS.ALL_POOLS.key)

  const history = useHistory()
  const location = useLocation()
  const columns = useAllPairsColumn(filter)
  const { pairs, loadingPairs } = useSelector((state: any) => state?.pool)
  const boostedPools = useSelector((state) => (state as any).pool.merklPairs)

  useEffect(() => {
    const tableData = filteredData
      .map((pair) => {
        let isLive = false
        let boostedApr = 0
        const isBoosted = Object.keys(boostedPools).includes(pair.id.toLowerCase())
        if (isBoosted) {
          isLive = boostedPools[pair.id.toLowerCase()].filter((p) => p.isLive).length > 0
        }
        if (isLive) {
          boostedApr = boostedPools[pair.id.toLowerCase()].filter((p) => p.isLive)[0].apr
        }
        return {
          ...pair,
          isBoosted: isBoosted && isLive,
          boostedApr,
        }
      })
      .filter(({ version }) => {
        if (filter != POOL_PAGE_TABLE_FILTERS.ALL_POOLS.key) {
          return version === filter
        } else {
          return true
        }
      })
      .sort((a, b) => {
        const sortPropertyA = a.liquidity || 0
        const sortPropertyB = b.liquidity || 0
        return sortPropertyB - sortPropertyA
      })

    setTableData(tableData)
  }, [boostedPools, filteredData, filter])

  let table = (
    <Table
      onSelectRow={({ original: { token0, token1, version, feeTier } }) => {
        let newHistory = '/add/' + token0?.id + '/' + token1?.id + '?version=' + version
        if (version === 'v3') {
          newHistory += '&feeAmount=' + feeTier
        }
        history.push(newHistory)
      }}
      columns={columns}
      data={tableData}
    />
  )

  if (filter === POOL_PAGE_TABLE_FILTERS.MY_POSITIONS.key) {
    table = <MyPositions />
  } else if (filter === POOL_PAGE_TABLE_FILTERS.BOOSTED_REWARDS.key) {
    table = <BoostedRewards />
  }

  useEffect(() => {
    if (location?.search) {
      const filter = new URLSearchParams(location?.search).get('filter')
      setFilter(filter.toLowerCase())
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    const data = pairs.length > 0 ? pairs : []

    let filteredData = data
    if (search.length !== 0) {
      filteredData = data.filter(({ name, token0, token1 }) => {
        return (
          name?.toLowerCase().includes(search?.toLowerCase()) ||
          token0?.name?.toLowerCase().includes(search?.toLowerCase()) ||
          token1?.name?.toLowerCase().includes(search?.toLowerCase()) ||
          token1?.id?.toLowerCase().includes(search?.toLowerCase()) ||
          token0?.id?.toLowerCase().includes(search?.toLowerCase())
        )
      })
    }
    setFilteredData(filteredData)
  }, [pairs, search])

  if (loadingPairs || pairs.length === 0) {
    table = (
      <Flex justifyContent={'center'}>
        <AnimatedLoader width={['45px', '90px']} />
      </Flex>
    )
  }

  return (
    <AppBody>
      <Page>
        <PoolUpdater />
        {filter === POOL_PAGE_TABLE_FILTERS.MY_POSITIONS.key ? <SwitchNetwork /> : null}

        <Page.Header>
          <Text>Pools</Text>
        </Page.Header>

        <Page.Subheader>
          <PoolPageSubheader />
        </Page.Subheader>

        <Page.Body>
          <Flex flexDirection={'column'} sx={{ gap: 4 }}>
            <Card px={'24px'}>
              <Flex
                sx={{
                  justifyContent: ['flex-start', 'space-between'],
                  flexDirection: ['column', 'row'],
                  alignItems: 'center',
                  width: '100%',
                  mb: [2, 0],
                }}
              >
                <Box sx={{ width: ['100%', 'auto'], mb: [4, 0] }}>
                  <Flex width={'100%'} sx={{ gap: 3 }}>
                    {Object.keys(POOL_PAGE_TABLE_FILTERS).map((key) => {
                      const value = POOL_PAGE_TABLE_FILTERS[key]

                      return (
                        <Flex key={value.key} flexDirection={'column'}>
                          <Box
                            onClick={() => {
                              const historyParams = {
                                pathname: '/pool',
                                search: `?${new URLSearchParams({ filter: value.key }).toString().toLocaleLowerCase()}`,
                              }

                              history.replace(historyParams)
                              setFilter(value.key)
                            }}
                            sx={{
                              cursor: 'pointer',
                              width: '100%',
                              borderBottom: filter === value.key ? '2px solid #333333' : '',
                            }}
                          >
                            <Text
                              fontSize={[2, 3]}
                              opacity={filter === value.key ? 1 : 0.7}
                              fontWeight={filter === value.key ? 700 : 500}
                            >
                              {value.name}
                            </Text>
                          </Box>
                        </Flex>
                      )
                    })}
                  </Flex>
                </Box>

                <PoolPageSearch setSearch={setSearch} />
              </Flex>

              <Box pt={[4, 5]} />

              {table}
            </Card>
          </Flex>
        </Page.Body>
      </Page>
    </AppBody>
  )
}
