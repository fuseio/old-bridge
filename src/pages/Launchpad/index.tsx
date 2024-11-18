import moment from 'moment'
import { isNil } from 'lodash'
import { Link } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { Box, Flex, Image, Text } from 'rebass/styled-components'

import AppBody from '../AppBody'
import { Status } from './Launch/Status'
import Card from '../../collections/Card'
import Page from '../../collections/Page'
import { numberFormat } from '../../utils'
import LaunchUpdater from '../../state/launch/updater'
import { AnimatedLoader } from '../../components/Loader'
import { LaunchStatus } from '../../state/launch/updater'
import { StatisticsGrid } from '../../components/StatisticsGrid'

import RocketSVG from '../../assets/svg/rocket.svg'

const FeaturedLaunch = ({ launch }: { launch: any }) => {
  const {
    projectToken,
    content,
    contractAddress,
    hasEnded,
    status,
    minSaleTokenReserve,
    maxSaleTokenReserve,
    endTime,
    saleTokenReserve,
    startTime,
    vestingDays,
  } = launch

  return (
    <Link to={'launch/' + contractAddress} style={{ textDecoration: 'none' }}>
      <Card px={0} py={0}>
        <Flex
          pl={[0, 0, 3]}
          justifyContent={'space-between'}
          flexDirection={['column', 'column', 'row']}
          width={'100%'}
        >
          <Flex px={[3, 3, 0]} order={[2, 2, 0]} width={[1, 1, 8 / 16]} flexDirection={'column'}>
            <Card.Header pt={3}>
              <Flex sx={{ gap: [2, 3] }} alignItems={'center'} flexDirection={'row'}>
                <Text maxWidth={['70%', '100%']} fontSize={28}>
                  Mirakle (QIJI token)
                </Text>
                <Flex alignItems={'end'}>
                  <Status status={status} />
                </Flex>
              </Flex>
            </Card.Header>

            <Flex pt={3} flexDirection={'column'}>
              {content?.description && (
                <Text maxWidth={['100%', '90%']} lineHeight={1.4} fontSize={1} pt={1}>
                  {content?.description}
                </Text>
              )}
              <Box pt={3} pb={4}>
                <StatisticsGrid
                  items={[
                    [
                      {
                        name: 'Soft Cap',
                        value: numberFormat(minSaleTokenReserve, 0, true),
                        loading: isNil(minSaleTokenReserve),
                      },
                      {
                        name: 'Max Cap',
                        value: numberFormat(maxSaleTokenReserve, 0, true),
                        loading: isNil(maxSaleTokenReserve),
                      },
                    ],
                    [
                      {
                        name: 'Vesting Days',
                        value: vestingDays,
                        loading: isNil(minSaleTokenReserve),
                      },
                    ],
                    [
                      {
                        name: 'Sale Begins',
                        value:
                          startTime &&
                          moment(startTime * 1000)
                            .utc()
                            .format('ddd, DD MMM'),
                        loading: isNil(startTime),
                      },
                      {
                        name: 'Sale Ends',
                        value:
                          endTime &&
                          moment(endTime * 1000)
                            .utc()
                            .format('ddd, DD MMM'),
                        loading: isNil(endTime),
                      },
                    ],
                  ]}
                />
              </Box>
            </Flex>
          </Flex>
          <Image src={content?.banner} />
        </Flex>
      </Card>
    </Link>
  )
}

const Launch = ({ launch }: { launch: any }) => {
  const {
    projectToken,
    content,
    contractAddress,
    hasEnded,
    vestingDays,
    status,
    minSaleTokenReserve,
    endTime,
    maxSaleTokenReserve,
    startTime,
  } = launch

  return (
    <Link to={'launch/' + contractAddress} style={{ textDecoration: 'none' }}>
      <Card py={0} px={0}>
        <Card.Image src={content?.banner} />
        <Card.Header px={3} pt={3}>
          <Flex sx={{ gap: 2 }} flexDirection={'column'}>
            <Flex sx={{ gap: 3 }} alignItems={'center'} flexDirection={'row'}>
              <Text fontSize={28}>{projectToken?.name}</Text>
              <Status status={status} />
            </Flex>
          </Flex>
        </Card.Header>
        <Card.Body>
          <Flex px={3} flexDirection={'column'}>
            {content?.description && (
              <Text lineHeight={1.4} fontSize={1} pt={1}>
                {content?.description}
              </Text>
            )}
            <Box pt={3} pb={4}>
              <StatisticsGrid
                items={[
                  [
                    {
                      name: 'Soft Cap',
                      value: numberFormat(minSaleTokenReserve, 0, true),
                      loading: isNil(minSaleTokenReserve),
                    },
                    {
                      name: 'Max Cap',
                      value: numberFormat(maxSaleTokenReserve, 0, true),
                      loading: isNil(maxSaleTokenReserve),
                    },
                  ],
                  [
                    {
                      name: 'Vesting Days',
                      value: vestingDays,
                      loading: isNil(minSaleTokenReserve),
                    },
                  ],
                  [
                    {
                      name: 'Sale Begins',
                      value:
                        startTime &&
                        moment(startTime * 1000)
                          .utc()
                          .format('ddd, DD MMM'),
                      loading: isNil(startTime),
                    },
                    {
                      name: 'Sale Ends',
                      value:
                        endTime &&
                        moment(endTime * 1000)
                          .utc()
                          .format('ddd, DD MMM'),
                      loading: isNil(endTime),
                    },
                  ],
                ]}
              />
            </Box>
          </Flex>
        </Card.Body>
      </Card>
    </Link>
  )
}

