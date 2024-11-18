import { Flex, Text } from 'rebass/styled-components'
import { ClickableCard } from '../../wrappers/ClickableCard'

export default function TextButton({
  header,
  text,
  active,
  onClick,
  outline = true,
  disabled = false,
}: {
  header?: string
  text: string
  active?: boolean
  onClick?: () => void
  outline?: boolean
  disabled?: boolean
}) {
  return (
    <ClickableCard
      width="100%"
      variant={outline && 'outline'}
      disabled={disabled}
      active={active || false}
      onClick={onClick}
    >
      <Flex flexDirection={'column'}>
        {header && <Text fontSize={1}>{header}</Text>}
        <Text fontSize={2} fontWeight={700}>
          {text}
        </Text>
      </Flex>
    </ClickableCard>
  )
}
