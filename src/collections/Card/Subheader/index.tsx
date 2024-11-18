import { Text, TextProps } from 'rebass/styled-components'

interface CardHeaderProps extends TextProps {
  color?: string
  width?: any
  pt?: any
  children: React.ReactNode
}

const CardSubHeader = ({ color = 'secondary', width = [1, 11 / 16], children, pt = 3, ...props }: CardHeaderProps) => {
  return (
    <Text lineHeight={1.4} fontSize={2} {...props} fontWeight={500} width={width} color={color} pt={pt}>
      {children}
    </Text>
  )
}

CardSubHeader.displayName = 'CardSubHeader'

export default CardSubHeader
