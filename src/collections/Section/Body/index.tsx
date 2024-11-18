import { Box } from 'rebass/styled-components'

const SectionBody = ({ pt = 60, children }: { pt?: number; children: any }) => {
  return (
    <>
      <Box pt={pt} width={'100%'}>
        {children}
      </Box>
    </>
  )
}

SectionBody.displayName = 'SectionBody'

export default SectionBody
