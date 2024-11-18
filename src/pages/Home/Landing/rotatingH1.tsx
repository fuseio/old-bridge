import { useEffect, useState, useRef } from 'react'
import { Box } from 'rebass/styled-components'

const ROTATING_WORDS = ['Payments', 'Savings', 'Investments']
const ANIMATION_DURATION = 2000

export default function RotatingH1() {
  const [currentWordIndex, setCurrentWordIndex] = useState(0)
  const ref = useRef<HTMLSpanElement>(null)
  const [width, setWidth] = useState(0)
  const [height, setHeight] = useState(0)

  useEffect(() => {
    setWidth((ref.current?.children[0] as HTMLElement)?.offsetWidth || 0)
    setHeight((ref.current?.children[0] as HTMLElement)?.offsetHeight || 0)

    const interval = setInterval(() => {
      setCurrentWordIndex((prevIndex) => {
        const nextIndex = (prevIndex + 1) % ROTATING_WORDS.length
        const offsetWidth = (ref.current?.children[nextIndex] as HTMLElement)?.offsetWidth || 0
        setWidth(offsetWidth)
        const offsetHeight = (ref.current?.children[nextIndex] as HTMLElement)?.offsetHeight || 0
        setHeight(offsetHeight)
        return nextIndex
      })
    }, ANIMATION_DURATION)

    return () => clearInterval(interval)
  }, [])

  return (
    <Box
      sx={{
        display: 'inline-block',
        position: 'relative',
        verticalAlign: 'bottom',
        boxSizing: 'content-box',
        transition: 'all 0.2s',
        width: width,
        height: height,
        overflow: 'hidden',
        padding: '0 10px'
      }}
      ref={ref}
      as="span"
    >
      {ROTATING_WORDS.map((word, index) => (
        <Box
          key={word}
          sx={{
            position: 'absolute',
            top: `${(index - currentWordIndex) * 100}%`,
            left: '50%',
            color: 'green500',
            transform: 'translate(-50%, 0)',
            transition: 'top 0.2s',
          }}
          as="span"
        >
          {word}
        </Box>
      ))}
    </Box>
  )
}
