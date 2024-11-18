import { Box } from 'rebass/styled-components'

const LoaderIcon = ({
  size = 16,
  margin,
  color = 'error',
}: {
  size: number
  margin?: string | number
  color: string
}) => {
  return (
    <Box
      margin={margin}
      backgroundColor={color}
      style={{ height: size + 'px', width: size + 'px', borderRadius: '999999px' }}
    ></Box>
  )
}
export default LoaderIcon
