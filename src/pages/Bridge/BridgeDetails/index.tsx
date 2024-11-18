import { useState } from 'react'
import { Box, Flex, Text } from 'rebass/styled-components'
import { Currency, CurrencyAmount } from '@voltage-finance/sdk-core'

import { useWeb3 } from '../../../hooks'
import { numberFormat } from '../../../utils'
import { ChainId } from '../../../constants/chains'
import InfoIcon from '../../../components/InfoIcon'
import { useBridgeFee } from '../../../state/bridge/hooks'
import BridgeInfoModal from '../../../modals/BridgeInfoModal'
import { BridgeDirection } from '../../../state/bridge/actions'

const BridgeDetails = ({
  inputCurrencyId,
  // inputAmount,
  bridgeDirection,
  minMaxAmount,
}: {
  inputCurrencyId: string | undefined
  inputAmount: CurrencyAmount<Currency> | undefined
  bridgeDirection: BridgeDirection | undefined
  minMaxAmount: any
}) => {
  const fee = useBridgeFee(inputCurrencyId, bridgeDirection)
  const { chainId } = useWeb3()
  const [open, setOpen] = useState(false)

  const feePercentage = fee ? Number(fee) * 100 : 0
  // const calculatedFee = useCalculatedBridgeFee(inputCurrencyId, inputAmount, bridgeDirection)
  // const currency = useCurrency(inputCurrencyId, 'Bridge')

  return inputCurrencyId ? (
    <Flex flexDirection={'column'} py={3} style={{ gap: '4px' }}>
      <Flex alignItems={'top'} justifyContent={'space-between'}>
        <Text opacity={0.5} fontSize={1}>
          Txn Limits
        </Text>
        <Flex style={{ gap: '4px' }} alignItems={'end'} flexDirection={'row'}>
          <Text fontSize={1}> {numberFormat(minMaxAmount?.minAmount)} Min</Text>
          <Text fontSize={1}>- {numberFormat(minMaxAmount?.maxAmount)} Max</Text>
        </Flex>
      </Flex>
      <Flex alignItems={'center'} justifyContent={'space-between'}>
        <Flex style={{ gap: '2px' }} alignItems={'center'}>
          <Text opacity={0.5} fontSize={1}>
            Bridge Fee
          </Text>
          <InfoIcon
            onClick={() => {
              setOpen(true)
            }}
            size={12}
          />
        </Flex>
        <Text fontSize={1}>{chainId === ChainId.FUSE ? ` ${feePercentage}%` : 'Free'}</Text>
      </Flex>

      <BridgeInfoModal open={open} setOpen={setOpen} />
    </Flex>
  ) : (
    <Box py={2}></Box>
  )
}

export default BridgeDetails
