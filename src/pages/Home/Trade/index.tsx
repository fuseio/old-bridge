import { useHistory } from 'react-router-dom'
import { Box, Button, Flex, Image, Text } from 'rebass/styled-components'

import Card from '../../../collections/Card'
import Section from '../../../collections/Section'

import TradeSVG from '../../../assets/svg/trade.svg'
import SampleGraphSVG from '../../../assets/svg/sample-swap.svg'
import ExchangeCoinSVG from '../../../assets/svg/exchange-coin.svg'
import { preset } from '../../../theme/preset'

const Trade = () => {
  const history = useHistory()

  const cardHeaderFontSize = ['23px', '34px']
  const cardSubheaderFontSize = ['14px', '20px']

  return (
    <Section>
      <Section.Header>
        <Text fontSize={['32px', '60px']}>Safely trade your crypto with just a few clicks</Text>
      </Section.Header>

      <Section.Body>
        <Box
          width={'100%'}
          height={['fit-content', '800px']}
          sx={{
            display: 'grid',
            'justify-items': 'center',
            'grid-column-gap': 30,
            'grid-row-gap': [30, 0],
            'grid-template-columns': ['repeat(1, 1fr)', 'repeat(2, 1fr)'],
          }}
        >
          <Card bg="secondary" px={0} height={'100%'}>
            <Card.Header px={4}>
              <Text fontSize={cardHeaderFontSize} color="white">
                Swap any token at the best rates & low fees
              </Text>
            </Card.Header>

            <Card.Subheader px={4} color="white">
              <Text fontSize={cardSubheaderFontSize} color="white">
                Connect your wallet and trade any token seamlessly
              </Text>
            </Card.Subheader>

            <Card.Body>
              <Flex pt={20} px={4} sx={{ gap: 3 }} flexDirection={'column'}>
                <Button
                  mt={2}
                  px={5}
                  bg="highlight"
                  fontSize={'18px'}
                  color={'primary'}
                  sx={{
                    width: 'fit-content',
                    '&:hover': {
                      background: preset.colors.highlight,
                      color: preset.colors.primary,
                    },
                  }}
                  onClick={() => {
                    history.push('/swap')
                  }}
                >
                  Start Trading
                </Button>
              </Flex>

              <Flex
                pt={50}
                mx="auto"
                height={'100%'}
                width={[13 / 16]}
                justifyContent={'center'}
                style={{ position: 'relative', bottom: '0px' }}
              >
                <Image src={SampleGraphSVG} />
              </Flex>
            </Card.Body>
          </Card>

          <Box
            width={'100%'}
            sx={{
              display: 'grid',
              'grid-row-gap': 30,
              'justify-items': 'center',
              'grid-template-rows': 'repeat(2, 1fr)',
            }}
          >
            <Card p={['25px', 4]}>
              <Card.Header>
                <Text fontSize={cardHeaderFontSize}>Liquid Staking</Text>
              </Card.Header>

              <Card.Subheader>
                <Text fontSize={cardSubheaderFontSize}>Stake your crypto now and earn up to 15% APR!</Text>
              </Card.Subheader>

              <Card.Body>
                <Flex justifyContent={'space-between'} width={'100%'} ml={'auto'} height={180}>
                  <Flex minWidth={'120px'}>
                    <Card.Link
                      to="/stake"
                      color="highlight"
                      fontSize={['12px', '16px']}
                      wrapperStyle={{ marginTop: 'auto' }}
                    >
                      Go to Stake
                    </Card.Link>
                  </Flex>

                  <Image src={ExchangeCoinSVG} />
                </Flex>
              </Card.Body>
            </Card>

            <Card bg="gray" p={['25px', 4]}>
              <Card.Header>
                <Text fontSize={cardHeaderFontSize}>Lending</Text>
              </Card.Header>

              <Card.Subheader>
                <Text fontSize={cardSubheaderFontSize}>Get an instant loan backed by your crypto</Text>
              </Card.Subheader>

              <Card.Body>
                <Flex
                  ml={'auto'}
                  height={180}
                  width={'100%'}
                  sx={{ gap: [1, undefined] }}
                  justifyContent={'space-between'}
                >
                  <Button
                    p={0}
                    variant="outline"
                    sx={{
                      width: ['160px', '163px'],
                      height: ['39px', '48px'],
                      marginTop: 'auto',
                      '&:hover': {
                        background: 'none',
                        border: 'none',
                        outline: '1px solid #333333',
                      },
                    }}
                  >
                    <Text fontSize={['14px', '18px']} color={'black'} mx={[2, undefined]}>
                      Coming soon
                    </Text>
                  </Button>

                  <Image src={TradeSVG} />
                </Flex>
              </Card.Body>
            </Card>
          </Box>
        </Box>
      </Section.Body>
    </Section>
  )
}
export default Trade
