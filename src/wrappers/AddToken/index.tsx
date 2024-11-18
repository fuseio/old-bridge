import { Token } from '@voltage-finance/sdk-core'
import { useWeb3 } from '../../hooks'
import { Flex, Text } from 'rebass/styled-components'
import { addTokenToWallet } from '../../utils'
import { ChevronRight } from 'react-feather'

export const AddToken = ({ pt = 2, fontSize = 1, token }: { pt?: number; fontSize?: number; token: Token }) => {
  const { library } = useWeb3()

  return (
    library &&
    token && (
      <Flex pt={pt} alignItems={'center'}>
        <Text fontSize={fontSize} color="white" onClick={() => addTokenToWallet(token, library)}>
          Add {token.symbol} to Wallet
        </Text>
        <ChevronRight color="white" style={{ marginTop: '2px' }} size={16} />
      </Flex>
    )
  )
}
