import { Box } from 'rebass/styled-components'

import { useWeb3 } from '../../hooks'
import { ChainId } from '../../constants/chains'

export const DisableForeignNetwork = ({
  disabled,
  enableOnAllNetworks,
  children,
}: {
  disabled?: boolean
  children: any
  enableOnAllNetworks?: boolean
}) => {
  const { wallet, chainId } = useWeb3()

  const isHome = chainId === ChainId.FUSE || chainId === ChainId.SPARK

  if (disabled || !wallet) {
    return (
      <Box height={'100%'} width={'100%'} sx={{ opacity: 0.5, pointerEvents: 'none' }}>
        {children}
      </Box>
    )
  }
  return (
    <Box
      height={'100%'}
      width={'100%'}
      sx={
        isHome || enableOnAllNetworks ? { opacity: 1, pointerEvents: 'all' } : { opacity: 0.5, pointerEvents: 'none' }
      }
    >
      {children}
    </Box>
  )
}
