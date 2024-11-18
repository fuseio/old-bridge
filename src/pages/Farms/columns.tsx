import React from 'react'
import { formatUnits } from 'ethers/lib/utils'
import { ChevronDown, X } from 'react-feather'
import { Box, Flex } from 'rebass/styled-components'

import { Hidden } from '../../wrappers/Hidden'
import MultiCurrencyLogo from '../../components/MultiCurrencyLogo'
import { useFarmPositionPrice } from '../../hooks/useFarmPositionPrice'
import { formatSignificant, numberFormat, tryFormatPercentageAmount } from '../../utils'

const hasDualRewards = (farm) => {
  return farm?.version === 'v3'
}

export const useAllFarmColumns = () => {
  return React.useMemo(
    () => [
      {
        Header: () => <Box textAlign={'left'}>Farm</Box>,
        id: 'farm',
        width: ['50%', 8 / 16],
        accessor: (farm) => {
          const isDualRewards = hasDualRewards(farm)
          const isStablePool = farm?.tokens?.filter(Boolean).length > 2

          return (
            <Flex style={{ gap: '12px' }} alignItems={'center'}>
              <Hidden mobile>
                <Flex
                  minWidth={(isStablePool && 44) || (!isDualRewards && 45)}
                  justifyContent={!isDualRewards && !isStablePool && 'right'}
                  alignItems={'center'}
                >
                  <MultiCurrencyLogo
                    size={(isStablePool && '20') || (!isDualRewards && '28') || (isDualRewards && '28')}
                    tokenAddresses={farm?.tokens?.map((token: any) => token?.id)}
                  />
                </Flex>
              </Hidden>
              {farm?.pairName.replaceAll('/', ' - ')}
            </Flex>
          )
        },
      },

      {
        Header: () => <Box textAlign={'left'}>TVL</Box>,
        id: 'tvl',
        width: ['40%', 3 / 16],
        accessor: (farm) => {
          if (farm?.isExpired) return <div></div>
          return numberFormat(farm.globalTotalStakeUSD, 0, true)
        },
      },
      {
        Header: () => <Box textAlign={'left'}>APR</Box>,
        id: 'apr',
        width: ['10%', 2 / 16],

        accessor: (farm) => {
          if (farm?.isExpired) return <div></div>
          return (
            <Flex ml="right" flexDirection={'row'} style={{ gap: '8px' }}>
              {tryFormatPercentageAmount(
                (isNaN(farm.baseAprPercent) ? 0 : farm.baseAprPercent) +
                  (isNaN(farm.bonusAprPercent) ? 0 : farm.bonusAprPercent),
                2
              )}
              %
            </Flex>
          )
        },
      },

      {
        // Build our expander column
        id: 'expander', // Make sure it has an ID
        width: [3 / 16],
        Cell: ({ row }: { row: any }) => {
          const isDualRewards = hasDualRewards(row?.original)
          return (
            <Flex justifyContent={'end'} width="100%">
              <Hidden mobile>
                {row?.original?.isExpired && (
                  <Box
                    fontSize={0}
                    fontWeight={600}
                    width={'fit-content'}
                    bg="transparent"
                    px={2}
                    ml="auto"
                    py={2}
                    variant={'outline'}
                  >
                    Expired
                  </Box>
                )}
                {isDualRewards && !row?.original?.isExpired && (
                  <Box
                    fontSize={0}
                    fontWeight={600}
                    width={'fit-content'}
                    bg="transparent"
                    px={2}
                    ml="auto"
                    py={2}
                    variant={'outline'}
                  >
                    Dual Rewards
                  </Box>
                )}
              </Hidden>
              <Box mt={1} ml={3} width={'fit-content'}>
                {row.isExpanded ? <X style={{ cursor: 'pointer' }} /> : <ChevronDown style={{ cursor: 'pointer' }} />}
              </Box>
            </Flex>
          )
        },
      },
    ],
    []
  )
}

