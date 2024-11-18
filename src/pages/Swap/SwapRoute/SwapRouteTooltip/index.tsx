import { Card, Flex, Text } from 'rebass'

import ProtocolLogo from '../../../../components/Logo/ProtocolLogo'

interface SwapRouteTooltipProps {
  isVisible: boolean
  position: { top: number; left: number }
  sources: {
    name: string
    proportion: number
  }[]
}

const PROTOCOL_NAMES = {
  FStable: 'Fuse Stable',
  FStableV3: 'Fuse Stable V3',
  VoltDex: 'Volt Dex',
  MultiHop: 'MultiHop',
  VoltageV3: 'Voltage V3',
  Uniswap_V3: 'Voltage V3',
  VoltStableSwap: 'Volt Stable Swap'
}

const SwapRouteTooltip = ({ isVisible, position, sources }: SwapRouteTooltipProps) => {
  if (!isVisible) return null

  const formattedSources = sources.map((source) => {
    const name = PROTOCOL_NAMES[source.name] ?? source.name

    return (
      <Flex key={name} sx={{ alignItems: 'center', justifyContent: 'space-between', width: '100%', my: 1 }}>
        <Flex sx={{ alignItems: 'center' }}>
          <ProtocolLogo name={source.name} style={{ alignSelf: 'center', height: '100%' }} />
          <Text fontSize={1} ml={2}>
            {name}
          </Text>{' '}
        </Flex>
        <Text fontSize={1}>{(source.proportion * 100).toFixed(1)}%</Text> {/* Adjusted to show percentage */}
      </Flex>
    )
  })

  return (
    <Card
      sx={{
        p: 3,
        zIndex: 9999,
        bg: '#EDEDED',
        position: 'fixed',
        overflowY: 'auto',
        borderRadius: '10px',
        maxWidth: '246.64px',
        width: ['100%', '246.64px'],
        left: `${position.left - 80}px`,
        border: '1px solid #EDEDED',
        top: `${position.top - 10}px`,
        transform: 'translate(-50%, -100%)',
        boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.1)',
      }}
    >
      <Flex flexDirection={'column'} sx={{ alignItems: 'center' }}>
        <Text pb={2} opacity={0.7} fontSize={1} sx={{ alignSelf: 'flex-start' }}>
          Best Route
        </Text>
        {formattedSources}
      </Flex>
    </Card>
  )
}

export default SwapRouteTooltip
