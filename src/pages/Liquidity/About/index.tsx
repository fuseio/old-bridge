import { Card, Flex, Text } from 'rebass/styled-components'
import { ComponentLoader } from '../../../wrappers/ComponentLoader'

const About = () => {
  return (
    <Card>
      <Flex flexDirection={'column'} sx={{ gap: 2 }}>
        <ComponentLoader width={150} loading={false}>
          <Text fontSize={2} fontWeight={700}>
            About
          </Text>
        </ComponentLoader>
        <ComponentLoader height={120} width={'100%'} loading={false}>
          <Flex pt={3} lineHeight={1.4} minHeight={60} fontSize={1} flexDirection={'column'}>
            <Text>
              A liquidity pool (LP) is a collection of two tokens, such as VOLT and FUSE, facilitating automatic
              exchanges. By contributing tokens to the LP, users earn a 0.3% fee from trades between those tokens
              proportional to their pool share. However, this comes with the risk of impermanent loss if the tokens
              values diverge.
              <br></br>
              <br></br>
              <a
                target="_blank"
                href="https://docs.voltage.finance/voltage/the-platform/liquidity-pools"
                rel="noreferrer"
              >
                Learn More
              </a>
            </Text>
          </Flex>
        </ComponentLoader>
      </Flex>
    </Card>
  )
}
export default About