export const useMyFarmColumns = () => {
  return React.useMemo(
    () => [
      {
        Header: () => <Box textAlign={'left'}>Farm</Box>,
        id: 'farm',
        width: ['50%', 6 / 16],
        accessor: (farm) => {
          const isDualRewards = hasDualRewards(farm)
          const isStablePool = farm?.rewards?.filter(Boolean).length > 2

          return (
            <Flex style={{ gap: '12px' }} alignItems={'center'}>
              <Hidden mobile>
                <Flex
                  minWidth={(isStablePool && 44) || (!isDualRewards && 45)}
                  justifyContent={!isDualRewards && !isStablePool && 'right'}
                  alignItems={'center'}
                >
                  {farm?.version === 'v2' ? (
                    <MultiCurrencyLogo
                      size={(isStablePool && '20') || (!isDualRewards && '28') || (isDualRewards && '28')}
                      tokenAddresses={farm?.tokens?.map((token: any) => token?.id)}
                    />
                  ) : (
                    <MultiCurrencyLogo size={'28'} tokenAddresses={[farm?.token0?.id, farm?.token1?.id]} />
                  )}
                </Flex>
              </Hidden>

              {farm?.version === 'v2'
                ? farm?.pairName?.replaceAll('/', ' - ')
                : `${farm?.token0?.symbol} - ${farm?.token1?.symbol}`}
              {farm?.version === 'v3' && (
                <Box sx={{ borderRadius: '5px' }} fontSize={1} px={2} py={1} bg="gray70">
                  V3
                </Box>
              )}
            </Flex>
          )
        },
      },
      {
        Header: () => <Box textAlign={'left'}>Position</Box>,
        id: 'position',
        width: ['40%', 4 / 16],
        accessor: (farm) => {
          if (farm?.isExpired) return <div></div>

          const PositionPrice = () => {
            const positionPrice = useFarmPositionPrice(farm)

            return (
              <div>
                {positionPrice < 0.01
                  ? '<0.01'
                  : formatSignificant({
                      prefix: '$',
                      value: positionPrice,
                    })}
              </div>
            )
          }

          if (farm?.version === 'v3') {
            const positionSize = farm?.positions?.reduce((acc, curr) => {
              const token0USD =
                Number(formatUnits(curr?.token0Amount?.toString() ?? '0', farm?.token0?.decimals)) * farm?.token0Price
              const token1USD =
                Number(formatUnits(curr?.token1Amount?.toString() ?? '0', farm?.token1?.decimals)) * farm?.token1Price
              return token0USD + token1USD + acc
            }, 0)

            return `$${positionSize?.toFixed(4)}`
          }

          return <PositionPrice />
        },
      },
      {
        Header: () => <Box textAlign={'left'}>TVL</Box>,
        id: 'tvl',
        width: ['40%', 3 / 16],
        accessor: (farm) => {
          if (farm?.isExpired) return <div></div>
          return farm?.version === 'v2'
            ? numberFormat(farm.globalTotalStakeUSD, 0, true)
            : `$${Number(farm?.tvl).toFixed(4)}`
        },
      },
      {
        Header: () => <Box textAlign={'left'}>APR</Box>,
        id: 'apr',
        width: ['10%', 2 / 16],

        accessor: (farm) => {
          if (farm?.isExpired) return <div></div>
          return farm?.version === 'v2' ? (
            <Flex ml="right" flexDirection={'row'} style={{ gap: '8px' }}>
              {tryFormatPercentageAmount(
                (isNaN(farm.baseAprPercent) ? 0 : farm.baseAprPercent) +
                  (isNaN(farm.bonusAprPercent) ? 0 : farm.bonusAprPercent),
                2
              )}
              %
            </Flex>
          ) : (
            <Flex>{farm?.apr?.toFixed(2)}%</Flex>
          )
        },
      },
      {
        // Build our expander column
        id: 'expander', // Make sure it has an ID
        width: [3 / 16],
        Cell: ({ row }: { row: any }) => {
          const isDualRewards = hasDualRewards(row?.original)
          return (
            <Flex justifyContent={'end'} width="100%">
              <Hidden mobile>
                {row?.original?.isExpired && (
                  <Box
                    fontSize={0}
                    fontWeight={600}
                    width={'fit-content'}
                    bg="transparent"
                    px={2}
                    ml="auto"
                    py={2}
                    variant={'outline'}
                  >
                    Expired
                  </Box>
                )}
                {isDualRewards && !row?.original?.isExpired && (
                  <Box
                    fontSize={0}
                    fontWeight={600}
                    width={'fit-content'}
                    bg="transparent"
                    px={2}
                    ml="auto"
                    py={2}
                    variant={'outline'}
                  >
                    Dual Rewards
                  </Box>
                )}
              </Hidden>
              <Box mt={1} ml={3} width={'fit-content'}>
                {row.isExpanded ? <X style={{ cursor: 'pointer' }} /> : <ChevronDown style={{ cursor: 'pointer' }} />}
              </Box>
            </Flex>
          )
        },
      },
    ],
    []
  )
}

