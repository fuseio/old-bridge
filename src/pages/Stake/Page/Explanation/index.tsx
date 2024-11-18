import { Token } from '@voltage-finance/sdk-core'
import { Box, Card, Flex, Text } from 'rebass/styled-components'

interface ExplanationProps {
  addToken?: Token
  paragraphs: Array<string>
}

export const Explanation = ({ paragraphs = [] }: ExplanationProps) => {
  return (
    <Flex height={'100%'} alignItems={'stretch'} width={'100%'} style={{ gap: '8px' }}>
      <Card sx={{ position: 'relative' }} height="100%">
        <Flex flexDirection={'column'} height={'100%'}>
          <Text variant={'h4'}>Description</Text>
          {paragraphs.map((paragraph, index) => (
            <Box key={index}>
              <Text variant="p">{paragraph}</Text>
              {index !== paragraphs.length - 1 && <br></br>}
            </Box>
          ))}

          {/* {addToken && (
            <Flex pt={2} height={'auto'} mt="auto">
              <AddToken token={addToken} />
            </Flex>
          )} */}
        </Flex>
      </Card>
    </Flex>
  )
}
