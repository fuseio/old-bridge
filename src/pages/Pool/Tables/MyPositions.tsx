import { useSelector } from 'react-redux'
import { useEffect, useState } from 'react'
import { ChevronDown, X } from 'react-feather'
import { Box, Flex, Text, Image } from 'rebass/styled-components'

import PoolPositions from '../PoolPositions'
import Tokens from '../PoolPositions/Tokens'
import Table from '../../../components/Table'
import Statistics from '../PoolPositions/Statistics'
import { PAIR_VERSION } from '../../../state/pool/updater'
import { appendV2, formatFeeAmount } from '../../../utils'
import { InfoTooltip } from '../../../components/InfoTooltip'
import MultiCurrencyLogo from '../../../components/MultiCurrencyLogo'

import BoostedRewardsBolt from '../../../assets/svg/pool/boosted-rewards-bolt.svg'

const textFontSize = ['10px', '12px', '14px']

const getMyPositionsColumn = () => {
  const column = [
    {
      Header: () => (
        <Text textAlign={'left'} fontSize={textFontSize}>
          Name
        </Text>
      ),
      id: 'name',
      width: [10 / 16, 13 / 16],
      accessor: ({ token0, token1, version, feeTier, isBoosted }) => {
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

        const nameDesktop = (
          <Text fontSize={textFontSize}>
            {token0Name}
            <Text as="span" color={'gray100'}>
              {' '}
              /{' '}
            </Text>
            {token1Name}
          </Text>
        )

        const nameMobile =
          token0Name.length > 6 || token1Name.length > 6 ? (
            <>
              <Text fontSize={textFontSize}>
                {token0Name}
                <Text fontSize={textFontSize} as="span" color={'gray100'}>
                  {' '}
                  /{' '}
                </Text>
              </Text>

              <Text fontSize={textFontSize}>{token1Name} </Text>
            </>
          ) : (
            <Text fontSize={textFontSize}>
              {token0Name}
              <Text as="span" color={'gray100'}>
                {' '}
                /{' '}
              </Text>
              {token1Name}
            </Text>
          )

        const name = (
          <>
            <Box display={['none', 'block']} sx={{ textAlign: 'center' }}>
              {nameDesktop}
            </Box>
            <Box display={['block', 'none']} sx={{ textAlign: 'center' }}>
              {nameMobile}
            </Box>
          </>
        )

        const versionTag = (
          <Box
            px={2}
            py={1}
            fontSize={textFontSize}
            sx={{ borderRadius: '5px' }}
            bg={version === PAIR_VERSION.V3 ? 'green100' : 'gray70'}
            color={version === PAIR_VERSION.V3 ? 'green900' : 'primary'}
          >
            {version === PAIR_VERSION.V3 ? 'V3' : 'V2'}
          </Box>
        )

        const feePercentage = version === PAIR_VERSION.V3 && (
          <Box sx={{ borderRadius: '5px' }} fontSize={textFontSize} px={2} py={1} bg="gray70" color={'primary'}>
            {formatFeeAmount(feeTier)}%
          </Box>
        )

        return (
          <Flex sx={{ gap: ['5px', '8px'] }} alignItems={'center'}>
            {multiLogos}
            {name}
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
        )
      },
    },
    {
      // Build our expander column
      id: 'expander', // Make sure it has an ID
      width: [6 / 16, 3 / 16],
      Cell: ({ row }: { row: any }) => {
        const isActive = !row?.original?.outOfRange

        return (
          <Flex mt={1} justifyContent={'end'}>
            {row?.original?.version === PAIR_VERSION.V3 && (
              <Box>
                <Box
                  py={1}
                  mx={2}
                  fontWeight={600}
                  color={'secondary'}
                  textAlign={'center'}
                  fontSize={textFontSize}
                  width={isActive ? 70 : 80}
                  sx={{ borderRadius: 'rounded' }}
                  bg={isActive ? 'highlight' : 'grayLt'}
                >
                  {isActive ? 'Active' : 'Inactive'}
                </Box>
              </Box>
            )}
            <Box width={'fit-content'}>
              {row.isExpanded ? <X style={{ cursor: 'pointer' }} /> : <ChevronDown style={{ cursor: 'pointer' }} />}
            </Box>
          </Flex>
        )
      },
    },
  ]

  return column
}

export default function MyPositions() {
  const pairs = useSelector((state) => (state as any).pool.userPairs)
  const [data, setData] = useState([])
  const myPairColumn = getMyPositionsColumn()
  const boostedPools = useSelector((state) => (state as any).pool.merklPairs)

  useEffect(() => {
    const data = pairs.map((pair) => {
      if (pair.version === PAIR_VERSION.V2) {
        return {
          ...pair,
          isBoosted: false,
        }
      }
      let isLive = false
      const isBoosted = Object.keys(boostedPools).includes(pair.pool.toLowerCase())
      if (isBoosted) {
        isLive = boostedPools[pair.pool.toLowerCase()].filter((p) => p.isLive).length > 0
      }
      return {
        ...pair,
        isBoosted: isBoosted && isLive,
      }
    })
    setData(data)
  }, [boostedPools, pairs])

  const renderRowSubComponent = ({ row }) => (
    <Flex p={3} flexDirection={['column', 'row']} sx={{ gap: 3 }} height={['fit-content']} width={['100%']}>
      <Box width={['100%', '30%']}>
        <Statistics pool={row?.original} />
      </Box>
      <Box width={['100%', '35%']}>
        <PoolPositions poolPosition={row?.original} />
      </Box>
      <Box width={['100%', '35%']}>
        <Tokens pool={row?.original} />
      </Box>
    </Flex>
  )

  if (!data || data?.length === 0) {
    return (
      <Box minHeight={200} fontSize={textFontSize} textAlign={'center'} pt={70}>
        {"You don't have any positions."}
      </Box>
    )
  }

  return <Table renderRowSubComponent={renderRowSubComponent} columns={myPairColumn} data={data} />
}
