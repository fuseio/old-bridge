import { Box, Text, Image, Flex } from 'rebass/styled-components'

import PoweredByFuse from '../../../assets/svg/fintech/powered-by-fuse.svg'
import VoltAppDashboard from '../../../assets/svg/fintech/volt-app-dashboard.svg'
import SafeAffordable from '../../../assets/svg/fintech/safe-affordable.svg'
import SecureBiometrics from '../../../assets/svg/fintech/secure-biometrics.svg'
import NoFee from '../../../assets/svg/fintech/no-fee.svg'

const Card = ({
  title,
  description,
  image,
}: {
  title: string,
  description: string,
  image: string,
}) => {
  return (
    <Flex
      sx={{
        flexDirection: 'column',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        gap: 2,
      }}
    >
      <Image src={image} alt="" />
      <Flex
        sx={{
          flexDirection: 'column',
          justifyContent: 'flex-start',
          alignItems: 'flex-start',
          gap: 1
        }}
      >
        <Text fontSize={4} fontWeight={700} marginTop={1} maxWidth={'400px'} as="p">
          {title}
        </Text>
        <Text maxWidth={'430px'} as="p">
          {description}
        </Text>
      </Flex>
    </Flex>
  )
}

export default function Fintech() {
  return (
    <Box bg='white' as="section">
      <Box px={3} py={[5, '100px']}>
        <Box maxWidth={'1200px'} mx="auto">
          <Text fontSize={['28px', '46px']} fontWeight={700} maxWidth={'700px'} textAlign={'center'} mx="auto" as="h2">
            The Cryptopowered Fintech App Built for you
          </Text>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: ['1fr', '1fr 1fr'],
              gap: 4,
              marginTop: [3, 5]
            }}
          >
            <Flex
              sx={{
                bg: 'gray70',
                borderRadius: '30px',
                flexDirection: 'column',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: 4,
                padding: '0 30px 30px 30px',
              }}
            >
              <Image src={VoltAppDashboard} alt="Volt App Dashboard" maxWidth={'60%'} />
              <Image src={PoweredByFuse} alt="Powered by Fuse" />
            </Flex>
            <Flex
              sx={{
                flexDirection: 'column',
                justifyContent: 'space-between',
                gap: 4,
                backgroundColor: 'secondary',
                borderRadius: '30px',
                padding: [4, '40px 44px'],
                '*': {
                  color: 'white'
                }
              }}
            >
              <Card
                title="Safe & Affordable"
                description="Built using Safe technology. Onchain infrastructure that secures more than $100B in value."
                image={SafeAffordable}
              />
              <Card
                title="Secure your account with biometrics"
                description="Never worry about seed-phrases anymore"
                image={SecureBiometrics}
              />
              <Card
                title="No transaction fee, we take care of them for you"
                description="Swap, and stake tokens with VOLT for less than $0.01"
                image={NoFee}
              />
            </Flex>
          </Box>
        </Box>
      </Box>
    </Box>
  )
}
