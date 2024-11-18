import { get } from 'lodash'
import { useSelector } from 'react-redux'
import { useParams } from 'react-router-dom'
import { Box, Card, Flex, Text } from 'rebass/styled-components'
import { ComponentLoader } from '../../../../wrappers/ComponentLoader'
import { useWeb3 } from '../../../../hooks'
import { LaunchStatus } from '../../../../state/launch/updater'
import { formatSignificant } from '../../../../utils'

const Position = () => {
  const params = useParams()
  const launches = useSelector((state: any) => state.launch.launches)
  const { account } = useWeb3()
  const { saleToken, status, user } = launches.find((launch: any) => launch.contractAddress === (params as any).id)
  const balance = get(user, 'balance', 0.0)
  const allocation = get(user, 'allocation', 0.0)
  const loading = !user || !saleToken
  return (
    account &&
    status !== LaunchStatus.Finalized && (
      <Card height={'fit-content'}>
        <Text color="black" fontWeight={700} fontSize={1}>
          Position
        </Text>
        <Box py={1}></Box>
        <Flex justifyContent={'space-between'} flexDirection={'column'} style={{ gap: '8px' }} py={2}>
          <Flex alignItems={'center'} width={'100%'} justifyContent={'space-between'}>
            <Text color={'blk70'} fontSize={2} fontWeight={500}>
              Your Contribution
            </Text>

            <ComponentLoader loading={loading}>
              <Text fontSize={2} fontWeight={600}>
                {formatSignificant({
                  value: balance,
                })}{' '}
                {saleToken?.symbol}
              </Text>
            </ComponentLoader>
          </Flex>
          <Flex alignItems={'center'} justifyContent={'space-between'}>
            <Text color={'blk70'} fontSize={2} fontWeight={500}>
              Your Allocation
            </Text>
            <ComponentLoader loading={loading}>
              <Text fontSize={2} fontWeight={600}>
                {`${formatSignificant({
                  value: allocation - balance,
                })} ${saleToken?.symbol}`}
              </Text>
            </ComponentLoader>
          </Flex>
        </Flex>
      </Card>
    )
  )
}
export default Position
