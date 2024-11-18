import { Box, Text, Image, Flex, Button } from 'rebass/styled-components'
import { useHistory } from 'react-router-dom'

import Liquidity from '../../../assets/svg/pro/liquidity.svg'
import Lending from '../../../assets/svg/pro/lending.svg'
import Voltage from '../../../assets/svg/pro/voltage.svg'
import Staking from '../../../assets/svg/pro/staking.svg'
import Yield from '../../../assets/svg/pro/yield.svg'
import Analytics from '../../../assets/svg/pro/analytics.svg'

const Card = ({
  title,
  description,
  image,
  row,
  col
}: {
  title: string,
  description: string,
  image: string,
  row: string | string[],
  col: string | string[]
}) => {
  return (
    <Flex
      sx={{
        gridRow: row,
        gridColumn: col,
        bg: '#ffffff1a',
        borderRadius: '30px',
        flexDirection: 'column',
        justifyContent: 'flex-start',
        alignItems: 'flex-start',
        gap: 4,
        padding: [4, '36px'],
      }}
    >
      <Image src={image} alt="" />
      <Flex
        sx={{
          flexDirection: 'column',
          gap: 1,
        }}
      >
        <Text fontSize={3} fontWeight={700} color={'green500'} as="p">
          {title}
        </Text>
        <Text color={'white'} opacity={0.7} maxWidth={['none', '190px']} as="p">
          {description}
        </Text>
      </Flex>
    </Flex>
  )
}

const CardVertical = ({
  title,
  image,
  row,
  col
}: {
  title: string,
  image: string,
  row: string | string[],
  col: string | string[]
}) => {
  const history = useHistory()

  return (
    <Flex
      sx={{
        gridRow: row,
        gridColumn: col,
        background: 'linear-gradient(200deg, #C0FF80 0%, #78E209 100%)',
        border: '1px solid #76EC00',
        borderRadius: '30px',
        textAlign: 'center',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 4,
        padding: '12px',
        minHeight: '550px'
      }}
    >
      <Image src={image} alt="" />
      <Text fontSize={3} color={'black'} opacity={0.7} as="p">
        {title}
      </Text>
      <Button
        variant='grayPrimary'
        onClick={() => {
          history.push('/swap')
        }}
      >
        Start Trading
      </Button>
    </Flex>
  )
}

const CardHorizontal = ({
  title,
  description,
  image,
  row,
  col
}: {
  title: string,
  description: string,
  image: string,
  row: string | string[],
  col: string | string[]
}) => {
  return (
    <Flex
      sx={{
        gridRow: row,
        gridColumn: col,
        bg: '#ffffff1a',
        borderRadius: '30px',
        flexDirection: ['column', 'row'],
        justifyContent: 'flex-start',
        alignItems: ['start', 'center'],
        gap: 4,
        padding: [4, '36px'],
      }}
    >
      <Image src={image} alt="" />
      <Flex
        sx={{
          flexDirection: 'column',
          gap: 1,
        }}
      >
        <Text fontSize={3} fontWeight={700} color={'green500'} as="p">
          {title}
        </Text>
        <Text color={'white'} opacity={0.7} maxWidth={['none', '400px']} as="p">
          {description}
        </Text>
      </Flex>
    </Flex>
  )
}

export default function Pro() {
  return (
    <Box
      bg='secondary'
      as="section"
      sx={{
        '*': {
          color: 'white'
        }
      }}
    >
      <Box px={3} py={[5, '100px']}>
        <Box maxWidth={'1200px'} mx="auto">
          <Text fontSize={['28px', '46px']} fontWeight={700} maxWidth={'700px'} textAlign={'center'} mx="auto" as="h2">
            VOLT PRO
          </Text>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: ['1fr', '1fr 1fr 1fr 1fr'],
              gridTemplateRows: ['auto', '1fr 1fr 1fr 1fr'],
              gap: 4,
              marginTop: [3, 5]
            }}
          >
            <Card
              title='Provide Liquidity'
              description='Earn fees on every swap by providing liquidity to Voltage pools'
              image={Liquidity}
              row={['1 / 1', '1 / 4']}
              col='1 / 1'
            />
            <Card
              title='Lending'
              description='Get an instant loan backed by your crypto'
              image={Lending}
              row={['2 / 2', '1 / 4']}
              col={['1 / 1', '2 / 2']}
            />
            <CardVertical
              title='Unlock Advanced DeFi Features with Our Web App'
              image={Voltage}
              row={['3 / 3', '1 / 5']}
              col={['1 / 1', '3 / 3']}
            />
            <Card
              title='Liquid Staking'
              description='Stake, Lend, and open Leveraged positions with sFUSE.'
              image={Staking}
              row={['4 / 4', '1 / 3']}
              col={['1 / 1', '4 / 4']}
            />
            <CardHorizontal
              title='Analytics'
              description='Gain deep insights into trading and yield opportunities for a competitive edge.'
              image={Analytics}
              row={['5 / 5', '4 / 5']}
              col={['1 / 1', '1 / 3']}
            />
            <Card
              title='Extra yield'
              description='Stake your LP tokens in v2 & v3 Farms'
              image={Yield}
              row={['6 / 6', '3 / 5']}
              col={['1 / 1', '4 / 4']}
            />
          </Box>
        </Box>
      </Box>
    </Box>
  )
}
