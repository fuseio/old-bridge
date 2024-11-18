import { Box, Flex, Image, Text, Card } from 'rebass/styled-components'

import { GetAppButton } from '../../../components/Button/getApp'

import PassiveIncomeSVG from '../../../assets/svg/earn/passive-income.svg'
import MultichainSVG from '../../../assets/svg/earn/multichain.svg'
import GaslessTransactionsSVG from '../../../assets/svg/earn/gasless-transactions.svg'


export default function Earn() {
  const cardHeaderFontSize = [4, 5]
  const cardSubheaderFontSize = [2, 3]

  return (
    <Box as="section">
      <Box px={3} py={[5, '100px']}>
        <Box maxWidth={'1200px'} mx="auto">
          <Text fontSize={['28px', '46px']} fontWeight={700} maxWidth={'500px'} textAlign={'center'} mx="auto" as="h2">
            Earn crypto while you sleep
          </Text>

          <Box
            height={'fit-content'}
            width={'100%'}
            sx={{
              display: 'grid',
              'justify-items': 'center',
              'grid-row-gap': 30,
              'grid-template-rows': '1fr',
              marginTop: [3, 5]
            }}
          >
            <Card
              sx={{
                display: 'flex',
                flexDirection: ['column', 'row'],
                justifyContent: 'space-between',
                backgroundColor: 'secondary',
                borderRadius: '30px',
                width: '100%',
                padding: '0'
              }}
              as="article"
            >
              <Flex
                sx={{
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  gap: 3,
                  padding: ['34px 38px', '40px 0 40px 48px']
                }}
              >
                <Flex
                  sx={{
                    flexDirection: 'column',
                    gap: 3,
                    '*': {
                      color: 'white',
                    }
                  }}
                >
                  <Text fontSize={cardHeaderFontSize} fontWeight={'bold'} maxWidth={'450px'} as="h3">
                    Earn Passive Income on your stables and Crypto
                  </Text>
                  <Text fontSize={cardSubheaderFontSize} fontWeight={500} maxWidth={'400px'} as="p">
                    Put your crypto to work by staking tokens like ETH, USDC, FUSE to earn high yields and grow your portfolio effortlessly.
                  </Text>
                </Flex>
                <Flex>
                  <GetAppButton name="Get the App" variant={"greenPrimary"} sx={{ fontSize: 3, py: '12px', px: 4 }} />
                </Flex>
              </Flex>
              <Image src={PassiveIncomeSVG} />
            </Card>

            <Box
              width={'100%'}
              sx={{
                display: 'grid',
                'justify-items': 'center',
                'grid-column-gap': 30,
                'grid-row-gap': [30, 0],
                'grid-template-columns': ['repeat(1, 1fr)', 'repeat(2, 1fr)'],
              }}
            >
              <Flex
                sx={{
                  position: 'relative',
                  width: '100%',
                  display: 'flex',
                  justifyContent: 'space-between',
                  flexDirection: ['column', 'row'],
                  gap: 3,
                  backgroundColor: "gray",
                  px: '38px',
                  py: '34px',
                  borderRadius: '30px',
                }}
                as="article"
              >
                <Flex
                  sx={{
                    flexDirection: 'column',
                    gap: 3,
                  }}
                >
                  <Text fontSize={cardHeaderFontSize} fontWeight={'bold'} maxWidth={'260px'} as="h3">
                    Multichain. Any currency
                  </Text>
                  <Text fontSize={cardSubheaderFontSize} fontWeight={500} maxWidth={'230px'} as="p">
                    Buy crypto in your local currency. Deposit from Any Network
                  </Text>
                </Flex>

                <Image
                  sx={{
                    position: ['static', 'absolute'],
                    right: '30px',
                    bottom: '30px',
                  }}
                  src={MultichainSVG}
                />
              </Flex>

              <Flex
                sx={{
                  position: 'relative',
                  width: '100%',
                  display: 'flex',
                  justifyContent: 'space-between',
                  flexDirection: ['column', 'row'],
                  backgroundColor: "white",
                  gap: 3,
                  px: '38px',
                  py: '0',
                  borderRadius: '30px',
                  minHeight: '400px',
                }}
                as="article"
              >
                <Flex
                  sx={{
                    flexDirection: 'column',
                    gap: 3,
                    py: '34px',
                  }}
                >
                  <Text fontSize={cardHeaderFontSize} fontWeight={'bold'} maxWidth={'260px'} as="h3">
                    You trade, we pay the gas
                  </Text>
                  <Text fontSize={cardSubheaderFontSize} fontWeight={500} maxWidth={'200px'} as="p">
                    {"Enjoy Swaping without paying gas fees - it's that simple."}
                  </Text>
                </Flex>

                <Image src={GaslessTransactionsSVG} />
              </Flex>
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  )
}
