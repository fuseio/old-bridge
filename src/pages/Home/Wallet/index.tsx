import { Box, Button, Flex, Image, Text } from 'rebass/styled-components'

import Card from '../../../collections/Card'
import { getDownloadLink } from '../../../utils'
import { DownloadButton } from '../../../wrappers/DownloadButton'

import PhoneSVG from '../../../assets/svg/phone.svg'
import fuseLogoWords from '../../../assets/svg/landing/fuse-logo-words.svg'

const Wallet = () => {
  return (
    <Box
      pb={200}
      width={'100%'}
      pt={[0, 50, 0]}
      height={'fit-content'}
      sx={{
        display: 'grid',
        'justify-items': 'center',
        'grid-row-gap': 16,
        'grid-template-rows': '1fr',
      }}
    >
      <Card px={[3, 3, 4]} py={[3, 3, 4]} bg="gray">
        <Card.Body>
          <Box
            px={[2, 3, 3]}
            sx={{
              display: 'grid',
              'justify-items': 'center',
              'grid-column-gap': 16,
              'grid-template-rows': ['0.5fr 1fr', '1fr'],
              'grid-template-columns': ['1fr', '1.4fr 1fr'],
            }}
          >
            <Flex flexDirection={'column'} sx={{ gap: 2 }}>
              <Card.Header width={['100%', '100%', 12 / 16]}>
                <Text px={2} fontSize={['32px', '24px', '34px']}>
                  Experience gas-less DeFi with the new Volt wallet
                </Text>
              </Card.Header>

              <Card.Subheader minWidth={['0px', '100%', '516.16px']}>
                <Text px={2} fontSize={['14px', '17px', '20px']}>
                  Experience Effortless DeFi with Account Abstraction — Making Managing your Crypto Easy and Intuitive
                  with zero fees using the Volt app
                </Text>

                <Flex mt={[4, 3, 4]} alignItems={'center'} mb={2}>
                  <Text px={2} fontSize={['14px', '17px', '20px']}>
                    Powered by
                  </Text>
                  <Image pl={2} src={fuseLogoWords} />
                </Flex>
              </Card.Subheader>

              <Flex
                pt={2}
                pb={[4, 2, 4]}
                sx={{ gap: [2, 3, 3] }}
                flexDirection={['row']}
                alignItems={['left', 'center']}
                mt={[undefined, 'auto', 'auto']}
              >
                <a target="_blank" rel="noreferrer" href={getDownloadLink()} style={{ textDecoration: 'none' }}>
                  <Button
                    px={5}
                    fontSize={['18px', '14px', '18px']}
                    width={['233px', 'fit-content', 'fit-content']}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      whiteSpace: 'nowrap',
                      justifyContent: 'center',
                    }}
                  >
                    Download Now
                  </Button>
                </a>

                <DownloadButton noBorder showQr={false} />
              </Flex>
            </Flex>

            <Flex alignItems={[undefined, 'center', undefined]}>
              <Image mb={[-30]} src={PhoneSVG} />
            </Flex>
          </Box>
        </Card.Body>
      </Card>
    </Box>
  )
}
export default Wallet
