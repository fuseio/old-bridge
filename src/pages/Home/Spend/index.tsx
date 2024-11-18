import { Box, Text, Image, Flex } from 'rebass/styled-components'
import styled from 'styled-components'

// import { GetAppButton } from '../../../components/Button/getApp' // TODO: check if it will be used in last design

import VoltCards from '../../../assets/svg/spend/volt-cards.png'
import SpendYield from '../../../assets/svg/spend/spend-yield.svg'
import OffRamp from '../../../assets/svg/spend/off-ramp.svg'
import Cashback from '../../../assets/svg/spend/cashback.svg'
import PayAnywhere from '../../../assets/svg/spend/pay-anywhere.svg'
import SelfCustody from '../../../assets/svg/spend/self-custody.svg'

const Ul = styled.ul`
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding-inline-start: 20px;
  margin: 0;
  li::marker {
    color: ${({ theme }) => theme.colors.gray};
    font-size: ${({ theme }) => theme.fontSizes[4]}px;
    line-height: 0.1;
  }
`

export default function Spend() {
  return (
    <Box
      as="section"
      sx={{
        backgroundImage: "url('/images/spend/spend-background.svg')",
        backgroundSize: 'cover',
        backgroundRepeat: 'no-repeat',
      }}
    >
      <Box px={3} py={[5, '100px']}>
        <Box maxWidth={'1200px'} mx="auto">
          <Text fontSize={['28px', '46px']} fontWeight={700} maxWidth={'600px'} textAlign={'center'} mx="auto" as="h2">
            Spend your crypto in 180+ Countries
          </Text>
          <Flex
            sx={{
              flexDirection: 'column',
              gap: [4, '40px'],
              px: [4, '46px'],
              pt: [4, '46px'],
              pb: [4, 5],
              borderRadius: '30px',
              marginTop: [3, 5],
            }}
          >
            <Flex
              sx={{
                flexDirection: ['column', 'row'],
                justifyContent: 'space-between',
                alignItems: ['flex-start', 'center'],
                gap: 3,
                width: '100%',
                maxWidth: '900px',
                mx: 'auto',
              }}
            >
              <Flex
                sx={{
                  alignItems: 'center',
                  gap: 2,
                }}
              >
                <Image src={SpendYield} alt="" maxHeight={'40px'} />
                <Text fontSize={3} fontWeight={700} as="p">
                  Spend your Yield
                </Text>
              </Flex>
              <Flex
                sx={{
                  alignItems: 'center',
                  gap: 2,
                }}
              >
                <Image src={OffRamp} alt="" maxHeight={'40px'} />
                <Text fontSize={3} fontWeight={700} maxWidth={'190px'} as="p">
                  Off-ramp seamlessly Globally
                </Text>
              </Flex>
              <Flex
                sx={{
                  alignItems: 'center',
                  gap: 2,
                }}
              >
                <Image src={Cashback} alt="" maxHeight={'40px'} />
                <Text fontSize={3} fontWeight={700} maxWidth={'220px'} as="p">
                  Get up to 2% Cashback on every purchase
                </Text>
              </Flex>
            </Flex>
            <Image src={VoltCards} alt="Volt Visa cards" />

            <Flex flexDirection={'column'} alignItems={'center'} sx={{ gap: 4 }}>
              <Text fontSize={['15px', '36px']} fontWeight={700} textAlign={'center'} mx="auto" as="h2">
                Get the latest VOLT Updates
              </Text>

              <Box maxWidth={'fit-content'} mx="auto">
                <iframe
                  style={{
                    border: 'none',
                    backgroundColor: 'transparent',
                  }}
                  src="https://embeds.beehiiv.com/40ed971b-19ad-4a44-9e26-ca4b5e7fd48d?slim=true"
                  data-test-id="beehiiv-embed"
                  width="100%"
                  height="60px"
                />
              </Box>
            </Flex>
          </Flex>
          <Flex
            sx={{
              flexDirection: ['column', 'row'],
              justifyContent: 'space-between',
              gap: 4,
              mt: 4,
            }}
          >
            <Flex
              sx={{
                flexDirection: 'column',
                justifyContent: 'space-between',
                alignItems: ['flex-start', 'center'],
                backgroundColor: 'white',
                borderRadius: '30px',
                width: '100%',
                maxWidth: '600px',
                overflow: 'hidden',
              }}
            >
              <Flex
                sx={{
                  flexDirection: 'column',
                  gap: 4,
                  padding: [4, '40px'],
                  width: '100%',
                }}
              >
                <Text fontSize={[4, 5]} fontWeight={700} maxWidth={'400px'} as="h3">
                  Pay anywhere debit card is accepted
                </Text>
                <Ul>
                  <li>80M Merchants Worldwide</li>
                  <li
                    style={{
                      maxWidth: '350px',
                    }}
                  >
                    A Virtual & Physical Card to Spend online & in-store with low fees.
                  </li>
                </Ul>
              </Flex>
              <Image src={PayAnywhere} alt="" />
            </Flex>
            <Flex
              sx={{
                flexDirection: 'column',
                justifyContent: 'space-between',
                alignItems: ['flex-start', 'center'],
                backgroundColor: 'white',
                borderRadius: '30px',
                width: '100%',
                maxWidth: '600px',
                overflow: 'hidden',
              }}
            >
              <Flex
                sx={{
                  flexDirection: 'column',
                  gap: 4,
                  padding: [4, '40px'],
                  width: '100%',
                }}
              >
                <Text fontSize={[4, 5]} fontWeight={700} maxWidth={'450px'} as="h3">
                  Seamless Self-Custody, Just Like Cash
                </Text>
                <Ul>
                  <li>Use stablecoins worldwide like real money</li>
                  <li>Transfer from on-chain to the real world in a few clicks</li>
                  <li>Send & Receive Money in seconds</li>
                </Ul>
              </Flex>
              <Image src={SelfCustody} alt="" px={[4, 0]} pb={4} />
            </Flex>
          </Flex>
        </Box>
      </Box>
    </Box>
  )
}
