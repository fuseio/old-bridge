import { Box, Flex, Image } from 'rebass/styled-components'
import Card from '../../../collections/Card'

function importAll(r) {
  const images = {}
  r.keys().forEach((item) => {
    images[item.replace('./', '')] = r(item)
  })
  return images
}

const Partners = () => {
  const partners = importAll((require as any).context('../../../assets/images/partners', false, /\.(png|jpe?g|svg)$/))
  const integrations = importAll(
    (require as any).context('../../../assets/images/integrations', false, /\.(png|jpe?g|svg)$/)
  )
  return (
    <Flex sx={{ gap: 4 }} flexDirection={'column'}>
      <Card bg="secondary">
        <Card.Header color="white">Partners</Card.Header>
        <Card.Body>
          <Box
            width={'100%'}
            sx={{
              display: 'grid',
              rowGap: 3,
              gridTemplateColumns: ['repeat(4,1fr)', 'repeat(4,1fr)'],
            }}
          >
            {Object.keys(partners).map((key, index) => {
              return <Image key={index} src={partners[key]} />
            })}
          </Box>
        </Card.Body>
      </Card>

      <Card bg="secondary">
        <Card.Header color="white">Integrations</Card.Header>
        <Card.Body>
          <Box
            width={'100%'}
            sx={{
              display: 'grid',
              rowGap: 3,
              gridTemplateColumns: ['repeat(4,1fr)', 'repeat(4,1fr)'],
              '& > :nth-last-child(-n+2)': {
                gridColumnStart: 2,
              },
              '& > :nth-last-child(-n+1)': {
                gridColumnStart: 3,
              },
            }}
          >
            {Object.keys(integrations).map((key, index) => {
              return <Image key={index} src={integrations[key]} />
            })}
          </Box>
        </Card.Body>
      </Card>
    </Flex>
  )
}
export default Partners
