import Logo from '..'

import voltProtocol from '../../../assets/svg/protocols/volt.svg'
import fuseProtocol from '../../../assets/svg/protocols/fuse.svg'

interface ProtocolLogoProps {
  name: string
  size?: string
  style?: React.CSSProperties
}

const PROTOCOL_LOGOS = {
  FStable: fuseProtocol,
  FStableV3: fuseProtocol,
  VoltDex: voltProtocol,
  MultiHop: voltProtocol,
  VoltageV3: voltProtocol,
  Uniswap_V3: voltProtocol,
  VoltStableSwap: voltProtocol,
}

export default function ProtocolLogo({ name, style }: ProtocolLogoProps) {
  const logoSvg = PROTOCOL_LOGOS?.[name]

  const commonProps = {
    style: {
      boxShadow: '0px 6px 10px rgba(0, 0, 0, 0.075)',
      borderRadius: '24px',
      ...style,
    },
  }

  return <Logo srcs={[logoSvg]} alt={`${name} logo`} {...commonProps} />
}
