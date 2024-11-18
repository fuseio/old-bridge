import { Box } from 'rebass/styled-components'

interface CardBodyProps {
  pt?: any
  py?: any
  mt?: any
  sx?: any
  height?
  children: any
}

const CardBody = ({ pt = 3, sx = {}, py = {}, mt = {}, height, children }: CardBodyProps) => {
  return (
    <Box width={'100%'} pt={pt} py={py} mt={mt} sx={sx} height={height}>
      {children}
    </Box>
  )
}

CardBody.displayName = 'CardBody'

export default CardBody
