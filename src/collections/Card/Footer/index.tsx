import { Box } from 'rebass/styled-components'

const CardFooter = ({ children }: { children: any }) => {
  return (
    <>
      <Box py={3}>
        <Box opacity={0.3} variant={'border'}></Box>
      </Box>
      <Box px={3}>{children} </Box>
    </>
  )
}

CardFooter.displayName = 'CardFooter'

export default CardFooter
