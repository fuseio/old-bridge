import { Box, Text } from 'rebass/styled-components'

interface BadgeProps {
  text: string
}

export default function Badge({ text }: BadgeProps) {
  return (
    <Box backgroundColor="gray70" padding="8px 16px" style={{ borderRadius: '24px' }}>
      <Text fontSize="14px" color="blk70" fontWeight={500}>
        {text}
      </Text>
    </Box>
  )
}
