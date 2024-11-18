import { Flex, Text } from 'rebass/styled-components'
import { BalanceLoader } from '../../BalanceLoader'
import { formatSignificant } from '../../../utils'

const Balance = ({
  title,
  balance,
  asDefaultSelect,
}: {
  title: string
  balance: any
  selectedCurrency?: any
  asDefaultSelect?: boolean
}) => {
  const formattedBalance = parseFloat(balance?.toExact())
  return (
    <Flex pb={1} fontSize={0} fontWeight={600} justifyContent={'space-between'}>
      {title && <Text color={'blk50'}>{title}</Text>}

      {!asDefaultSelect && (
        <BalanceLoader>
          <Text color={'blk50'} fontWeight={500}>
            Balance: {formatSignificant({ value: formattedBalance, maxLength: 6 })}
          </Text>
        </BalanceLoader>
      )}
    </Flex>
  )
}
export default Balance
