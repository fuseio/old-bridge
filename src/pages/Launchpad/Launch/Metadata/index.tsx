import { get, isNil } from 'lodash'
import { Card, Flex, Text } from 'rebass/styled-components'
import { formatSignificant } from '../../../../utils'
import { ComponentLoader } from '../../../../wrappers/ComponentLoader'
import moment from 'moment'
import { useParams } from 'react-router-dom'
import { useSelector } from 'react-redux'

const MetaData = ({ name, value, loading }: { name: string; value: string; loading: boolean }) => {
  return (
    <Flex justifyContent={'space-between'} flexDirection={'row'}>
      <Text variant={'label'}>{name}</Text>{' '}
      <ComponentLoader loading={loading}>
        <Text variant={'description'}>{loading ? name : value}</Text>
      </ComponentLoader>
    </Flex>
  )
}
export const Metadata = () => {
  const params = useParams()
  const launches = useSelector((state: any) => state.launch.launches)
  const { startTime, endTime, snapshotTime, projectToken, projectTokenReserve } = launches.find(
    (launch: any) => launch.contractAddress === (params as any).id
  )

  const loading =
    isNil(startTime) || isNil(endTime) || isNil(snapshotTime) || isNil(projectToken) || isNil(projectTokenReserve)
  return (
    <Card>
      <Text variant={'h4'}>Details</Text>
      <Flex sx={{ gap: 3 }} flexDirection={'column'}>
        <MetaData name="Token Name" loading={loading} value={projectToken?.symbol} />
        <MetaData
          name="Tokens for Presale"
          loading={loading}
          value={`${formatSignificant({ value: projectTokenReserve })} ${projectToken?.symbol}`}
        />
        <MetaData
          name="Deposit Starts"
          loading={loading}
          value={
            startTime &&
            moment(startTime * 1000)
              .utc()
              .format('ddd, DD MMM YYYY HH:mm:ss [UTC]')
          }
        />
        <MetaData
          name="Deposit Ends"
          loading={loading}
          value={
            endTime &&
            moment(endTime * 1000)
              .utc()
              .format('ddd, DD MMM YYYY HH:mm:ss [UTC]')
          }
        />
        <MetaData
          name="Snapshot at Block"
          loading={loading}
          value={
            snapshotTime &&
            moment(snapshotTime * 1000)
              .utc()
              .format('ddd, DD MMM YYYY HH:mm:ss [UTC]')
          }
        />
      </Flex>
    </Card>
  )
}
