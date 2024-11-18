import { get } from 'lodash'
import moment from 'moment'
import { useSelector } from 'react-redux'
import { useParams } from 'react-router-dom'
import { Box, Card, Flex, Text } from 'rebass/styled-components'
import { useWeb3 } from '../../../../hooks'
import { LaunchStatus } from '../../../../state/launch/updater'
import { formatSignificant } from '../../../../utils'
import { ComponentLoader } from '../../../../wrappers/ComponentLoader'
import { Countdown } from '../../../../wrappers/Countdown'
import { SECONDS_IN_DAY } from '../../../../constants'
import { addTokenToWallet } from '../../../../utils'

const Rewards = () => {
  const params = useParams()
  const launches = useSelector((state: any) => state.launch.launches)
  const { account, library } = useWeb3()
  const { saleToken, vestingDays, endTime, projectToken, user, status } = launches.find(
    (launch: any) => launch.contractAddress === (params as any).id
  )

  const claimable = get(user, 'claimable', 0.0)
  const hasClaimed = get(user, 'hasClaimed', false)
  const balance = get(user, 'balance', 0)
  const timestampMoment = moment.unix(endTime)
  const futureTimestampMoment = timestampMoment.add(SECONDS_IN_DAY * vestingDays, 'seconds')
  const futureTimestamp = futureTimestampMoment.unix()

  const loading = !user || !saleToken

  return (
    account &&
    LaunchStatus.Finalized === status && (
      <Card height={'fit-content'}>
        <Flex justifyContent={'space-between'}>
          <Text color="black" fontWeight={700} fontSize={1}>
            QIJI Tokens
          </Text>
          <Text
            color="black"
            fontWeight={700}
            fontSize={1}
            sx={{ cursor: 'pointer' }}
            onClick={() => {
              addTokenToWallet(projectToken, library)
            }}
          >
            Add Token
          </Text>
        </Flex>
        <Box py={1}></Box>
        <Flex justifyContent={'space-between'} flexDirection={'column'} style={{ gap: '8px' }} py={2}>
          {futureTimestamp > moment().unix() && (
            <Flex mb={2} alignItems={'center'} justifyContent={'space-between'}>
              <Text color="blk70" fontWeight={500} fontSize={2}>
                Locked for
              </Text>
              <ComponentLoader loading={loading}>
                <Countdown timestamp={futureTimestamp} />
              </ComponentLoader>
            </Flex>
          )}

          <Flex alignItems={'center'} justifyContent={'space-between'}>
            <Text color="blk70" fontSize={2} fontWeight={500}>
              Contributed
            </Text>
            <ComponentLoader loading={loading}>
              <Text fontWeight={600} fontSize={2}>{`${formatSignificant({ value: balance })} ${
                saleToken?.symbol
              }`}</Text>
            </ComponentLoader>
          </Flex>
          <Flex alignItems={'center'} justifyContent={'space-between'}>
            <Text color="blk70" fontSize={2} fontWeight={500}>
              {!hasClaimed ? 'Purchased' : 'Claimed'}
            </Text>
            <ComponentLoader loading={loading}>
              <Text variant={'description'}>{`${formatSignificant({ value: claimable })} ${
                projectToken?.symbol
              }`}</Text>
            </ComponentLoader>
          </Flex>
        </Flex>
      </Card>
    )
  )
}
export default Rewards