const Launchpad = () => {
  const launches = useSelector((state: any) => state.launch.launches)
  const loading = launches.filter(({ saleToken }) => saleToken).length !== launches.length
  const FEATURED_PROJECT = '0x4a0ee18c54798b7c3d7e3d6919959f159359bbbe'

  let body = (
    <Flex sx={{ gap: 4 }} flexDirection={'column'}>
      {launches.filter((launch) => launch.contractAddress === FEATURED_PROJECT).length !== 0 && (
        <Flex flexDirection={'column'} sx={{ gap: 3 }}>
          <Text fontSize={4} fontWeight={700}>
            Featured Project
          </Text>

          <Box>
            {launches
              .filter((launch) => launch.contractAddress === FEATURED_PROJECT)
              .map((launch, index) => (
                <Box width={[1]} key={index}>
                  <FeaturedLaunch launch={launch} />
                </Box>
              ))}
          </Box>
        </Flex>
      )}

      {launches.filter((launch) => launch.status === 'Live' && launch.contractAddress !== FEATURED_PROJECT).length !==
        0 && (
        <>
          <Flex flexDirection={'column'} sx={{ gap: 3 }}>
            <Text fontSize={4} fontWeight={700}>
              {LaunchStatus.Live}
            </Text>

            <Box sx={{ display: 'grid', rowGap: 3, columnGap: 3, gridTemplateColumns: ['1fr', '1fr 1fr'] }}>
              {launches
                .filter((launch) => launch.status === 'Live' && launch.contractAddress !== FEATURED_PROJECT)
                .map((launch, index) => (
                  <Box width={[1]} key={index}>
                    <Launch launch={launch} />
                  </Box>
                ))}
            </Box>
          </Flex>
        </>
      )}

      {launches.filter((launch) => launch.status === 'Upcoming' && launch.contractAddress !== FEATURED_PROJECT)
        .length !== 0 && (
        <>
          <Flex flexDirection={'column'} sx={{ gap: 3 }}>
            <Text fontSize={4} fontWeight={700}>
              {LaunchStatus.Upcoming}
            </Text>
            <Box sx={{ display: 'grid', rowGap: 3, columnGap: 3, gridTemplateColumns: ['1fr', '1fr 1fr'] }}>
              {launches
                .filter((launch) => launch.status === 'Upcoming')
                .map((launch, index) => (
                  <Box width={[1]} key={index}>
                    <Launch launch={launch} />
                  </Box>
                ))}
            </Box>
          </Flex>
        </>
      )}

      {launches.filter((launch) => launch.status === 'Finalized' && launch.contractAddress !== FEATURED_PROJECT)
        .length !== 0 && (
        <>
          <Flex flexDirection={'column'} sx={{ gap: 3 }}>
            <Text fontSize={4} fontWeight={700}>
              {LaunchStatus.Finalized}
            </Text>
            <Box sx={{ display: 'grid', rowGap: 3, columnGap: 3, gridTemplateColumns: ['1fr', '1fr 1fr'] }}>
              {launches
                .filter((launch) => launch.status === 'Finalized')
                .map((launch, index) => (
                  <Box width={[1]} key={index}>
                    <Launch launch={launch} />
                  </Box>
                ))}
            </Box>
          </Flex>
        </>
      )}
    </Flex>
  )

  if (loading) {
    body = (
      <Flex justifyContent={'center'}>
        <AnimatedLoader />
      </Flex>
    )
  }

  return (
    <AppBody>
      <LaunchUpdater />

      <Page>
        <Box opacity={0.8} sx={{ width: 360, top: 0, position: 'absolute', right: 0 }}>
          <Image src={RocketSVG} />
        </Box>
        <Flex minHeight={150} flexDirection={'column'}>
          <Page.Header>
            <Text> Launchpad</Text>
          </Page.Header>

          <Page.Subheader>Get exclusive early access to a series of new projects launching on Fuse</Page.Subheader>
        </Flex>

        <Page.Body>{body}</Page.Body>
      </Page>
    </AppBody>
  )
}

export default Launchpad
