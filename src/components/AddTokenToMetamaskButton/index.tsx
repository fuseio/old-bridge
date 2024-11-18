import { Currency, Token } from '@voltage-finance/sdk-core'
import React from 'react'
import { Button, Flex } from 'rebass/styled-components'
import styled from 'styled-components'
import metamaskIcon from '../../assets/images/metamask.png'
import { useWeb3 } from '../../hooks'
import { addTokenToWallet } from '../../utils'

interface AddTokenMetamaskProps {
  currency?: Currency
}

const MetamaskIcon = styled.img.attrs({
  src: metamaskIcon
})`
  width: 18px;
  margin-left: 8px;
`

export default function AddTokenToMetamaskButton({ currency }: AddTokenMetamaskProps) {
  const { library } = useWeb3()

  return currency instanceof Token && library ? (
    <Button variant="primary" onClick={() => addTokenToWallet(currency, library)}>
      <Flex alignItems={'center'} width="100%" justifyContent={'center'}>
        <div> Add {currency?.symbol} to Metamask</div>
        <MetamaskIcon />
      </Flex>
    </Button>
  ) : null
}
