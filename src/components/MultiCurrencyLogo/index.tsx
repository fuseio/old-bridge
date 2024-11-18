import { useMemo } from 'react'
import styled from 'styled-components'
import { ChainId } from '@voltage-finance/sdk-core'

import Logo from '../Logo'
import { xVOLT } from '../../constants'
import { FUSE } from '../../data/Currency'
import { getAddress } from 'ethers/lib/utils'
import { VEVOLT } from '../../constants/addresses'
import { WRAPPED_NATIVE_CURRENCY } from '../../constants/token'
import { VOLTAGE_FINANCE_LOGOS_URL } from '../../constants/lists'
import { useSelectedSwapTokenList } from '../../state/lists/hooks'

import xVOLTSVG from '../../assets/svg/xVOLT.svg'
import VeVoltSvg from '../../assets/svg/vevolt-icon.svg'
import FuseLogo from '../../assets/svg/logos/fuse-small-logo.svg'

const getTokenLogoURLs = (address: string) => {
  if (address === VEVOLT[122].address) {
    return [VeVoltSvg]
  }
  if (address === xVOLT.address) {
    return [xVOLTSVG]
  }
  return [
    `https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/${address}/logo.png`,
    `${VOLTAGE_FINANCE_LOGOS_URL}/${address}/logo.png`,
  ]
}

const StyledLogo = styled(Logo)<{ size: string | number; zindex?: number; left?: number; position?: string }>`
  width: ${({ size }) => size}px;
  height: ${({ size }) => size}px;
  border-radius: ${({ size }) => size}px;
  ${({ position }) => position && `position: ${position};`}
  ${({ zindex }) => typeof zindex === 'number' && `z-index: ${zindex};`}
  ${({ left }) => left && `left: ${left}px;`}
`

const Wrapper = styled.div<{ margin: boolean; sizeraw: number }>`
  position: relative;
  display: flex;
  flex-direction: row;
  margin-right: ${({ sizeraw, margin }) => margin && (sizeraw / 3 + 8).toString() + 'px'};
`

interface MultiCurrencyLogoProps {
  tokenAddresses: Array<string>
  size?: string | number
}

export default function MultiCurrencyLogo({ tokenAddresses, size = '36' }: MultiCurrencyLogoProps) {
  const list = useSelectedSwapTokenList()
  const checksummedAddresses = useMemo(() => {
    if (!tokenAddresses) return []

    return tokenAddresses.filter(Boolean).map((address) => {
      try {
        if (address === 'FUSE') return 'FUSE'
        return address === FUSE.symbol ? WRAPPED_NATIVE_CURRENCY[ChainId.FUSE].address : getAddress(address)
      } catch (error) {
        console.log(error)
        return ''
      }
    })
  }, [tokenAddresses])

  const tokenSrcs: Array<any> = useMemo(() => {
    return checksummedAddresses.map((address) => {
      if (address === 'FUSE') return ['FUSE']
      if (list[ChainId.FUSE][address]) {
        const {
          tokenInfo: { logoURI },
        } = list[ChainId.FUSE][address]
        return logoURI ? [logoURI] : []
      }

      return [...getTokenLogoURLs(address)]
    })
  }, [checksummedAddresses, list])

  return tokenSrcs.length > 1 ? (
    <Wrapper sizeraw={Number(size)} margin>
      {tokenSrcs.map((src, index) => {
        return (
          <StyledLogo
            key={index}
            size={size}
            position={index > 0 ? 'absolute' : undefined}
            srcs={src[0] === 'FUSE' ? [FuseLogo] : src}
            zindex={tokenSrcs.length - index}
            left={(Number(size) / 1.45) * index}
          />
        )
      })}
    </Wrapper>
  ) : (
    <StyledLogo size={size} srcs={tokenSrcs[0]} />
  )
}
