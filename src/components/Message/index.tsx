import { Box, Card, Text } from 'rebass/styled-components'

const Message = ({ header, body }: { header: any; body: string }) => {
  return (
    <Card>
      <Box textAlign={'center'}>
        <Text fontWeight={600} fontSize={3}>
          {header}
        </Text>
      </Box>
      <Box py={1}></Box>
      <Text fontSize={2}>{body}</Text>
    </Card>
  )
}
export default Message
