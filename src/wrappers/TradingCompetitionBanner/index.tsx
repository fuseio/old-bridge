import { Button, Flex, Image } from 'rebass/styled-components'

import Card from '../../collections/Card'

import Coins from './coins.svg'

const TradingCompetitionBanner = () => {
  return (
    <Card mb={80} overflow="visible" bg="secondary">
      <Card.Header color="white" width={[1, 9 / 16]}>
        Trade & Win Big in Our New Pools!
      </Card.Header>
      <Card.Subheader width={[14 / 16, 7 / 16]} color="white">
        Join our trading competition on TaskOn and compete for a prize pool of 5,000 in FUSE and VOLT!
      </Card.Subheader>
      <Card.Body>
        <Flex flexDirection={'column'}>
          <Flex mt={3} sx={{ gap: 3 }} flexDirection={['column', 'row']} alignItems={['left', 'center']}>
            <a
              href="https://rewards.taskon.xyz/event/detail/24211"
              style={{ textDecoration: 'none', color: 'black' }}
              target="_blank"
              rel="noreferrer"
            >
              <Button color={'black'} bg="highlight" px={5} width={'fit-content'}>
                Trade Now
              </Button>
            </a>
          </Flex>
        </Flex>
      </Card.Body>
      <Image
        width={300}
        mt={[4, 0]}
        sx={{
          position: ['relative', 'absolute'],
          right: 0,
          top: [0, '50%'],
          transform: ['none', 'translate(0%, -50%)'],
        }}
        src={Coins}
      />
    </Card>
  )
}

export default TradingCompetitionBanner
