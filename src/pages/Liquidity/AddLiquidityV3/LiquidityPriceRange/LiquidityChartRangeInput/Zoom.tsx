import { ScaleLinear, select, zoom, ZoomBehavior, zoomIdentity, ZoomTransform } from 'd3'
import React, { useEffect, useMemo, useRef } from 'react'
import { RefreshCcw, ZoomIn, ZoomOut } from 'react-feather'
import { Button } from 'rebass'
import styled from 'styled-components'

const Wrapper = styled.div<{ count: number }>`
  display: grid;
  grid-template-columns: repeat(${({ count }) => count.toString()}, 1fr);
  grid-gap: 6px;

  position: absolute;
  top: 8px;
  right: 32px;
`

const CustomButton = styled(Button)`
  &:hover {
    background-color: transparent;
    color: ${({ theme }) => theme.neutral1};
  }
  background-color: transparent;

  width: 32px;
  height: 32px;
  padding: 4px;
`

export const ZoomOverlay = styled.rect`
  fill: transparent;
  cursor: pointer;

  &:active {
    cursor: pointerd;
  }
`

export default function Zoom({
  svgRef,
  xScale,
  setZoom,
  width,
  height,
  showResetButton,
  zoomLevels,
}: {
  svgRef: SVGElement | null | any
  xScale: ScaleLinear<number, number>
  setZoom: (transform: ZoomTransform) => void
  width: number
  height: number
  showResetButton: boolean
  zoomLevels: any
}) {
  const svg = svgRef
  const zoomBehavior = useRef<ZoomBehavior<Element, unknown>>()

  const [zoomIn, zoomOut, zoomInitial, zoomReset] = useMemo(
    () => [
      () =>
        svg &&
        zoomBehavior.current &&
        select(svg as Element)
          .transition()
          .call(zoomBehavior.current.scaleBy, 2),
      () =>
        svg &&
        zoomBehavior.current &&
        select(svg as Element)
          .transition()
          .call(zoomBehavior.current.scaleBy, 0.5),
      () =>
        svg &&
        zoomBehavior.current &&
        select(svg as Element)
          .transition()
          .call(zoomBehavior.current.scaleTo, 0.5),
      () =>
        svg &&
        zoomBehavior.current &&
        select(svg as Element)
          .call(zoomBehavior.current.transform, zoomIdentity.translate(0, 0).scale(1))
          .transition()
          .call(zoomBehavior.current.scaleTo, 0.5),
    ],
    [svg]
  )

  useEffect(() => {
    if (!svg) return

    zoomBehavior.current = zoom()
      .scaleExtent([zoomLevels.min, zoomLevels.max])
      .extent([
        [0, 0],
        [width, height],
      ])
      .on('zoom', ({ transform }: { transform: ZoomTransform }) => setZoom(transform))

    select(svg as Element).call(zoomBehavior.current)
  }, [height, width, setZoom, svg, xScale, zoomBehavior, zoomLevels, zoomLevels.max, zoomLevels.min])

  useEffect(() => {
    // reset zoom to initial on zoomLevel change
    zoomInitial()
  }, [zoomInitial, zoomLevels])

  return (
    <Wrapper count={showResetButton ? 3 : 2}>
      {showResetButton && (
        <CustomButton
          onClick={() => {
            zoomReset()
          }}
          disabled={false}
        >
          <RefreshCcw size={16} />
        </CustomButton>
      )}
      <CustomButton onClick={zoomIn} disabled={false}>
        <ZoomIn size={16} />
      </CustomButton>
      <CustomButton onClick={zoomOut} disabled={false}>
        <ZoomOut size={16} />
      </CustomButton>
    </Wrapper>
  )
}
