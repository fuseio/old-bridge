import React, { useMemo } from 'react'
import styled from 'styled-components'
import { ChainId, Currency, Token } from '@voltage-finance/sdk-core'

import Logo from '..'
import { useWeb3 } from '../../../hooks'
import { VOLT, wFUSE } from '../../../constants'
import { BNB, FUSE, ETH } from '../../../data/Currency'
import useHttpLocations from '../../../hooks/useHttpLocations'
import { VOLTAGE_FINANCE_LOGOS_URL } from '../../../constants/lists'
import { WrappedTokenInfo, useSelectedSwapTokenList } from '../../../state/lists/hooks'

import BnbLogo from '../../../assets/images/bnb.png'
import voltSVG from '../../../assets/svg/volt_currency_logo.svg'
import FuseLogo from '../../../assets/svg/logos/fuse-small-logo.svg'
import EthLogo from '../../../assets/svg/logos/ethereum-small-logo.svg'

const getTokenLogoURLs = (address: string) => [
  `https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/${address}/logo.png`,
  `${VOLTAGE_FINANCE_LOGOS_URL}/${address}/logo.png`,
]
const StyledEthereumLogo = styled.img<{ size: string }>`
  width: ${({ size }) => size};
  height: ${({ size }) => size};
  box-shadow: 0px 6px 10px rgba(0, 0, 0, 0.075);
  border-radius: 24px;
`

const StyledLogo = styled(Logo)<{ size: string }>`
  width: ${({ size }) => size};
  height: ${({ size }) => size};
`

export default function CurrencyLogo({
  currency,
  size = '24px',
  style,
  chainId: providedChainId,
  tokenUrl,
}: {
  currency?: Currency
  size?: string
  style?: React.CSSProperties
  chainId?: ChainId
  tokenUrl?: string
}) {
  const { chainId: initialChainId } = useWeb3()
  const uriLocations = useHttpLocations(currency instanceof WrappedTokenInfo ? currency.logoURI : undefined)
  const list = useSelectedSwapTokenList()

  const srcs: string[] = useMemo(() => {
    if (!currency) return []

    if (currency.isNative) return []

    if (initialChainId && providedChainId && currency.isToken) {
      if (list?.[providedChainId]?.[currency.address]) {
        const {
          tokenInfo: { logoURI },
        } = list?.[providedChainId]?.[currency.address]

        return logoURI ? [logoURI] : []
      }
    }
    if (currency instanceof Token) {
      if (currency instanceof WrappedTokenInfo) {
        return [...uriLocations, ...getTokenLogoURLs(currency.address)]
      }

      if (list?.[initialChainId]?.[currency.address]) {
        const {
          tokenInfo: { logoURI },
        } = list?.[initialChainId]?.[currency.address]

        return logoURI ? [logoURI] : []
      }
    }
    return []
  }, [currency, initialChainId, providedChainId, list, uriLocations])

  if (tokenUrl) {
    return <StyledEthereumLogo src={tokenUrl} size={'24px'} style={style} />
  }

  if ((currency as any)?.address === VOLT?.address) {
    return <StyledEthereumLogo src={voltSVG} size={size} style={style} />
  }

  if (currency?.equals(FUSE)) {
    return <StyledEthereumLogo src={FuseLogo} size={size} style={style} />
  }

  // For SPARK
  if (currency?.equals(wFUSE)) {
    return (
      <StyledLogo
        srcs={[`${VOLTAGE_FINANCE_LOGOS_URL}/0x0BE9e53fd7EDaC9F859882AfdDa116645287C629/logo.png`]}
        size={size}
        style={style}
      />
    )
  }

  if (currency?.equals(BNB)) {
    return <StyledEthereumLogo src={BnbLogo} size={size} style={style} />
  }

  if (currency?.equals(ETH)) {
    return <StyledEthereumLogo src={EthLogo} size={size} style={style} />
  }

  return <StyledLogo size={size} srcs={srcs} alt={`${currency?.symbol ?? 'token'} logo`} style={style} />
}
