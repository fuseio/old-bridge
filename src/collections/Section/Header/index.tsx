import { Text, Flex } from 'rebass/styled-components'

const SectionHeader = ({
  fontSize = [42, 48],
  width = [1, 11 / 16],
  align = 'center',
  children,
}: {
  width?: any
  fontSize?: any
  align?: any
  children: any
}) => {
  return (
    <>
      <Flex justifyContent={'center'}>
        <Text
          lineHeight={1.2}
          sx={{ zIndex: 2 }}
          width={width}
          textAlign={align}
          fontSize={fontSize}
          fontWeight={700}
        >
          {children}
        </Text>
      </Flex>
    </>
  )
}

SectionHeader.displayName = 'SectionHeader'

export default SectionHeader
