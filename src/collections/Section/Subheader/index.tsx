import { Text, Flex } from 'rebass/styled-components'

const SectionSubHeader = ({ align = 'center', children }: { align?: any; children: any }) => {
  return (
    <>
      <Flex justifyContent={'center'}>
        <Text
          sx={{ zIndex: 2 }}
          lineHeight={1.4}
          width={align !== 'center' ? 1 : [1, 8 / 16]}
          pt={3}
          textAlign={align}
          fontSize={[3]}
        >
          {children}
        </Text>
      </Flex>
    </>
  )
}

SectionSubHeader.displayName = 'SectionSubHeader'

export default SectionSubHeader
