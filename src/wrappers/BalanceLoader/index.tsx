import { Box } from 'rebass/styled-components'
import { useNativeCurrencyBalances } from '../../state/wallet/hooks'

import React from 'react'
import { useWeb3 } from '../../hooks'

interface BalanceLoader {
  minWidth?: string | number
  children?: React.ReactNode
}

// FIXME: should render when the children are ready and not wait for userETHBalance
export const BalanceLoader = ({ minWidth, children }: BalanceLoader) => {
  const { account } = useWeb3()
  const userEthBalance = useNativeCurrencyBalances([account])[account ?? '']
  const loading = account && !userEthBalance

  return (
    <Box minWidth={minWidth} height="fit-content" style={{ position: 'relative' }} variant={loading ? 'loading' : ''}>
      <Box style={loading ? { visibility: 'hidden' } : { visibility: 'visible' }}>{children}</Box>
    </Box>
  )
}
