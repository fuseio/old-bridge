import { Box } from 'rebass/styled-components'
import { ZoomTransform, scaleLinear, extent } from 'd3'
import { useEffect, useMemo, useRef, useState } from 'react'

import { Area } from './Area'
import { Line } from './Line'
import { Brush } from './Brush'
import { AxisBottom } from './AxisBottom'
import Zoom, { ZoomOverlay } from './Zoom'
import { Bound } from '../../../../../state/mint/v3/actions'

const xAccessor = (d: any) => d.price0
const yAccessor = (d: any) => d.activeLiquidity

function partition(array, predicate) {
  const pass = []
  const fail = []

  array.forEach((item) => {
    if (predicate(item)) {
      pass.push(item)
    } else {
      fail.push(item)
    }
  })

  return [pass, fail]
}

export default function Chart({
  data: { series, current },
  ticksAtLimit,
  margins,
  interactive = true,
  brushDomain,
  brushLabels,
  onBrushDomainChange,
  zoomLevels,
}: any) {
  const width = 650
  const height = 150
  const id = 'liquidityChartRangeInput'
  const zoomRef = useRef<any | null>(null)
  const [zoomRefState, setZoomRefState] = useState<any | null>(null)

  const [zoom, setZoom] = useState<ZoomTransform | null>(null)

  const [innerHeight, innerWidth] = useMemo(
    () => [height - margins.top - margins.bottom, width - margins.left - margins.right],
    [width, height, margins]
  )

  const { xScale, yScale } = useMemo(() => {
    const [minY, maxY] = extent(series, yAccessor)
    const formattedMinY = Number(minY)
    const formattedMaxY = Number(maxY)

    const padding = (formattedMaxY - formattedMinY) * 0.1

    const scales = {
      xScale: scaleLinear()
        .domain([current * zoomLevels.initialMin, current * zoomLevels.initialMax])
        .range([0, innerWidth]),

      yScale: scaleLinear()
        .domain([formattedMinY - padding, formattedMaxY + padding])
        .range([innerHeight, 0]),
    }

    if (zoom) {
      const newXscale = zoom.rescaleX(scales.xScale)
      scales.xScale.domain(newXscale.domain())
    }

    return scales
  }, [current, zoomLevels.initialMin, zoomLevels.initialMax, innerWidth, series, innerHeight, zoom])

  const [leftSeries, rightSeries] = useMemo(() => {
    const isHighToLow = series[0]?.price0 > series[series.length - 1]?.price0
    let [left, right] = partition(series, (d) => (isHighToLow ? +xAccessor(d) < current : +xAccessor(d) > current))

    if (right.length && right[right.length - 1]) {
      if (right[right.length - 1].price0 !== current) {
        right = [...right, { activeLiquidity: right[right.length - 1].activeLiquidity, price0: current }]
      }
      left = [{ activeLiquidity: right[right.length - 1].activeLiquidity, price0: current }, ...left]
    }

    return [left, right]
  }, [current, series])

  const defs = (
    <defs>
      <linearGradient id="green-gradient" x1="0" y1="0" x2="0" y2="0">
        <stop stopColor="#B9EC87" />
      </linearGradient>
      <linearGradient id="red-gradient" x1="0" y1="0" x2="0" y2="0">
        <stop stopColor="#F3C4B0" />
      </linearGradient>

      <clipPath id={`${id}-chart-clip`}>
        <rect x="0" y="0" width={innerWidth} height={height} />
      </clipPath>

      <clipPath id="clip-rounded-corners">
        <rect x="0" y="0" width={width - 3} height={height - 30} rx="10" ry="10" />
      </clipPath>
    </defs>
  )

  const groups = (
    <g transform={`translate(${margins.left},${margins.top})`}>
      <ZoomOverlay width={innerWidth} height={height} ref={zoomRef} />
      <g clipPath={`url(#${id}-chart-clip)`}>
        <rect
          x="0"
          y="0"
          rx="10"
          ry="10"
          fill="none"
          width="100%"
          height="80%"
          strokeWidth="1"
          stroke="rgba(0, 0, 0, 0.2)"
          clipPath="url(#clip-rounded-corners)"
        />
        <g clipPath="url(#clip-rounded-corners)">
          <Area
            series={rightSeries}
            xScale={xScale}
            yScale={yScale}
            xValue={xAccessor}
            yValue={yAccessor}
            fill="url(#green-gradient)"
            height={height}
          />
        </g>
        <g clipPath="url(#clip-rounded-corners)">
          <Area
            series={leftSeries}
            xScale={xScale}
            yScale={yScale}
            xValue={xAccessor}
            yValue={yAccessor}
            fill="url(#red-gradient)"
            height={height}
          />
        </g>
        <Line value={current} xScale={xScale} innerHeight={innerHeight} />
        <AxisBottom xScale={xScale} innerHeight={innerHeight} />
      </g>

      <Brush
        id={id}
        xScale={xScale}
        interactive={interactive}
        brushLabelValue={brushLabels}
        brushExtent={brushDomain ?? (xScale.domain() as [number, number])}
        innerWidth={innerWidth}
        innerHeight={height - 30}
        setBrushExtent={onBrushDomainChange}
        westHandleColor={'#333333'}
        eastHandleColor={'#333333'}
      />
    </g>
  )

  useEffect(() => {
    // reset zoom as necessary
    setZoom(null)
  }, [zoomLevels])

  useEffect(() => {
    setZoomRefState(zoomRef.current)
  }, [zoomRef])

  return (
    <Box sx={{ position: 'relative', width: '100%', height: '100%' }}>
      <Zoom
        svgRef={zoomRefState}
        xScale={xScale}
        setZoom={setZoom}
        width={innerWidth}
        height={innerHeight} // allow zooming inside the x-axis
        showResetButton={Boolean(ticksAtLimit[Bound.LOWER] || ticksAtLimit[Bound.UPPER])}
        zoomLevels={zoomLevels}
      />

      <svg width="100%" height="100%" viewBox={`0 0 ${width - 3} ${height}`} style={{ overflow: 'visible' }}>
        {defs}
        {groups}
      </svg>
    </Box>
  )
}
