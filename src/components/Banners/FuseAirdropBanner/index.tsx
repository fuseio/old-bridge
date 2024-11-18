import { Button, Flex, Image, Text } from 'rebass/styled-components'

import Card from '../../../collections/Card'

import FuseAirdropBalloonSvg from '../../../assets/svg/landing/fuse-aidrop-balloon.svg'
import { Hidden } from '../../../wrappers/Hidden'

export default function FuseAirdropBanner() {
  return (
    <Card
      px={25}
      bg="secondary"
      mt={[50, 80, 50]}
      alignItems={'center'}
      height={[undefined, '169px']}
      style={{ overflow: 'visible' }}
    >
      <Card.Body py={4} mt={[undefined, '-30px']}>
        <Flex
          display="flex"
          alignItems="center"
          sx={{ gap: [3, 0, 0] }}
          flexDirection={['row', 'row', 'row']}
          height={['110px', '110px', '110px']}
          justifyContent={['center', 'space-between']}
        >
          <Flex
            textAlign={'left'}
            flexDirection={'column'}
            sx={{
              order: [1],
              gap: [3, 0, 0],
            }}
          >
            <Text mb={1} fontSize={['24px', '25px', '34px']} fontWeight={'bold'} color={'highlight'}>
              2M FUSE Airdrop is here!
            </Text>

            <Text fontSize={['14px', '15px', '20px']} color={'white'} fontWeight={500}>
              Use the Voltage DApp to boost your airdrop allocation
            </Text>

            <Hidden tablet={true} desktop={true}>
              <Flex mt={2}>
                <Button
                  sx={{
                    bg: 'highlight',
                    width: ['148px'],
                    height: ['37x'],
                    justifyContent: 'center',
                  }}
                >
                  <a
                    target="_blank"
                    rel="noopener noreferrer"
                    href={'https://airdrop.fuse.io/'}
                    style={{ textDecoration: 'none' }}
                  >
                    <Text color={'black'} fontSize={['14px']}>
                      Claim Airdrop
                    </Text>
                  </a>
                </Button>
              </Flex>
            </Hidden>
          </Flex>

          <Flex
            px={[0, 2, 0]}
            pt={[0, 4, 4]}
            display="flex"
            justifyContent="center"
            alignContent={['center', undefined, undefined]}
            sx={{
              mt: [undefined, '-50px', '-50px'],
              order: [2],
            }}
          >
            <Image
              src={FuseAirdropBalloonSvg}
              sx={{
                filter: 'drop-shadow(0 4px 6px rgba(0, 0, 0, 0.5))',
              }}
            />
          </Flex>

          <Hidden
            mobile={true}
            sx={{
              order: [3],
            }}
          >
            <Flex>
              <Button
                sx={{
                  bg: 'highlight',
                  width: ['227px', '180px', '227px'],
                  height: ['48px', '32px', '48px'],
                  justifyContent: 'center',
                }}
              >
                <a
                  target="_blank"
                  rel="noopener noreferrer"
                  href={'https://airdrop.fuse.io/'}
                  style={{ textDecoration: 'none' }}
                >
                  <Text color={'black'} fontSize={['18px', '14px', '18px']}>
                    Claim Airdrop
                  </Text>
                </a>
              </Button>
            </Flex>
          </Hidden>
        </Flex>
      </Card.Body>
    </Card>
  )
}
