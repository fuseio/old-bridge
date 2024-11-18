import { ChevronRight } from 'react-feather'
import { Flex, Text } from 'rebass/styled-components'

export const ChevronLink = ({ onClick, text }: { onClick: () => void; text: string }) => {
  return (
    <Flex ml="auto" width={'fit-content'} alignItems={'center'}>
      <Text fontWeight={500} style={{ cursor: 'pointer' }} onClick={onClick} textAlign={'right'} fontSize={1}>
        {text}
      </Text>
      <ChevronRight size={16} />
    </Flex>
  )
}
