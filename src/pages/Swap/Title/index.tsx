import { Flex, Text } from 'rebass/styled-components'
import CurrencyLogo from '../../../components/Logo/CurrencyLogo'
import { ComponentLoader } from '../../../wrappers/ComponentLoader'

const getAlternations = ({ token0 }) => {
  let name = token0?.name

  if (!token0?.name || token0?.name === 'FUSE') {
    name = 'Fuse Token'
  } else if (token0?.name === 'VoltToken') {
    name = 'Volt Token'
  }

  return name
}

const Title = ({ token0 }: any) => {
  return (
    <ComponentLoader height={50.4} width={200} loading={!token0}>
      <Flex alignItems={'center'} sx={{ gap: 3 }}>
        <CurrencyLogo size="36px" currency={token0} />

        <Flex
          sx={{ gap: [2, 3] }}
          justifyContent={'center'}
          alignItems={['', 'flex-end']}
          flexDirection={['column', 'row']}
        >
          <Text fontSize={['38px', '32px']} color={'black'} fontWeight={600}>
            {getAlternations({ token0 })}
          </Text>

          <Text fontSize={['24px', '20px']} color={'blk70'} mb={1} fontWeight={500}>
            {token0?.symbol || 'FUSE'}
          </Text>
        </Flex>
      </Flex>
    </ComponentLoader>
  )
}
export default Title
