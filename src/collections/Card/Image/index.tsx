import { Image, ImageProps } from 'rebass/styled-components'

interface CardImageProps extends ImageProps {
  src: string
}

const CardImage = ({ src, ...props }: CardImageProps) => {
  return <Image {...props} src={src} />
}

CardImage.displayName = 'CardImage'

export default CardImage
