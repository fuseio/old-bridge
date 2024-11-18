import { Text } from 'rebass/styled-components'

const PageHeader = ({ fontSize = '60px', children }: { fontSize?: any; children: any }) => {
  return (
    <Text lineHeight={1.2} sx={{ zIndex: 2 }} fontSize={fontSize} fontWeight={700}>
      {children}
    </Text>
  )
}

PageHeader.displayName = 'PageHeaderPageHeader'

export default PageHeader
