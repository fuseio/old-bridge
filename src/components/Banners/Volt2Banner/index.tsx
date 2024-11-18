import { Button, Flex, Image, Text } from 'rebass/styled-components'

import Card from '../../../collections/Card'

import Volt2Png from '../../../assets/images/landing/volt-2.png'
import Volt2MobilePng from '../../../assets/images/landing/volt-2-mobile.png'

export default function Volt2Banner() {
  return (
    <Card bg="#0A0A0A" p={['20px', 4]} mt={[50, 100, 100]} overflow={'visible'} height={['117px', '230px', '257px']}>
      <Flex height={'100%'}>
        <Flex flexDirection={'column'} sx={{ gap: [2, 1] }} width={['100%', '60%']}>
          <Text color={'white'} fontWeight={'bold'} fontSize={['3.8vw', '4vw', '58px']}>
            VOLT 2.0 is coming
          </Text>

          <Flex>
            <Flex flexDirection={'column'} sx={{ gap: [0] }}>
              <Text fontSize={['10px', '2vw', '26px']} color={'white'} fontWeight={500}>
                Tokenomics upgrade, VOLT utility & more
              </Text>

              <Button
                mt={[2, 3]}
                sx={{
                  bg: 'highlight',
                  minHeight: ['22.82px'],
                  borderRadius: ['47.8px'],
                  justifyContent: 'center',
                  py: ['7px', '10px', '18px'],
                  px: ['10px', '20px', '30px'],
                  width: ['67px', '20vw', '227px'],
                  height: ['22.82px', '5vw', '60px'],
                }}
              >
                <a
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ textDecoration: 'none' }}
                  href={
                    'https://forum.voltage.finance/t/vip-12-volt-2-0-new-features-and-tokenomics-upgrades-proposal/482'
                  }
                >
                  <Text color={'text'} fontSize={['7.36px', '2vw', '20px']}>
                    Learn more
                  </Text>
                </a>
              </Button>
            </Flex>
          </Flex>
        </Flex>

        <Flex
          alignItems={'center'}
          width={['0%', '553px', '553px']}
          justifyContent={'center'}
          sx={{
            mt: ['-100px', '-80px', '-135px'],
          }}
        >
          <Image
            src={Volt2Png}
            sx={{
              height: ['0px', '280px', '362.078px'],
              display: ['none', 'flex'],
            }}
          />
        </Flex>

        <Flex
          alignItems={'center'}
          justifyContent={'center'}
          minWidth={['155.922px', '0px']}
          sx={{
            mt: ['-3px'],
            mr: ['-19px'],
          }}
        >
          <Image
            src={Volt2MobilePng}
            sx={{
              height: ['99.797'],
              width: ['155.922px'],
              display: ['flex', 'none'],
            }}
          />
        </Flex>
      </Flex>
    </Card>
  )
}
