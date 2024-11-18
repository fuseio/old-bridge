import { Box } from 'rebass/styled-components'

const PageBody = ({ children }: { children: any }) => {
  return (
    <Box pt={40} width={'100%'}>
      {children}
    </Box>
  )
}

PageBody.displayName = 'SectionBody'

export default PageBody
