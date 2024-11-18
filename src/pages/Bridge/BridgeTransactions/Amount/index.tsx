import { ChainId, CurrencyAmount } from '@voltage-finance/sdk-core'
import { isEmpty } from 'lodash'
import { useEffect, useState } from 'react'
import { Box, Flex, Text } from 'rebass/styled-components'
import { FUSE } from '../../../../data/Currency'
import { useTokenOnChain } from '../../../../hooks/Tokens'
import { useErc20BridgeHomeTokenAddress } from '../../../../state/bridge/hooks'
import { ComponentLoader } from '../../../../wrappers/ComponentLoader'

const BridgeTransactionAmount = ({ amount, foreignTokenAddress, isNative }: any) => {
  const homeTokenAddress = useErc20BridgeHomeTokenAddress(!isNative ? foreignTokenAddress : undefined)
  const token = useTokenOnChain(homeTokenAddress, ChainId.FUSE)
  const [parsedAmount, setParsedAmount] = useState('')
  const [symbol, setSymbol] = useState(null)

  useEffect(() => {
    if (isNative) {
      if (amount) {
        setParsedAmount(CurrencyAmount.fromRawAmount(FUSE, amount)?.toSignificant(6))
        setSymbol(FUSE.symbol)
      }
    } else {
      if (token && amount) {
        setParsedAmount(CurrencyAmount.fromRawAmount(token, amount)?.toSignificant(6))
        setSymbol(token?.symbol)
      }
    }
  }, [amount, foreignTokenAddress, isNative, token])

  return (
    <ComponentLoader dark loading={isNative ? isEmpty(parsedAmount) : isEmpty(parsedAmount) && isEmpty(token)}>
      <Flex fontSize={[0, 1]} sx={{ gap: 2 }} alignItems={'center'}>
        <Text>{parsedAmount || <Box width={60}>0.00</Box>}</Text>
        <Text>{symbol}</Text>
      </Flex>
    </ComponentLoader>
  )
}
export default BridgeTransactionAmount
