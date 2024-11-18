import { Image } from 'rebass/styled-components'
import styled from 'styled-components'

const Icon = styled.a`
  text-decoration: none;
  transition: opacity 0.2s ease-in-out;
  &:hover {
    opacity: 0.7;
  }
`

const Social = ({ href, src, alt }: { href: string; src: string; alt: string }) => {
  return (
    <Icon
      href={href}
      target="_blank"
      rel="noreferrer"
    >
      <Image src={src} alt={alt}></Image>
    </Icon>
  )
}
export default Social
