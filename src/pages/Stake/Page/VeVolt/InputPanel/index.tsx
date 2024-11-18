import moment from 'moment'
import { useCallback, useMemo, useState } from 'react'
import { Box, Card, Flex, Text } from 'rebass/styled-components'

import { useWeb3 } from '../../../../../hooks'
import SliderBar from '../../../../../wrappers/Slider'
import { ChainId } from '../../../../../constants/chains'
import useAnalytics from '../../../../../hooks/useAnalytics'
import { useTokenBalance } from '../../../../../state/wallet/hooks'
import { CurrencyInput } from '../../../../../wrappers/CurrencyInput'
import { useVeVoltContract } from '../../../../../hooks/useContract'
import { ApprovalButton } from '../../../../../wrappers/ApprovalButton'
import TxHashSubmmitedModal from '../../../../../modals/TxSubmmitedModal'
import { VEVOLT_ADDRESS, VOLT } from '../../../../../constants/addresses'
import { useApproveCallback } from '../../../../../hooks/useApproveCallback'
import tryParseCurrencyAmount from '../../../../../utils/tryParseCurrencyAmount'
import { CheckConnectionWrapper } from '../../../../../wrappers/CheckConnectionWrapper'
import { VEVOLT_MAX_LOCK_MONTHS, VEVOLT_MAX_LOCK_TIMESTAMP } from '../../../../../constants'
import { TransactionKey, useTransactionAdder } from '../../../../../state/transactions/hooks'
import { addMonthsAndConvertSecond, addMonthsAndFormat, formatSignificant } from '../../../../../utils'
import { useTransactionRejectedNotification } from '../../../../../hooks/notifications/useTransactionRejectedNotification'

const VeVoltInputPanel = () => {
  const addTransaction = useTransactionAdder()

  const { chainId, account } = useWeb3()
  const veVoltContract = useVeVoltContract()
  const [months, setMonths] = useState(1)
  const [txHash, setTxHash] = useState(null)
  const { sendEvent } = useAnalytics()
  const voltToken = useMemo(() => VOLT[chainId] || VOLT[ChainId.FUSE], [chainId])
  const voltBalance = useTokenBalance(account ?? undefined, voltToken)
  const [typedValue, setTypedValue] = useState('0')

  const parsedAmount = tryParseCurrencyAmount(typedValue, voltToken)

  const [approval, approveCallback] = useApproveCallback(parsedAmount, VEVOLT_ADDRESS[chainId])
  const rejectTransaction = useTransactionRejectedNotification()
  const estimatedUnlockTime = useMemo(() => {
    return addMonthsAndConvertSecond(months)
  }, [months])

  const estimatedVeVolt = useMemo(() => {
    if (!parsedAmount || !estimatedUnlockTime) return
    const timeLeft = estimatedUnlockTime - moment().unix()
    return parsedAmount.multiply(String(timeLeft)).divide(String(VEVOLT_MAX_LOCK_TIMESTAMP))
  }, [parsedAmount, estimatedUnlockTime])

  const onStake = useCallback(async () => {
    if (!parsedAmount || !veVoltContract || !estimatedVeVolt) return
    const unlockTime = addMonthsAndConvertSecond(months)
    try {
      const response = await veVoltContract.create_lock(parsedAmount.quotient.toString(), unlockTime)
      setTxHash(response?.hash)

      sendEvent('Lock veVOLT', {
        amount: parsedAmount.toSignificant(6),
      })

      addTransaction(response, {
        summary: `Locked ${parsedAmount.toSignificant(6)} VOLT for ${estimatedVeVolt.toSignificant(6)} VeVOLT`,
        key: TransactionKey.VEVOLT,
      })
    } catch (e: any) {
      if (e?.code === 4001 || e?.code === 'ACTION_REJECTED') {
        rejectTransaction()
      }
    }

    setTypedValue('0')
  }, [parsedAmount, veVoltContract, estimatedVeVolt])

  return (
    <>
      <TxHashSubmmitedModal txHash={txHash} setTxHash={setTxHash} currency={VOLT[chainId]} />
      <Card p={0} width={['100%']} pb={3} height={'fit-content'}>
        <Box pt={3}>
          <Box px={3}>
            <Text mb={3} mt={1} fontSize={1} fontWeight={600}>
              Amount
            </Text>
            <Flex flexDirection={'column'} sx={{ gap: 2 }}>
              <CurrencyInput
                value={typedValue}
                currency={voltToken}
                onUserInput={setTypedValue}
                onMax={() => setTypedValue(voltBalance?.toExact())}
              />
              <Box pt={3}>
                <Flex sx={{ gap: 2 }}>
                  <Text fontSize={2} fontWeight={600}>
                    Locking Period:
                  </Text>
                  <Text fontWeight={600} sx={{ color: 'primary' }} textAlign={'center'} fontSize={2}>
                    {months} M
                  </Text>
                </Flex>
                <Box mt={2} mb={2}>
                  <SliderBar
                    min={1}
                    max={VEVOLT_MAX_LOCK_MONTHS}
                    value={months}
                    defaultValue={1}
                    id="period"
                    name="period"
                    onChange={(val) => {
                      if (val) {
                        setMonths(val)
                      }
                    }}
                  />
                </Box>
              </Box>
            </Flex>
            <Box pt={1} pb={3}>
              <Flex alignItems={'center'} justifyContent={'space-between'}>
                <Text opacity={0.7} fontSize={1}>
                  Locking Until
                </Text>
                <Text fontWeight={500} fontSize={1}>
                  {addMonthsAndFormat(months)}
                </Text>
              </Flex>
              <Flex alignItems={'center'} justifyContent={'space-between'} pt={2}>
                <Text opacity={0.7} fontSize={1}>
                  Estimated to receive
                </Text>
                <Text fontWeight={500} fontSize={1}>
                  {formatSignificant({
                    value: estimatedVeVolt?.toSignificant(18) || 0,
                    suffix: ' veVOLT',
                  })}
                </Text>
              </Flex>
            </Box>

            <CheckConnectionWrapper>
              <ApprovalButton
                onClick={() => onStake()}
                approval={approval}
                error={parsedAmount?.greaterThan(voltBalance ?? '0') && 'Insufficient VOLT Balance'}
                approveCallback={approveCallback}
              >
                Stake
              </ApprovalButton>
            </CheckConnectionWrapper>
          </Box>
        </Box>
      </Card>
    </>
  )
}
export default VeVoltInputPanel
