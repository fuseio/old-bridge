import { Button, Flex, Image, Text } from 'rebass/styled-components'
import Card from '../../../collections/Card'
import BridgeDeprecation from '../../../assets/images/bridge/bridge-deprecation.png'

export default function BridgeDeprecationBanner() {
  return (
    <Card
      px="50px"
      bg="#0A0A0A"
      p={['20px', 4]}
      mt={[50, 100, 100]}
      overflow="hidden"
      sx={{
        position: 'relative',
        maxHeight: '100vh',
      }}
    >
      <Flex height="100%">
        <Flex flexDirection="column" sx={{ gap: [2, 1] }} width={['100%', '60%']}>
          <Text color="white" fontWeight="bold" fontSize={['8vw', '4vw', '56px']}>
            Attention!
          </Text>
          <Flex>
            <Flex flexDirection="column" sx={{ gap: ['1vh', 0] }}>
              <Text fontSize={['3vw', '2vw', '24px']} color="#D8D8D8" fontWeight={500} width={['90%', '100%']}>
                Voltage Finance Bridge will be deprecated on December 1st!
              </Text>

              <Flex>
                <Button
                  mt={[2, 3]}
                  sx={{
                    bg: 'highlight',
                    minHeight: ['22.82px'],
                    borderRadius: '8px',
                    justifyContent: 'center',
                    py: ['7px', '10px', '18px'],
                    px: ['10px', '20px', '30px'],
                    width: ['auto', '20vw', '227px'],
                    height: ['auto', '5vw', '60px'],
                  }}
                >
                  <a
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ textDecoration: 'none' }}
                    href="https://medium.com/@voltage.finance/voltage-bridge-final-sunsetting-heres-what-you-need-to-know-73471ebedd7a"
                  >
                    <Text color="text" fontSize={['2vw', '2vw', '20px']}>
                      Learn more
                    </Text>
                  </a>
                </Button>

                <Flex
                  sx={{
                    position: 'absolute',
                    top: '9vw',
                    right: '5%',
                    width: ['60vw'],
                    height: ['100%', 'auto'],
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Image
                    src={BridgeDeprecation}
                    sx={{
                      display: ['flex', 'none'],
                      maxWidth: '100%',
                      maxHeight: '100%',
                      objectFit: 'cover',
                    }}
                  />
                </Flex>
              </Flex>
            </Flex>
          </Flex>
        </Flex>

        <Flex alignItems="center" width={['0%', '45vw', '553px']} justifyContent="center">
          <Image
            src={BridgeDeprecation}
            sx={{
              display: ['none', 'flex'],
              maxWidth: '100%',
              objectFit: 'contain',
            }}
          />
        </Flex>
      </Flex>
    </Card>
  )
}
