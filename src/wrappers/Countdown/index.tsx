import { Box, Flex } from 'rebass/styled-components'
import { useCountdown } from '../../hooks/useCountdown'

const BORDER_RADIUS = 6

export const Countdown = ({ timestamp }: { prefix?: string; timestamp: number }) => {
  const countdown = useCountdown(timestamp)
  return (
    <Flex sx={{ gap: 2 }} fontSize={1} fontWeight={600}>
      <Box
        sx={{ borderRadius: BORDER_RADIUS }}
        textAlign={'center'}
        bg="gray70"
        py={2}
        minWidth={42}
      >{`${countdown.days}D`}</Box>
      <Box
        sx={{ borderRadius: BORDER_RADIUS }}
        textAlign={'center'}
        bg="gray70"
        minWidth={42}
        py={2}
      >{`${countdown.hours}H`}</Box>
      <Box
        sx={{ borderRadius: BORDER_RADIUS }}
        textAlign={'center'}
        bg="gray70"
        minWidth={42}
        py={2}
      >{`${countdown.minutes}M`}</Box>
      <Box
        sx={{ borderRadius: BORDER_RADIUS }}
        textAlign={'center'}
        bg="gray70"
        minWidth={42}
        py={2}
      >{`${countdown.seconds}S`}</Box>
    </Flex>
  )
}
