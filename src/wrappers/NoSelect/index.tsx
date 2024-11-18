import { Box } from 'rebass/styled-components'

const NoSelect = ({ width, children }: { width?: any; children: any }) => {
  return (
    <Box
      width={width}
      sx={{
        ' -webkit-touch-callout': 'none',
        ' -webkit-user-select': 'none',
        ' -khtml-user-select': 'none',
        '-moz-user-select': 'none',
        '-ms-user-select': 'none',
        'user-select': 'none',
      }}
    >
      {children}
    </Box>
  )
}
export default NoSelect
