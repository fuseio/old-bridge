import { Flex, Text } from 'rebass/styled-components'
import { BalanceLoader } from '../BalanceLoader'

const Balance = ({ balance }: { balance: string | number }) => {
  return (
    <Flex style={{ gap: '4px' }} alignItems="center" fontSize={1}>
      <Text fontWeight={600}>Balance:</Text>
      <BalanceLoader>
        <Text>{balance}</Text>
      </BalanceLoader>
    </Flex>
  )
}

export default Balance
