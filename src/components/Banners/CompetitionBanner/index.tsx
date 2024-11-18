import { useHistory } from 'react-router-dom'
import { Box, Button, Flex, Image, Text } from 'rebass/styled-components'

import Card from '../../../collections/Card'

import FuseVoltCoinsSvg from '../../../assets/svg/fuse-volt-coins.svg'

export default function CompetitionBanner() {
  const history = useHistory()

  return (
    <Card bg="secondary" height={'100%'} style={{ overflow: 'visible' }}>
      <Card.Body>
        <Flex
          pb={3}
          flexDirection={['column', 'row', 'row']}
          justifyContent="space-between"
          alignItems="center"
          height={['100%', '8vh', '13vh']}
        >
          <Box
            width={[1, 0.37, 0.37]}
            textAlign={'left'}
            sx={{
              pl: ['7%', 0, 0],
              mb: [4, 0, 0],
              order: [2, 1, 1],
            }}
          >
            <Text fontSize={['6vw', '2.5vw', 5]} fontWeight={'bold'} color={'white'}>
              Earn to Trade & provide liquidity to v3
            </Text>
            <br />
            <Text fontSize={['3vw', '1.5vw', 3]} color={'white'} fontWeight={'600'}>
              13.5K+ in FUSE & 7.5M VOLT up for grab
            </Text>
          </Box>
          <Box
            pt={[0, 4, 4]}
            sx={{
              mt: ['-100px', 0, 0],
              order: [1, 2, 2],
            }}
            justifyContent="center"
            display="flex"
          >
            <Image
              sx={{
                filter: 'drop-shadow(0 4px 6px rgba(0, 0, 0, 0.5))',
              }}
              src={FuseVoltCoinsSvg}
            />
          </Box>
          <Box
            pl={1}
            sx={{
              order: [3],
            }}
          >
            <Button
              onClick={() => {
                history.push('/swap')
              }}
              sx={{
                fontSize: [2, 2, 3],
                bg: 'highlight',
                color: 'primary',
                width: 'fit-content',
                px: [5, 4, 5],
                py: [3],
                justifyContent: 'center',
              }}
            >
              Trade now!
            </Button>
          </Box>
        </Flex>
      </Card.Body>
    </Card>
  )
}
