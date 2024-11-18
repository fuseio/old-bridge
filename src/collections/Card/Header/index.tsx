import { Text, TextProps } from 'rebass/styled-components'

interface CardHeaderProps extends TextProps {
  color?: string
  children: React.ReactNode
}

const CardHeader = ({ color = 'secondary', children, ...props }: CardHeaderProps) => {
  return (
    <Text fontSize={28} lineHeight={1.2} color={color} {...props} fontWeight={700}>
      {children}
    </Text>
  )
}

CardHeader.displayName = 'CardHeader'

export default CardHeader