export const useV3FarmColumns = () => {
  return React.useMemo(
    () => [
      {
        Header: () => <Box textAlign={'left'}>Farm</Box>,
        id: 'farm',
        width: ['50%', 8 / 16],
        accessor: ({ token0, token1, ...data }) => {
          return (
            <Flex style={{ gap: '12px' }} alignItems={'center'}>
              <Hidden mobile>
                <Flex justifyContent={'right'} alignItems={'center'}>
                  <MultiCurrencyLogo size={'20'} tokenAddresses={[token0?.id, token1?.id]} />
                </Flex>
              </Hidden>
              {token0?.symbol} - {token1?.symbol}
              <Box sx={{ borderRadius: '5px' }} fontSize={1} px={2} py={1} bg="gray70">
                0.3%
              </Box>
            </Flex>
          )
        },
      },
      {
        Header: () => <Box textAlign={'left'}>TVL</Box>,
        id: 'tvl',
        width: ['40%', 3 / 16],
        accessor: (farm) => {
          return numberFormat(farm?.tvl, 0, true)
        },
      },
      {
        Header: () => <Box textAlign={'left'}>APR</Box>,
        id: 'apr',
        width: ['10%', 2 / 16],

        accessor: (farm) => {
          if (farm?.isExpired) return <div></div>
          return (
            <Flex ml="right" flexDirection={'row'} style={{ gap: '8px' }}>
              {typeof farm?.apr === 'number' && farm?.apr === Infinity ? farm?.apr : farm?.apr?.toFixed(2)}%
            </Flex>
          )
        },
      },

      {
        // Build our expander column
        id: 'expander', // Make sure it has an ID
        width: [3 / 16],
        Cell: ({ row }: { row: any }) => {
          const isDualRewards = hasDualRewards(row?.original)
          return (
            <Flex justifyContent={'end'} width="100%">
              <Hidden mobile>
                {row?.original?.isExpired && (
                  <Box
                    fontSize={0}
                    fontWeight={600}
                    width={'fit-content'}
                    bg="transparent"
                    px={2}
                    ml="auto"
                    py={2}
                    variant={'outline'}
                  >
                    Expired
                  </Box>
                )}
                {isDualRewards && !row?.original?.isExpired && (
                  <Box
                    fontSize={0}
                    fontWeight={600}
                    width={'fit-content'}
                    bg="transparent"
                    px={2}
                    ml="auto"
                    py={2}
                    variant={'outline'}
                  >
                    Dual Rewards
                  </Box>
                )}
              </Hidden>
              <Box mt={1} ml={3} width={'fit-content'}>
                {row.isExpanded ? <X style={{ cursor: 'pointer' }} /> : <ChevronDown style={{ cursor: 'pointer' }} />}
              </Box>
            </Flex>
          )
        },
      },
    ],
    []
  )
}
