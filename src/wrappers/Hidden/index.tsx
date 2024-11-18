import { Box } from 'rebass/styled-components'

export const Hidden = ({
  mobile,
  tablet,
  desktop,
  width,
  children,
  sx = {},
}: {
  mobile?: boolean
  tablet?: boolean
  desktop?: boolean
  width?: string | number | Array<string> | Array<number>
  children: any
  sx?: any
}) => {
  return (
    <Box
    sx={sx}
    width={width}
      display={[!mobile ? 'block' : 'none', !tablet ? 'block' : 'none', !desktop ? 'block' : 'none']}
    >
      {children}
    </Box>
  )
}
