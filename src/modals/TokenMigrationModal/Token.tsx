import React from 'react'
import { Currency } from '@voltage-finance/sdk-core'
import { Box, Flex } from 'rebass/styled-components'
import CurrencyLogo from '../../components/Logo/CurrencyLogo'
import { WrappedTokenInfo } from '../../state/lists/hooks'
import { TYPE } from '../../theme'
import { safeShortenAddress } from '../../utils'
import Copy from '../WalletModal/AccountDetails/Copy'

export default function Token({ token, addressColor }: { token: Currency | undefined; addressColor?: string }) {
  const wrappedToken = token as WrappedTokenInfo
  return (
    <Flex alignItems={'center'}>
      <CurrencyLogo currency={wrappedToken} size="40px" />
      <Box ml={1}>
        <TYPE.body>{wrappedToken?.symbol}</TYPE.body>
        <TYPE.body color={addressColor}>
          <Copy toCopy={wrappedToken?.address} color={addressColor} fontSize="16px" paddingLeft="0">
            <Box ml={1}>
              <TYPE.main>{safeShortenAddress(wrappedToken?.address)}</TYPE.main>
            </Box>
          </Copy>
        </TYPE.body>
      </Box>
    </Flex>
  )
}
