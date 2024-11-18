import { isDesktop } from 'react-device-detect'
import { Button, Flex, Image, Text } from 'rebass/styled-components'

import { getDownloadLink } from '../../../utils'
import { DownloadButton } from '../../../wrappers/DownloadButton'

import WalletImage from '../../../assets/svg/wallet-landing.svg'

const Landing = () => {
  return (
    <Flex
      pb={30}
      mb={200}
      height={'calc(100vh - 80px)'}
      sx={{ position: 'relative' }}
      flexDirection={['column', 'row']}
      minHeight={isDesktop ? 700 : 'fit-content'}
    >
      <Flex
        sx={{ zIndex: 1 }}
        flexDirection={'column'}
        width={['100%', 8 / 16]}
        justifyContent={'center'}
        minWidth={['100%', 550, 550]}
        height={['fit-content', '100%']}
      >
        <Flex pb={4} flexDirection={'column'}>
          <Text lineHeight={1} fontSize={[6, 9]} fontWeight={800}>
            Simplify
          </Text>
          <Text lineHeight={1} fontSize={[6, 9]} fontWeight={800}>
            Your DeFi
          </Text>
          <Text lineHeight={1} fontSize={[6, 9]} fontWeight={800}>
            Experience
          </Text>
        </Flex>
        <Text lineHeight={1.3} fontWeight={500} color={'blk50'} width={12 / 16} fontSize={3}>
          Experience Effortless DeFi with Account Abstraction — Making Managing Crypto Easy and Intuitive.
        </Text>

        <Flex mt={3} sx={{ gap: 3 }} alignItems={['center', 'center']}>
          <a href={getDownloadLink()} target="_blank" rel="noreferrer">
            <Button px={5} width={'fit-content'}>
              Download Now
            </Button>
          </a>
          <DownloadButton noBorder />
        </Flex>
      </Flex>

      <Flex minWidth={0} minHeight={0} flexGrow={1}>
        <Image
          mx={'auto'}
          minWidth={0}
          src={WalletImage}
          sx={{
            height: '100%',
            width: ['auto', '100%'],
          }}
        />
      </Flex>
    </Flex>
  )
}
export default Landing
