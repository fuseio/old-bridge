import { ChevronRight } from 'react-feather'
import { Box, Flex, Text } from 'rebass/styled-components'
import MultiCurrencyLogo from '../../components/MultiCurrencyLogo'
import { formatSignificant } from '../../utils'
import { useHistory } from 'react-router-dom'

export const APRCard = ({ token0, token1, to, apr = 0 }: { to: string; token0: any; token1: any; apr: number }) => {
  const history = useHistory()
  return (
    <Box
      onClick={() => {
        history.push(to)
      }}
      px={2}
      width={['100%', 350]}
      height={75}
      variant={'glass'}
      sx={{
        '&:hover': {
          background: 'rgba(255, 255, 255, 0.2)',
          cursor: 'pointer',
          transition: 'background 200ms ease-in-out',
        },
      }}
    >
      <Flex width={'100%'} height={'100%'} alignItems={'center'} justifyContent={'space-between'}>
        <Flex sx={{ gap: 3 }} height={'100%'} alignItems={'center'}>
          <MultiCurrencyLogo size={'40'} tokenAddresses={[token0?.address || 'FUSE', token1?.address]} />
          <Flex flexDirection={'column'}>
            <Text fontSize={3} fontWeight={600} color="white">
              {token0.symbol}
            </Text>
            <Text fontSize={1} opacity={0.7} fontWeight={400} color="white">
              For {token1.symbol}
            </Text>
          </Flex>
        </Flex>
        <Flex height={'100%'} alignItems={'center'}>
          <Text fontSize={2} fontWeight={600} color="white">
            {formatSignificant({
              value: apr,
              suffix: '% APR',
            })}
          </Text>
          <ChevronRight size={18} color="white" />
        </Flex>
      </Flex>
    </Box>
  )
}
