import { useMemo } from 'react'
import styled from 'styled-components'
import { area, curveStepAfter, ScaleLinear } from 'd3'

interface AreaProps {
  series: any[]
  xScale: ScaleLinear<number, number>
  yScale: ScaleLinear<number, number>
  xValue: (d: any) => number
  yValue: (d: any) => number
  fill: string
  height: number
}

const Path = styled.path<{ fill?: string }>`
  opacity: 1;
`

const MAX_VALUE = 1e20

export const Area = ({ series, xScale, yScale, xValue, yValue, fill, height }: AreaProps) => {
  const d =
    area()
      .curve(curveStepAfter)
      .x((d: unknown) => xScale(xValue(d as any)))
      .y1((d: unknown) => yScale(yValue(d as any)))
      .y0(height)(
      series.filter((d) => {
        const value = xScale(xValue(d))
        return value <= MAX_VALUE
      }) as Iterable<[number, number]>
    ) ?? undefined

  return useMemo(() => <Path d={d} fill={fill} />, [d, fill])
}
