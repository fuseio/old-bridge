import { Flex, Text } from 'rebass/styled-components'

const ModalText = ({ title, content }: { title?: string; content?: string | number }) => {
  return (
    <Flex alignItems={'center'} justifyContent={'space-between'}>
      <Text opacity={0.7} fontSize={1}>
        {title}
      </Text>
      <Text fontWeight={500} fontSize={1}>
        {content}
      </Text>
    </Flex>
  )
}

ModalText.displayName = 'ModalText'
export default ModalText
