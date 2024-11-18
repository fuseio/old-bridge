import { useSelector } from 'react-redux'
import { useParams } from 'react-router-dom'
import { Box, Flex, Image, Text } from 'rebass/styled-components'
import { BackButton } from '../../../wrappers/BackButton'
import { Hidden } from '../../../wrappers/Hidden'
import AppBody from '../../AppBody'
import Explanation from './Explanation'
import Fund from './Fund'
import { Metadata } from './Metadata'
import Position from './Position'
import Price from './Price'
import Rewards from './Rewards'
import { Status } from './Status'
import Vesting from './Vesting'

const Launch = () => {
  const params = useParams()
  const launches = useSelector((state: any) => state.launch.launches)

  const { status, content, projectToken } = launches.find(
    (launch: any) => launch.contractAddress === (params as any).id
  )

  return (
    <AppBody>
      <Flex alignItems={'center'}>
        <Flex height={'100%'} flexDirection={'column'}>
          <BackButton pb={0} />

          <Flex
            flexDirection={['row']}
            mb={[1, 1, 3]}
            height={'100%'}
            sx={{ gap: [2, 3] }}
            py={2}
            alignItems={['left', 'end']}
          >
            <Text lineHeight={[0.9, 0.9, 0.74]} fontSize={[24, 54]} fontWeight={600}>
              Mirakle (QIJI token)
            </Text>
            <Flex width={'fit-content'} justifyContent={'flex-end'} alignItems={'end'}>
              <Status status={status} />
            </Flex>
          </Flex>
        </Flex>
      </Flex>

      <Hidden mobile tablet>
        <Flex width={'100%'} sx={{ gap: 2 }}>
          <Flex width={'100%'} sx={{ gap: 2 }} flexDirection={'column'}>
            <Image sx={{ borderRadius: 'default' }} src={content?.banner} />
            <Flex flexDirection={'row'} sx={{ gap: 2 }}>
              <Price />
              <Vesting />
            </Flex>

            <Box height={'100%'}>
              <Explanation content={content?.description} title={projectToken?.name} />
              <Box py={2}>
                <Metadata />
              </Box>
            </Box>
          </Flex>

          <Flex width={600} height={'auto'} sx={{ gap: 2 }} flexDirection={'column'}>
            <Fund />
            <Position />
            <Rewards />
          </Flex>
        </Flex>
      </Hidden>

      <Hidden desktop>
        <Flex sx={{ gap: 2 }} flexDirection={'column'}>
          <Fund />
          <Position />
          <Rewards />
          <Flex height={'100%'} flexDirection={'row'} sx={{ gap: 2 }}>
            <Price />
            <Vesting />
          </Flex>

          <Rewards />
          <Explanation content={content?.description} title={projectToken?.name} />
          <Metadata />
        </Flex>
      </Hidden>
    </AppBody>
  )
}

export default Launch
