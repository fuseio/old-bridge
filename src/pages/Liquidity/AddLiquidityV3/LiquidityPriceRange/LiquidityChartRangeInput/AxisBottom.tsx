import { Axis as d3Axis, axisBottom, NumberValue, ScaleLinear, select } from 'd3'
import React, { useMemo } from 'react'
import styled from 'styled-components'

// TODO: add volt colors
const StyledGroup = styled.g`
  line {
    display: none;
  }

  text {
    font-size: 12px;
    transform: translateY(5px);
  }
`

const Axis = ({ axisGenerator }: { axisGenerator: d3Axis<NumberValue> }) => {
  const axisRef = (axis: SVGGElement) => {
    axis &&
      select(axis)
        .call(axisGenerator)
        .call((g) => g.select('.domain').remove())
  }

  return <g ref={axisRef} />
}

export const AxisBottom = ({
  xScale,
  innerHeight,
  offset = 0,
}: {
  xScale: ScaleLinear<number, number>
  innerHeight: number
  offset?: number
}) =>
  useMemo(() => {
    return (
      <StyledGroup transform={`translate(0, ${innerHeight + offset})`}>
        <Axis axisGenerator={axisBottom(xScale).ticks(5)} />
      </StyledGroup>
    )
  }, [innerHeight, offset, xScale])
