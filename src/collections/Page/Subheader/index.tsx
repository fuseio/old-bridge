import { Text } from 'rebass/styled-components'

const PageSubHeader = ({ children }: { children: any }) => {
  return (
    <Text sx={{ zIndex: 2 }} lineHeight={1.4} pt={3} fontSize={'18px'}>
      {children}
    </Text>
  )
}

PageSubHeader.displayName = 'PageSubHeader'

export default PageSubHeader
