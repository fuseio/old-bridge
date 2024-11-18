import { Box, Image } from 'rebass/styled-components'
import styled, { keyframes } from 'styled-components'

import flash from '../../assets/images/flash.svg'

const pulse = keyframes`
  0% { 
    transform: scale(0.95);	
    opacity:0.2	
  }
  12.5% {
    opacity:0.3	
  }
  25% {
    opacity:0.4
  }
  37.5% {
    opacity:0.5
  }
  50% {
    opacity:0.6
    transform: scale(1);
  }
  62.5% {
    opacity:0.7
  }
  75% { 
    opacity:0.8	
  }
  87.5% {
    opacity:0.9
  }
  100% { 
    transform: scale(0.95);	
    opacity:1
  }
`

const AnimatedImg = styled.div.attrs((props) => ({
  style: props.style,
}))`
  animation: ${pulse} 1s linear infinite;
  animation-direction: alternate;
`

export function AnimatedLoader({ style = {}, width = '90px' }: any) {
  return (
    <AnimatedImg style={style}>
      <Image width={width} src={flash} />
    </AnimatedImg>
  )
}

export default function Loader({
  width = '90px',
  sx = { position: 'absolute', right: '0', textAlign: 'center', left: '0', top: '35%' },
}: any) {
  return (
    <Box height={'100%'} sx={sx} width={'fit-content'} m="auto">
      <AnimatedImg>
        <Image width={width} src={flash} />
      </AnimatedImg>
    </Box>
  )
}
