import { Check, ChevronDown } from 'react-feather'
import { useEffect, useRef, useState } from 'react'
import { Flex, Text, Card, Box } from 'rebass/styled-components'

import { Views } from '..'
import { preset } from '../../../../theme/preset'
import { useOnClickOutside } from '../../../../hooks/useOnClickOutside'

const CurrencyItem = ({ active = false, text, onClick }: any) => {
  return (
    <Flex
      sx={{
        cursor: 'pointer',
        ':hover': {
          bg: 'gray70',
          borderRadius: 'default',
          transition: 'background 150ms ease-in-out',
        },
      }}
      px={2}
      py={2}
      alignItems={'center'}
      justifyContent={'space-between'}
      onClick={onClick}
    >
      <Text fontSize={['8px', '10px', '14px']} fontWeight={600}>
        {text}
      </Text>

      {active && <Check size={18} />}
    </Flex>
  )
}

export const CurrencyDropdown = ({ setView, view, token0, token1 }: any) => {
  const [open, setOpen] = useState(false)
  const [text, setText] = useState(token0?.symbol + ' / ' + 'USD')

  const ref = useRef()

  useEffect(() => {
    if (view === Views.USD) {
      setText(token0?.symbol + ' / ' + 'USD')
    } else {
      setText(token0?.symbol + ' / ' + token1?.symbol)
    }
  }, [token0, token1])

  useOnClickOutside(ref, () => {
    setOpen(false)
  })

  return (
    <Box ref={ref} sx={{ position: 'relative' }}>
      <Flex
        px={2}
        alignItems={'center'}
        height={['15.25px', '28.07px']}
        bg="gray70"
        onClick={() => {
          setOpen(!open)
        }}
        fontWeight={500}
        sx={{ gap: 1, cursor: 'pointer', borderRadius: 'rounded', position: 'relative' }}
      >
        <Text fontSize={['8px', '10px', '14px']}>{text}</Text>

        <ChevronDown size={20} strokeWidth={1} />
      </Flex>

      <Card
        px={2}
        py={2}
        bg={'white'}
        minWidth={['200px', '250px']}
        sx={{
          position: 'absolute',
          opacity: open ? 1 : 0,
          pointerEvents: open ? 'all' : 'none',
          transition: 'opacity 150ms ease-in-out',
          zIndex: 20,
          left: 0,
          top: 38,
          border: '1px solid ' + preset.colors.gray70,
        }}
      >
        <Text px={1} pt={1} pb={3} color={'blk70'} fontSize={1} fontWeight={500}>
          Market View
        </Text>

        <Flex fontSize={2} sx={{ gap: 2 }} flexDirection={'column'}>
          <CurrencyItem
            onClick={() => {
              setText(token0?.symbol + ' / ' + 'USD')
              setView(Views.USD)
            }}
            active={view === Views.USD}
            text={token0?.symbol + ' / ' + 'USD'}
          />

          {token1 && (
            <CurrencyItem
              active={text === token0?.symbol + ' / ' + token1?.symbol}
              onClick={() => {
                setText(token0?.symbol + ' / ' + token1?.symbol)

                setView(Views.RATE)
              }}
              text={token0?.symbol + ' / ' + token1?.symbol}
            />
          )}
        </Flex>
      </Card>
    </Box>
  )
}
