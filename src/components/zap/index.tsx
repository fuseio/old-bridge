import { ArrowDown } from 'react-feather'
import { Token } from '@voltage-finance/sdk-core'
import { useCallback, useEffect, useState } from 'react'
import { Box, Card, Text } from 'rebass/styled-components'

import { TYPE } from '../../theme'
import { useWeb3 } from '../../hooks'
import DoubleCurrencyLogo from '../DoubleLogo'
import useZapCallback from '../../hooks/useZap'
import { getCurrencySymbol } from '../../utils'
import { ChainId } from '../../constants/chains'
import useCurrencyAmountUSD from '../../hooks/useUSDPrice'
import { Field } from '../../state/stableswap/actions'
import { BackButton } from '../../wrappers/BackButton'
import { IconDivider } from '../../wrappers/IconDivider'
import { ApprovalButton } from '../../wrappers/ApprovalButton'
import TransactionConfirmationModalLegacy from '../../modals/TransactionModalLegacy'
import { CurrencyInputDropdown } from '../../wrappers/CurrencyInputDropdown'
import { CheckConnectionWrapper } from '../../wrappers/CheckConnectionWrapper'
import { ApprovalState, useApproveCallback } from '../../hooks/useApproveCallback'
import CurrencyInputPanelZap from '../../components/ZapInputPanel/CurrencyInputPanel'
import { useDerivedZapInfo, useZapActionHandlers, useZapState } from '../../state/zap/hooks'

import 'react-dropdown/style.css'

export default function ZapActionPanel() {
  const { currencies } = useDerivedZapInfo()

  const {
    typedValue,
    [Field.INPUT]: { currencyId: inputCurrencyId },
    [Field.OUTPUT]: { currencyId: outputCurrencyId },
  } = useZapState()

  const {
    execute: executeZap,
    inputError,
    parsedAmounts,
    formattedAmounts,
    pair,
    ratios,
  } = useZapCallback(currencies[Field.INPUT], currencies[Field.OUTPUT], typedValue, inputCurrencyId, outputCurrencyId)

  const fiatValueTradeInput = useCurrencyAmountUSD(parsedAmounts[Field.INPUT])

  const { onCurrencySelection, onUserInput } = useZapActionHandlers()
  const [txHash, setTXHash] = useState(undefined)

  const [showConfirm, setShowConfirm] = useState(false)
  const [approval, approveCallback] = useApproveCallback(parsedAmounts?.inputAmount, inputCurrencyId)
  const [approvalSubmitted, setApprovalSubmitted] = useState<boolean>(false)

  const handleTypeInput = useCallback(
    (value: string) => {
      onUserInput(Field.INPUT, value)
    },
    [onUserInput]
  )

  const handleTypeOutput = useCallback(
    (value: string) => {
      onUserInput(Field.OUTPUT, value)
    },
    [onUserInput]
  )

  const handleInputSelect = useCallback(
    (inputCurrency) => {
      setApprovalSubmitted(false)

      onCurrencySelection(Field.INPUT, inputCurrency)
    },
    [onCurrencySelection]
  )

  const handleOutputSelect = useCallback(
    (outputCurrency) => {
      setApprovalSubmitted(false)
      onCurrencySelection(Field.OUTPUT, outputCurrency)
    },
    [onCurrencySelection]
  )

  const handleConfirmDismiss = useCallback(() => {
    setShowConfirm(false)
    setTXHash(undefined)
  }, [])

  useEffect(() => {
    if (approval === ApprovalState.PENDING) {
      setApprovalSubmitted(true)
    }
  }, [approval, approvalSubmitted])

  const handleZap = async () => {
    if (!executeZap) return

    try {
      const { hash } = await executeZap()
      setTXHash(hash)
    } catch (e: any) {
      console.error(e)
    }
  }
  const { chainId } = useWeb3()

  return (
    <>
      <BackButton path={'/pool'} />
      <Box width={[1, 500]} mx="auto">
        <Card px={0}>
          <Text pb={3} px={3} fontSize={3} fontWeight={700}>
            Zap
          </Text>
          <Box
            sx={
              chainId === ChainId.FUSE ? { opacity: 1, pointerEvents: 'all' } : { opacity: 0.7, pointerEvents: 'none' }
            }
            px={3}
          >
            <CurrencyInputDropdown
              title="From"
              onUserInput={handleTypeInput}
              onCurrencySelect={handleInputSelect}
              selectedCurrency={currencies[Field.INPUT]}
              value={formattedAmounts?.inputAmount ?? '0'}
              listType="Swap"
              fiatValue={fiatValueTradeInput}
            />
          </Box>

          <IconDivider Icon={() => <ArrowDown />} />
          <Box pt={3}></Box>
          <CurrencyInputPanelZap
            disabled={typedValue === '0' || typedValue?.length == 0}
            id="zap-currency-output"
            label={
              (formattedAmounts?.outputAmount ?? 0 > 0) && !pair ? 'To LP (Estimate)' : 'To LP (Estimate not available)'
            }
            onUserInput={handleTypeOutput}
            showMaxButton={false}
            onCurrencySelect={handleOutputSelect}
            currency={currencies[Field.OUTPUT]}
            otherCurrency={currencies[Field.INPUT]}
            pair={pair}
            value={formattedAmounts?.outputAmount ?? '0'}
          />

          <Box px={3} pt={3}>
            <CheckConnectionWrapper>
              <ApprovalButton
                approval={approval}
                error={inputError}
                approveCallback={approveCallback}
                onClick={() => {
                  setShowConfirm(true)
                }}
              >
                Zap
              </ApprovalButton>
            </CheckConnectionWrapper>
          </Box>

          <TransactionConfirmationModalLegacy
            isOpen={showConfirm}
            hash={txHash}
            onDismiss={handleConfirmDismiss}
            header="Pool Tokens"
            onConfirm={handleZap}
            addCurrency={
              currencies[Field.OUTPUT] &&
              new Token(
                (currencies[Field.OUTPUT] as any)?.chainId,
                (currencies[Field.OUTPUT] as any)?.address,
                (currencies[Field.OUTPUT] as any)?.decimals,
                getCurrencySymbol(pair?.token0, 122) + '/' + getCurrencySymbol(pair?.token1, 122),
                getCurrencySymbol(pair?.token0, 122) + '/' + getCurrencySymbol(pair?.token1, 122)
              )
            }
            tradeDetails={[
              {
                amount: formattedAmounts?.outputAmount ?? '0',
                symbol: pair?.token0?.symbol + '/' + pair?.token1?.symbol,
                LogoComponent: () => <DoubleCurrencyLogo currency0={pair?.token0} currency1={pair?.token1} size={30} />,
              },
            ]}
            transactionDetails={[
              {
                header: `${pair?.token0?.symbol} Estimated`,
                Component: () => <TYPE.main>{typedValue}</TYPE.main>,
              },
              {
                header: `${pair?.token1?.symbol} Estimated`,
                Component: () => <TYPE.main>{ratios?.token1Amount.toSignificant(6) || 0}</TYPE.main>,
              },
            ]}
          />
        </Card>
      </Box>
    </>
  )
}
