import { Flex, Text } from 'rebass/styled-components'

const CardText = ({ title, content }: { title?: string; content?: string | number }) => {
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

CardText.displayName = 'CardText'
export default CardText
