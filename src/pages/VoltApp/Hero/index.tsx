import { Box, Flex, Image, Text, Card, Button } from 'rebass/styled-components'

import { AppStore, PlayStore } from './svg'
import VoltAppStore from '../../../assets/svg/app-hero/volt-app-store.svg'
import VoltPlayStore from '../../../assets/svg/app-hero/volt-play-store.svg'
import VoltQr from '../../../assets/images/volt-qr.png'
import { getAppleDownloadLink, getGoogleDownloadLink } from '../../../utils'

export default function Hero() {
  return (
    <Box as="section">
      <Box px={3} py={[5, '100px']}>
        <Box maxWidth={'1200px'} mx="auto">
          <Text fontSize={['30px', '50px']} fontWeight={'heading'} as="h1">
            Download the Volt app
          </Text>

          <Box
            sx={{
              display: 'grid',
              'grid-template-columns': ['1fr', '1fr 1fr'],
              gap: 30,
              marginTop: [3, 5],
            }}
          >
            <Card
              sx={{
                gridRow: ['1 / 1'],
                gridColumn: ['1 / 1'],
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                gap: 4,
                backgroundColor: 'white',
                borderRadius: '20px',
                padding: ['30px 30px 0 30px', '40px 0 0 0'],
              }}
              as="article"
            >
              <Flex
                sx={{
                  flexDirection: 'column',
                  justifyContent: 'center',
                  alignItems: 'center',
                  gap: 3,
                }}
              >
                <Text fontSize={['20px']} fontWeight={600} as="p">
                  Get it on
                </Text>
                <Button
                  variant="grayPrimary"
                  onClick={() => window.open(getAppleDownloadLink(), '_blank')}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    fontSize: 3,
                    fontWeight: 'bold',
                    '*': {
                      color: 'white'
                    },
                    '&:hover *': {
                      color: 'secondary'
                    }
                  }}
                >
                  <Flex alignItems={'center'} style={{ gap: '10px', color: 'inherit' }}>
                    <AppStore />
                    Apple Store
                  </Flex>
                </Button>
              </Flex>
              <Image src={VoltAppStore} />
            </Card>

            <Card
              sx={{
                gridRow: ['2 / 2', '1 / 1'],
                gridColumn: ['1 / 1', '2 / 2'],
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                gap: 4,
                backgroundColor: 'white',
                borderRadius: '20px',
                padding: ['30px 30px 0 30px', '40px 0 0 0'],
              }}
              as="article"
            >
              <Flex
                sx={{
                  flexDirection: 'column',
                  justifyContent: 'center',
                  alignItems: 'center',
                  gap: 3,
                }}
              >
                <Text fontSize={['20px']} fontWeight={600} as="p">
                  Get it on
                </Text>
                <Button
                  variant="grayPrimary"
                  onClick={() => window.open(getGoogleDownloadLink(), '_blank')}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    fontSize: 3,
                    fontWeight: 'bold',
                    '*': {
                      color: 'white'
                    },
                    '&:hover *': {
                      color: 'secondary'
                    }
                  }}
                >
                  <Flex alignItems={'center'} style={{ gap: '10px', color: 'inherit' }}>
                    <PlayStore />
                    Google Play
                  </Flex>
                </Button>
              </Flex>
              <Image src={VoltPlayStore} />
            </Card>

            <Card
              sx={{
                gridRow: ['3 / 3', '2 / 2'],
                gridColumn: ['1 / 1', '1 / 3'],
                display: 'flex',
                flexDirection: ['column', 'row'],
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: 4,
                backgroundColor: 'white',
                borderRadius: '20px',
                padding: [4, '40px 42px 40px 100px'],
                width: '100%',
              }}
              as="article"
            >
              <Text fontSize={[4, 5]} fontWeight={'bold'} maxWidth={'390px'} as="p">
                Scan this QR code on your phone to get the Volt app
              </Text>
              <Image src={VoltQr} width={316} />
            </Card>
          </Box>
        </Box>
      </Box>
    </Box>
  )
}
