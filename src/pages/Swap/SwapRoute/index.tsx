import { useEffect, useRef, useState } from 'react'
import { Flex, Text } from 'rebass/styled-components'

import SwapRouteTooltip from './SwapRouteTooltip'
import ProtocolLogo from '../../../components/Logo/ProtocolLogo'

interface SwapRouteProps {
  sources: {
    name: string
    proportion: number
  }[]
}

export default function SwapRoute({ sources }: SwapRouteProps) {
  const [showTooltip, setShowTooltip] = useState(false)

  const flexRef = useRef(null) // Ref for the Flex container
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 })

  useEffect(() => {
    if (showTooltip && flexRef.current) {
      const rect = flexRef.current.getBoundingClientRect()
      setTooltipPosition({
        top: rect.top + window.scrollY,
        left: rect.left + rect.width / 2 + window.scrollX,
      })
    }
  }, [showTooltip])

  const sortedFilteredSources = sources
    .filter((trade) => trade.proportion > 0)
    .sort((a, b) => b.proportion - a.proportion)

  const protocolsPreview = (
    <Flex style={{ position: 'relative', height: '24px' }}>
      {sortedFilteredSources.map((source, index) => {
        const leftPosition = index * 12
        const zIndex = sortedFilteredSources.length - index

        return (
          <ProtocolLogo
            key={source.name}
            name={source.name}
            style={{
              position: 'absolute',
              left: `${leftPosition}px`,
              zIndex: zIndex,
              alignSelf: 'center',
              height: '100%',
            }}
          />
        )
      })}
    </Flex>
  )

  return (
    <>
      <SwapRouteTooltip isVisible={showTooltip} position={tooltipPosition} sources={sortedFilteredSources} />

      <Flex
        ref={flexRef}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        onClick={() => setShowTooltip(true)}
        width="100%"
        justifyContent="space-evenly"
        alignItems="center"
      >
        {protocolsPreview}
        <Text fontSize={1} style={{ alignSelf: 'center', marginLeft: `${sortedFilteredSources.length * 12 + 20}px` }}>
          {sortedFilteredSources.length} {sortedFilteredSources.length > 1 ? 'sources' : 'source'}
        </Text>
      </Flex>
    </>
  )
}
