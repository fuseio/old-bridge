import { Box, Button, Flex, Image } from 'rebass/styled-components'
import WalletCoins from '../../../assets/images/wallet-coins.png'
import Card from '../../../collections/Card'
const Leverage = () => {
  return (
    <Box
      pb={200}
      height={'fit-content'}
      width={'100%'}
      sx={{
        display: 'grid',
        'justify-items': 'center',
        'grid-row-gap': 16,
        'grid-template-rows': '1fr',
      }}
    >
      <Card pb={[0, 5]} overflow="visible" bg="secondary">
        <Card.Body>
          <Box
            sx={{
              display: 'grid',
              'justify-items': 'center',
              'grid-column-gap': 16,
              'grid-template-rows': ['0.8fr 1fr', '1fr'],
              'grid-template-columns': ['1fr', '1.4fr 1fr'],
            }}
          >
            <Flex flexDirection={'column'}>
              <Card.Header color="white" fontSize={[28, 48]}>
                Leveraging the Fuse mobile stack
              </Card.Header>
              <Card.Subheader pt={2} color="white">
                VOLT offers advanced features like rate limits, social recovery, swaps, NFT support, and more. Stay
                tuned for our upcoming updates!
              </Card.Subheader>
              <Flex mt={3} sx={{ gap: 3 }} flexDirection={['column', 'row']} alignItems={['left', 'center']}>
                <Button color="secondary" bg="white" px={5} width={'fit-content'}>
                  <a style={{ textDecoration: 'none' }} href={''} target="_blank" rel="noreferrer">
                    Learn More
                  </a>
                </Button>
              </Flex>
            </Flex>
            <Image
              mt={3}
              mb={3}
              width={350}
              sx={{ position: ['relative', 'absolute'], bottom: ['32px', '16px'], right: ['0px', '82px'] }}
              src={WalletCoins}
            />
          </Box>
        </Card.Body>
      </Card>
    </Box>
  )
}
export default Leverage
