import { Box, Image, Flex } from 'rebass/styled-components'
import WalletScreen1 from '../../../assets/images/wallet-iphone-1.png'
import WalletScreen2 from '../../../assets/images/wallet-iphone-2.png'
import Section from '../../../collections/Section'
import Card from '../../../collections/Card'
import WalletScreen3 from '../../../assets/images/wallet-iphone-3.png'
import WalletScreen4 from '../../../assets/images/wallet-iphone-4.png'

const Wallet = () => {
  return (
    <Section pb={[16, 250]}>
      <Section.Header>A New Breed of Smart Wallet</Section.Header>
      <Section.Body>
        <Box
          height={'fit-content'}
          width={'100%'}
          sx={{
            display: 'grid',
            'justify-items': 'center',
            'grid-column-gap': 20,
            'grid-row-gap': [20, 20],
            'grid-template-columns': ['repeat(1, 1fr)', 'repeat(2, 1fr)'],
          }}
        >
          <Card height={'fit-content'} py={0} pt={4} width={'100%'} bg="secondary">
            <Card.Header color="white">Secure, Gasless, and Frictionless Transactions</Card.Header>
            <Card.Subheader color="white">
              Enjoy a non-custodial wallet that frees you from fees. With VOLT, your transactions are secure, gasless,
              and smooth.
            </Card.Subheader>
            <Flex pt={3} flexDirection="column" alignItems="center" justifyContent="flex-end" height="100%">
              <Image width={['300px', '400px']} src={WalletScreen1} />
            </Flex>
          </Card>
          <Card height={'fit-content'} py={0} pt={4} width={'100%'} bg="white">
            <Card.Header>Stable Yield Accessible for Everyone</Card.Header>
            <Card.Subheader>
              VOLT is your gateway to low-risk and stable yield strategies. Explore, invest, and grow your assets
              effortlessly.
            </Card.Subheader>
            <Flex pt={3} flexDirection="column" alignItems="center" justifyContent="flex-end" height="100%">
              <Image width={['300px', '400px']} src={WalletScreen2} />
            </Flex>
          </Card>
          <Card height={'fit-content'} py={0} pt={4} width={'100%'} bg="white">
            <Card.Header>Easily Buy Crypto in Your Local Currency</Card.Header>
            <Card.Subheader>
              VOLT aggregates top global fiat ramps, enabling you to easily get crypto with your local currency.
            </Card.Subheader>
            <Flex pt={3} flexDirection="column" alignItems="center" justifyContent="flex-end" height="100%">
              <Image width={['300px', '400px']} src={WalletScreen3} />
            </Flex>
          </Card>
          <Card height={'fit-content'} py={0} pt={4} width={'100%'} bg="gray">
            <Card.Header>Switch to Simplicity with Account Abstraction</Card.Header>
            <Card.Subheader>
              Discover a seamless crypto management experience with VOLT’s Account Abstraction feature.
            </Card.Subheader>
            <Flex pt={3} flexDirection="column" alignItems="center" justifyContent="flex-end" height="100%">
              <Image width={['300px', '400px']} src={WalletScreen4} />
            </Flex>
          </Card>
        </Box>
      </Section.Body>
    </Section>
  )
}
export default Wallet
