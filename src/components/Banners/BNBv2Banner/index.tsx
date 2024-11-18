import { Button, Flex, Image, Text } from 'rebass/styled-components'

import Card from '../../../collections/Card'

import BNBv2BannerSVGDesktop from '../../../assets/svg/pool/bnb-v2-desktop.svg'
import BNBv2BannerSVGMobile from '../../../assets/svg/pool/bnb-v2-mobile.svg'

export default function BNBv2Banner() {
  return (
    <Card
      p={['20px', 4]}
      bg="secondary"
      mt={[50, 80, 50]}
      overflow={'visible'}
      customHeight={true}
      height={['260px', '257px', '257px']}
    >
      <Flex height={'100%'}>
        <Flex flexDirection={'column'} sx={{ gap: [3, 2] }} width={['100%', '60%']} justifyContent={['space-between']}>
          <Text mb={1} color={'white'} fontWeight={'bold'} fontSize={['24px', '25px', '34px']}>
            {"Fuse's new bridged BNB v2 is now available on Voltage!"}
          </Text>

          <Flex>
            <Flex flexDirection={'column'} sx={{ gap: [2, 0] }}>
              <Text fontSize={['14px', '15px', '20px']} color={'white'} fontWeight={500}>
                Provide liquidity to the new v3 WFUSE/BNB v2 pool
              </Text>

              <Button
                mt={3}
                sx={{
                  bg: 'highlight',
                  justifyContent: 'center',
                  height: ['45px', '32px', '48px'],
                  width: ['147px', '180px', '227px'],
                }}
              >
                <a
                  target="_blank"
                  rel="noopener noreferrer"
                  href={'https://voltage.finance/swap'}
                  style={{ textDecoration: 'none' }}
                >
                  <Text color={'black'} fontSize={['16px', '17px', '18px']}>
                    Trade Now
                  </Text>
                </a>
              </Button>
            </Flex>

            <Flex alignItems={'center'} width={['100%', '0%']} justifyContent={'center'}>
              <Image
                src={BNBv2BannerSVGMobile}
                sx={{
                  height: ['130px'],
                  display: ['flex', 'none'],
                }}
              />
            </Flex>
          </Flex>
        </Flex>

        <Flex alignItems={'center'} width={['0%', '40%']} justifyContent={'center'}>
          <Image
            src={BNBv2BannerSVGDesktop}
            sx={{
              height: ['300px'],
              display: ['none', 'flex'],
            }}
          />
        </Flex>
      </Flex>
    </Card>
  )
}
