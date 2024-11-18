import { Card, Flex, Text } from 'rebass/styled-components'
import { TYPE } from '../../theme'
import { TextLoader } from '../../wrappers/TextLoader'

type CardProps = {
  title: string
  value: string
  valueDecimals?: number
  loading?: boolean
}

export default function CardElement({ title, value, loading = true }: CardProps) {
  return (
    <Flex flexGrow={1} height="fit-content" width={'100%'} flexDirection={'column'} alignItems={'flex-start'}>
      <Card minHeight={90} height={'100%'} width={'100%'}>
        <TYPE.main>{title}</TYPE.main>
        <TextLoader loading={loading}>
          <Text fontSize={loading ? 3 : 4} fontWeight={600}>
            {value || '0.00'}
          </Text>
        </TextLoader>
      </Card>
    </Flex>
  )
}
