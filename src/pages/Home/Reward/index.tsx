import { Box, Text, Image, Flex, Card } from 'rebass/styled-components'

import { GetAppButton } from '../../../components/Button/getApp'

import PointReward from '../../../assets/svg/reward/point-reward.png'
import Swap from '../../../assets/svg/reward/swap.svg'
import Accumulate from '../../../assets/svg/reward/accumulate.svg'
import Earn from '../../../assets/svg/reward/earn.svg'

export default function Reward() {
  return (
    <Box as="section">
      <Box px={3} py={[5, '100px']}>
        <Box maxWidth={'1200px'} mx="auto">
          <Text fontSize={['28px', '46px']} fontWeight={700} maxWidth={'740px'} textAlign={'center'} mx="auto" as="h2">
            Earn Points for Every Action & Unlock Rewards
          </Text>

          <Card
            as="article"
            sx={{
              display: 'flex',
              flexDirection: ['column', 'row'],
              justifyContent: 'space-between',
              gap: 3,
              backgroundColor: 'white',
              borderRadius: '30px',
              marginTop: [3, 5],
              padding: 0,
            }}
          >
            <Image
              src={PointReward}
              alt=""
              sx={{
                position: 'relative',
                left: '36px',
                order: [1, 0],
              }}
            />
            <Flex
              sx={{
                flexDirection: 'column',
                justifyContent: 'space-between',
                gap: 3,
                padding: [4, '64px 64px 64px 0'],
              }}
            >
              <Flex
                sx={{
                  gap: 3,
                }}
              >
                <Image
                  src={Swap}
                  alt=""
                  width={48}
                  height={48}
                  sx={{
                    flexShrink: 0,
                  }}
                />
                <Text fontSize={20} fontWeight={'bold'} maxWidth={'560px'} as="p">
                  {"Use the VOLT App's features like swapping, sending, voting, or referring friends."}
                </Text>
              </Flex>
              <Flex
                sx={{
                  gap: 3,
                }}
              >
                <Image
                  src={Accumulate}
                  alt=""
                  width={48}
                  height={48}
                  sx={{
                    flexShrink: 0,
                  }}
                />
                <Text fontSize={20} fontWeight={'bold'} maxWidth={'560px'} as="p">
                  {"Accumulate Points daily with each interaction."}
                </Text>
              </Flex>
              <Flex
                sx={{
                  gap: 3,
                }}
              >
                <Image
                  src={Earn}
                  alt=""
                  width={48}
                  height={48}
                  sx={{
                    flexShrink: 0,
                  }}
                />
                <Text fontSize={20} fontWeight={'bold'} maxWidth={'560px'} as="p">
                  {"Redeem points for rewards and use them to earn even more"}
                </Text>
              </Flex>
            </Flex>
          </Card>

          <Box
            sx={{
              maxWidth: 'fit-content',
              mx: 'auto',
              mt: [3, 5]
            }}
          >
            <GetAppButton
              name="Get the App"
              variant={"greenPrimary"}
              sx={{
                fontSize: 3,
                py: '12px',
                px: '40px',
                '&:hover': {
                  outline: '2px solid #181816',
                  color: 'blk90',
                },
              }}
            />
          </Box>
        </Box>
      </Box>
    </Box>
  )
}
