import { useSelector } from 'react-redux'
import { useParams } from 'react-router-dom'
import { Card, Flex, Text } from 'rebass/styled-components'

const Vesting = () => {
  const params = useParams()
  const launches = useSelector((state: any) => state.launch.launches)

  const { vestingDays } = launches.find((launch: any) => launch.contractAddress === (params as any).id)

  return (
    <Card width={'100%'} height={'100%'}>
      <Flex pb={2} px={[0, 0, 2]} pt={[0, 0, 2]} sx={{ gap: 2 }} flexDirection={'column'}>
        <Text color={'blk50'} fontSize={2}>
          Vesting
        </Text>
        <Text pt={1} fontWeight={600} fontSize={[5, 6]}>
          {vestingDays} Days
        </Text>
      </Flex>
    </Card>
  )
}

export default Vesting
