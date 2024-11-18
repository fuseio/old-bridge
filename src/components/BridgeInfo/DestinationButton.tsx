import { Logo } from './styleds'
import styled from 'styled-components'

import { ButtonSwitch } from '../Button'
import { BridgeDirection } from '../../state/bridge/actions'

const LogoContainer = styled.div`
  display: flex;
  gap: 8px;
  align-items: center;
  width: fit-content;
  margin: 0 auto;
`

export default function DestinationButton({
  text,
  logoSrc,
  selectedBridgeDirection,
  handleClick,
  bridgeDirection,
}: {
  text: string
  logoSrc: string
  margin?: string
  selectedBridgeDirection?: BridgeDirection
  handleClick?: (...args: any[]) => void
  bridgeDirection?: BridgeDirection
}) {
  return (
    <ButtonSwitch
      active={bridgeDirection === selectedBridgeDirection}
      onClick={() => handleClick && handleClick(bridgeDirection)}
    >
      <LogoContainer>
        <Logo src={logoSrc} width={32} /> <span>{text}</span>
      </LogoContainer>
    </ButtonSwitch>
  )
}
