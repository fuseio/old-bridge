import { useEffect, useRef } from 'react'
import './index.css'
import { Hidden } from '../Hidden'
import { Button, Flex } from 'rebass/styled-components'
import { Minus, Plus } from 'react-feather'

interface SlideBarProps {
  id: string
  name: string
  min: number
  max: number
  value: number
  defaultValue: number
  onChange: any
  height?: number | string
}

export default function SliderBar({ min, max, value, defaultValue, height = 20, id, name, onChange }: SlideBarProps) {
  const inputRef = useRef<HTMLInputElement | null>(null)

  useEffect(() => {
    if (inputRef && inputRef.current) {
      const setSlider = (event: Event) => {
        const element: any = event.target
        const min = element.min
        const max = element.max
        const val = ((element.value - min) * 100) / (max - min)
        const fillLeft = '#76F80A'
        const fillRight = '#4B4D58'
        element.style.background = `linear-gradient(to right, ${fillLeft} ${val}%, ${fillRight} ${val}%`
      }

      inputRef.current.addEventListener('input', setSlider, false)

      return () => {
        inputRef.current?.removeEventListener('input', setSlider, false)
      }
    }
  }, [])

  return (
    <>
      <Hidden desktop tablet>
        <Flex sx={{ gap: 2 }} alignItems={'center'}>
          <Button
            onClick={() => {
              if (value > 1) {
                onChange(value - 1)
              }
            }}
            bg="gray"
            variant={'tertiary'}
          >
            <Flex>
              <Minus />
            </Flex>
          </Button>

          <Button
            onClick={() => {
              if (value < max) {
                onChange(value + 1)
              }
            }}
            bg="gray"
            variant={'tertiary'}
          >
            <Flex>
              <Plus />
            </Flex>
          </Button>
        </Flex>
      </Hidden>

      <Hidden width="100%" mobile>
        <input
          ref={inputRef}
          type="range"
          style={{
            width: '100%',
            cursor: 'pointer',
          }}
          onChange={(e) => {
            onChange(parseInt(e?.target.value))
          }}
          width={'100%'}
          value={value}
          height={height}
          min={min}
          max={max}
          id={id}
          name={name}
          defaultValue={defaultValue}
          className="slider"
        />
      </Hidden>
    </>
  )
}
