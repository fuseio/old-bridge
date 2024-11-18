import { Token, TradeType } from '@voltage-finance/sdk-core'
import { ArrowDown, Repeat, Sliders, X } from 'react-feather'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { Box, Button, Card, Flex, Link, Text } from 'rebass/styled-components'

import Title from './Title'
import About from './About'
import AppBody from '../AppBody'
import SwapChart from './SwapChart'
import { useWeb3 } from '../../hooks'
import Badge from '../../components/Badge'
import { Trade } from '../../hooks/useTrade'
import { TradeSummary } from './TradeSummary'
import SwitchDirection from './SwitchDirection'
import { Field } from '../../state/swap/actions'
import SwapSettings from './TransactionSettings'
import { ChainId } from '../../constants/chains'
import useCurrencyAmountUSD from '../../hooks/useUSDPrice'
import useAnalytics from '../../hooks/useAnalytics'
import { nativeOnChain } from '../../constants/token'
import { useFusdCallback } from '../../hooks/useFusd'
import { useExpertModeManager } from '../../state/user/hooks'
import CurrencyLogo from '../../components/Logo/CurrencyLogo'
import Maintenance from '../../components/swap/Maintenance'
import { useSwapCallback } from '../../hooks/useSwapCallback'
import TokenWarningModal from '../../modals/TokenWarningModal'
import { ApprovalButton } from '../../wrappers/ApprovalButton'
import SwitchNetwork from '../../components/SwitchNetwork/index'
import { useAllSwapTokens, useCurrency } from '../../hooks/Tokens'
import { StyledBalanceMaxMini } from '../../components/swap/styleds'
import { basisPointsToPercent, isTokenOnTokenList } from '../../utils'
import { CurrencyInputDropdown } from '../../wrappers/CurrencyInputDropdown'
import FormattedPriceImpact from '../../components/swap/FormattedPriceImpact'
import { CheckConnectionWrapper } from '../../wrappers/CheckConnectionWrapper'
import usePegSwapCallback, { PegSwapType } from '../../hooks/usePegSwapCallback'
import { ApprovalState, useApproveCallback } from '../../hooks/useApproveCallback'
import { computeSlippageAdjustedAmounts, warningSeverity } from '../../utils/prices'
import TransactionConfirmationModal from '../../modals/TransactionConfirmationModal'
import confirmPriceImpactWithoutFee from '../../components/swap/confirmPriceImpactWithoutFee'
import {
  FUSD_ADDRESS_V3,
  FUSD_DEPRECATED_ADDRESS,
  FUSE_GRAPH_TOKEN,
  UNDER_MAINTENANCE,
  ZERO_PERCENT,
} from '../../constants'
import { useSwapDefaultTokens, useDerivedSwapInfo, useSwapActionHandlers, useSwapState } from '../../state/swap/hooks'

declare module 'framer-motion' {
  export interface AnimatePresenceProps {
    children?: React.ReactNode
  }
}

function tradeMeaningfullyDiffers(tradeA: Trade, tradeB: Trade): boolean {
  return (
    tradeA.tradeType !== tradeB.tradeType ||
    !tradeA.inputAmount.currency.equals(tradeB.inputAmount.currency) ||
    !tradeA.inputAmount.equalTo(tradeB.inputAmount) ||
    !tradeA.outputAmount.currency.equals(tradeB.outputAmount.currency) ||
    !tradeA.outputAmount.equalTo(tradeB.outputAmount)
  )
}

export default function Swap() {
  const tokens = useAllSwapTokens()
  const { sendEvent } = useAnalytics()
  const { account, chainId } = useWeb3()
  const [token0, setToken0] = useState(null)
  const [token1, setToken1] = useState(null)
  const [isExpertMode] = useExpertModeManager()
  const loadedUrlParams = useSwapDefaultTokens()
  const { typedValue, recipient, independentField } = useSwapState()
  const [dismissTokenWarning, setDismissTokenWarning] = useState<boolean>(false)
  const { onSwitchTokens, onCurrencySelection, onUserInput } = useSwapActionHandlers()

  // errors
  const [showInverted, setShowInverted] = useState<boolean>(false)

  // token warning stuff
  const [loadedInputCurrency, loadedOutputCurrency] = [
    useCurrency(loadedUrlParams?.inputCurrencyId),
    useCurrency(loadedUrlParams?.outputCurrencyId),
  ]

  const {
    parsedAmount,
    currencies,
    inputError: swapInputError,
    trade: tradeInfo,
    parsedPegAmounts,
    autoSlippageMode,
    allowedSlippage,
    inputTax,
    outputTax,
  } = useDerivedSwapInfo(account)

  const {
    pegSwapType,
    pegSwapAddress,
    execute: onPegSwap,
    inputError: pegSwapInputError,
  } = usePegSwapCallback(currencies[Field.INPUT] as Token, currencies[Field.OUTPUT] as Token, typedValue)

  const {
    error: fusdError,
    methodName: fusdMethodName,
    parsedAmounts: fusdParsedAmounts,
    execute: fusdExecute,
  } = useFusdCallback(currencies[Field.INPUT], currencies[Field.OUTPUT], typedValue)

  const showFusd = !!fusdMethodName
  const showPegSwap: boolean = pegSwapType !== PegSwapType.NOT_APPLICABLE
  const dependentField: Field = independentField === Field.INPUT ? Field.OUTPUT : Field.INPUT
  const trade = showPegSwap || showFusd || typedValue?.length === 0 ? undefined : tradeInfo

  const { callback: swapCallback } = useSwapCallback(trade, recipient)

  let parsedAmounts
  if (showPegSwap) {
    parsedAmounts = {
      [Field.INPUT]: parsedAmount,
      [Field.OUTPUT]: parsedAmount,
    }
  } else if (showFusd) {
    parsedAmounts = fusdParsedAmounts
  } else {
    parsedAmounts = {
      [Field.INPUT]: trade?.inputAmount,
      [Field.OUTPUT]: trade?.outputAmount,
    }
  }

  const fiatValueTradeInput = useCurrencyAmountUSD(typedValue ? parsedAmounts?.[Field.INPUT] : undefined)
  const fiatValueTradeOutput = useCurrencyAmountUSD(typedValue ? parsedAmounts?.[Field.OUTPUT] : undefined)

  const urlLoadedTokens: Token[] = useMemo(
    () =>
      [loadedInputCurrency, loadedOutputCurrency]?.filter(
        (c): c is Token => c instanceof Token && !isTokenOnTokenList(tokens, c)
      ) ?? [],
    [loadedInputCurrency, loadedOutputCurrency, tokens]
  )

  const handleConfirmTokenWarning = useCallback(() => {
    setDismissTokenWarning(true)
  }, [])

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

  // modal and loading
  const [{ showConfirm, tradeToConfirm, swapErrorMessage, attemptingTxn, txHash }, setSwapState] = useState<{
    showConfirm: boolean
    tradeToConfirm: Trade | undefined
    attemptingTxn: boolean
    swapErrorMessage: string | undefined
    txHash: string | undefined
  }>({
    showConfirm: false,
    tradeToConfirm: undefined,
    attemptingTxn: false,
    swapErrorMessage: undefined,
    txHash: undefined,
  })

  const formattedAmounts = {
    [independentField]: typedValue,
    [dependentField]: showPegSwap
      ? parsedAmounts?.[independentField]?.toExact() ?? ''
      : parsedAmounts?.[dependentField]?.toSignificant(6) ?? '',
  }

  const amountToApprove = useMemo(
    () =>
      showPegSwap
        ? parsedPegAmounts[Field.INPUT]
        : showFusd
        ? fusdParsedAmounts?.[Field.INPUT]
        : trade
        ? trade?.inputAmount
        : undefined,
    [showPegSwap, parsedPegAmounts, showFusd, fusdParsedAmounts, trade]
  )

  // check whether the user has approved the router on the input token
  const spenderAddress = showPegSwap ? pegSwapAddress : showFusd ? FUSD_ADDRESS_V3 : trade ? trade.allowanceTarget : null

  const [approval, approveCallback] = useApproveCallback(amountToApprove, spenderAddress)

  const slippageAdjustedAmounts = useMemo(
    () => computeSlippageAdjustedAmounts(trade, allowedSlippage),
    [allowedSlippage, trade]
  )

  const showAcceptChanges = useMemo(() => {
    if (trade && tradeToConfirm) {
      return Boolean(tradeMeaningfullyDiffers(trade, tradeToConfirm))
    }
    return false
  }, [tradeToConfirm, trade])

  // check if user has gone through approval process, used to show two step buttons, reset on token change
  const [approvalSubmitted, setApprovalSubmitted] = useState<boolean>(false)

  const [settingsOpen, setSettingsOpen] = useState(false)

  const estimatedPriceImpact = useMemo(
    () => (showPegSwap ? ZERO_PERCENT : tradeInfo?.priceImpact),
    [showPegSwap, tradeInfo?.priceImpact]
  )

  const handleSwap = useCallback(() => {
    if (trade && estimatedPriceImpact && !confirmPriceImpactWithoutFee(estimatedPriceImpact)) {
      return
    }

    if (!swapCallback) {
      return
    }

    setSwapState({ attemptingTxn: true, tradeToConfirm, showConfirm, swapErrorMessage: undefined, txHash: undefined })
    swapCallback()
      .then((hash) => {
        setSwapState({ attemptingTxn: false, tradeToConfirm, showConfirm, swapErrorMessage: undefined, txHash: hash })
        sendEvent('Swap', {
          fromToken: trade?.inputAmount?.currency?.symbol,
          toToken: trade?.outputAmount?.currency?.symbol,
        })
        onUserInput(Field.INPUT, '')
      })
      .catch((error: any) => {
        setSwapState({
          attemptingTxn: false,
          tradeToConfirm,
          showConfirm,
          swapErrorMessage: error.message,
          txHash: undefined,
        })
      })
  }, [trade, estimatedPriceImpact, swapCallback, tradeToConfirm, showConfirm, sendEvent, onUserInput])

  const handlePegSwap = async () => {
    if (!onPegSwap) return

    try {
      const txReceipt = await onPegSwap()
      if (txReceipt) {
        onUserInput(Field.INPUT, '')
      }
    } catch (e) {
      console.error(e)
      onUserInput(Field.INPUT, '')
    }
  }

  const handleFusd = async () => {
    if (!fusdExecute) return

    try {
      await fusdExecute()
    } catch (e) {
      console.error(e)
    } finally {
      onUserInput(Field.INPUT, '')
    }
  }

  // warnings on slippage
  const priceImpactSeverity = warningSeverity(estimatedPriceImpact)
  // show approve flow when: no error on inputs, not approved or pending, or approved in current session
  // never show if price impact is above threshold in non expert mode

  const handleConfirmDismiss = useCallback(() => {
    setSwapState({ showConfirm: false, tradeToConfirm, attemptingTxn, swapErrorMessage, txHash })
    // if there was a tx hash, we want to clear the input
    if (txHash) {
      onUserInput(Field.INPUT, '')
    }
  }, [attemptingTxn, onUserInput, swapErrorMessage, tradeToConfirm, txHash])

  const handleAcceptChanges = useCallback(() => {
    setSwapState({ tradeToConfirm: trade, swapErrorMessage, txHash, attemptingTxn, showConfirm })
  }, [attemptingTxn, showConfirm, swapErrorMessage, trade, txHash])

  const handleInputSelect = useCallback(
    (inputCurrency) => {
      setApprovalSubmitted(false) // reset 2 step UI for approvals
      onCurrencySelection(Field.INPUT, inputCurrency)
    },
    [onCurrencySelection]
  )

  const handleOutputSelect = useCallback(
    (outputCurrency) => {
      onCurrencySelection(Field.OUTPUT, outputCurrency)
    },
    [onCurrencySelection]
  )

  let priceImpactTooHighError
  if (formattedAmounts[Field.INPUT] && parseFloat(formattedAmounts[Field.INPUT]) !== 0) {
    if (!isExpertMode && !showPegSwap && !showFusd && priceImpactSeverity > 3) {
      priceImpactTooHighError = `Price Impact High`
    } else {
      priceImpactTooHighError = null
    }
  }

  // mark when a user has submitted an approval, reset onTokenSelection for input field
  useEffect(() => {
    if (approval === ApprovalState.PENDING) {
      setApprovalSubmitted(true)
    }
  }, [approval, approvalSubmitted, account])

  useEffect(() => {
    const currency0 = currencies[Field.INPUT] as Token
    const currency1 = currencies[Field.OUTPUT] as Token

    if (currency0 || currency1) {
      let token0
      let token1

      if (currency0?.symbol === nativeOnChain(chainId).symbol) {
        switch (chainId) {
          case ChainId.MAINNET:
          case ChainId.BINANCE_MAINNET:
            token0 = nativeOnChain(chainId)
            break

          case ChainId.FUSE:
          default:
            token0 = FUSE_GRAPH_TOKEN
            break
        }
      } else if (currency0?.address) {
        token0 = new Token(
          currency0?.chainId,
          currency0?.address,
          currency0?.decimals,
          currency0?.symbol,
          currency0?.name
        )
      }

      if (currency1?.symbol === nativeOnChain(chainId).symbol) {
        switch (chainId) {
          case ChainId.MAINNET:
          case ChainId.BINANCE_MAINNET:
            token1 = nativeOnChain(chainId)
            break

          case ChainId.FUSE:
          default:
            token1 = FUSE_GRAPH_TOKEN
            break
        }
      } else if (currency1?.address) {
        token1 = new Token(
          currency1?.chainId,
          currency1?.address,
          currency1?.decimals,
          currency1?.symbol,
          currency1?.name
        )
      }

      localStorage.setItem(`${chainId}-SWAP_INPUT`, JSON.stringify(token0))
      localStorage.setItem(`${chainId}-SWAP_OUTPUT`, JSON.stringify(token1))
      setToken0(token0)
      setToken1(token1)
    }
  }, [currencies])

  if (UNDER_MAINTENANCE) {
    return <Maintenance />
  }

  return (
    <>
      <SwitchNetwork />

      <TokenWarningModal
        isOpen={urlLoadedTokens.length > 0 && !dismissTokenWarning}
        tokens={urlLoadedTokens}
        handleDismiss={() => setDismissTokenWarning(true)}
        onConfirm={handleConfirmTokenWarning}
      />

      <TransactionConfirmationModal
        isOpen={showConfirm}
        onDismiss={handleConfirmDismiss}
        header="Confirm Swap"
        message={`Output is Estimated. You will recieve at least ${slippageAdjustedAmounts[Field.OUTPUT]?.toSignificant(
          4
        )} ${trade?.outputAmount.currency.symbol} or the transaction will revert.`}
        onConfirm={!showAcceptChanges && handleSwap}
        confirmButtonText={priceImpactSeverity > 2 ? 'Swap Anyway' : 'Confirm'}
        hash={txHash}
        tradeDetails={[
          {
            amount: trade?.inputAmount.toSignificant(6) || '0',
            symbol: trade?.inputAmount.currency.symbol || 'FUSE',
            LogoComponent: () => <CurrencyLogo currency={trade?.inputAmount.currency} size={'34px'} />,
            SeperatorComponent: () => <ArrowDown style={{ marginLeft: '4px' }} />,
          },
          {
            amount: trade?.outputAmount.toSignificant(6) || '0',
            symbol: trade?.outputAmount.currency.symbol || 'FUSE',
            LogoComponent: () => <CurrencyLogo currency={trade?.outputAmount.currency} size={'34px'} />,
          },
        ]}
        transactionDetails={[
          {
            header: showAcceptChanges ? 'Price Updated' : 'Price',
            Component: () => (
              <Flex style={{ gap: '4px' }}>
                <Flex alignItems={'center'} style={{ gap: '4px' }}>
                  {showAcceptChanges && (
                    <Link color={'black'} onClick={handleAcceptChanges}>
                      Accept
                    </Link>
                  )}
                  <StyledBalanceMaxMini onClick={() => setShowInverted(!showInverted)}>
                    <Repeat size={14} />
                  </StyledBalanceMaxMini>
                  <Text color={'black'}>
                    1{' '}
                    {showInverted ? (
                      <>
                        {trade?.inputAmount?.currency?.symbol} = {trade?.price?.toFixed(4)}{' '}
                        {trade?.outputAmount?.currency?.symbol}
                      </>
                    ) : (
                      <>
                        {trade?.outputAmount?.currency?.symbol} = {(1 / trade?.price).toFixed(4)}{' '}
                        {trade?.inputAmount?.currency?.symbol}
                      </>
                    )}
                  </Text>
                </Flex>
              </Flex>
            ),
          },
          {
            header: trade?.tradeType === TradeType.EXACT_INPUT ? 'Minimum received' : 'Maximum sold',
            Component: () => (
              <div>
                {trade?.tradeType === TradeType.EXACT_INPUT
                  ? slippageAdjustedAmounts[Field.OUTPUT]?.toSignificant(4) ||
                    '0' + (trade?.outputAmount.currency.symbol || '')
                  : slippageAdjustedAmounts[Field.INPUT]?.toSignificant(4) ||
                    '0' + (trade?.inputAmount.currency.symbol || '')}
              </div>
            ),
          },
          {
            header: 'Price Impact',
            Component: () => (estimatedPriceImpact ? <FormattedPriceImpact priceImpact={estimatedPriceImpact} /> : '0'),
          },
          {
            header: 'Max Slippage',
            Component: () => (
              <Flex justifyContent={'center'}>
                {autoSlippageMode && (
                  <div
                    style={{
                      background: 'white',
                      borderRadius: '32px',
                      fontSize: '12px',
                      fontWeight: 400,
                      padding: '2px 6px',
                      marginRight: '6px',
                    }}
                  >
                    Auto
                  </div>
                )}{' '}
                {basisPointsToPercent(allowedSlippage).toSignificant()}%
              </Flex>
            ),
          },
          inputTax?.greaterThan('0') && {
            header: `${trade?.inputAmount?.currency?.symbol} Fee`,
            Component: () => <Text color="lightGreen">{inputTax?.toSignificant()}%</Text>,
          },
          outputTax?.greaterThan('0') && {
            header: `${trade?.outputAmount?.currency?.symbol} Fee`,
            Component: () => <Text color="lightGreen">{outputTax?.toSignificant()}%</Text>,
          },
        ].filter(Boolean)}
      />

      <AppBody>
        <Box pb={3}>
          <Title token0={token0} />
        </Box>

        <Flex sx={{ gap: 4 }} flexDirection={['column', 'row']} width={'100%'}>
          <Flex width={[1, 10 / 16]} order={[2, 0]}>
            <Flex width={'100%'} flexDirection={'column'} sx={{ gap: 4 }}>
              <SwapChart token0={token0} token1={token1} />

              <About token0={token1} />
            </Flex>
          </Flex>

          <Card px={0} pt={3} mx="auto" height="fit-content" width={[1, 6 / 16]}>
            <Box>
              <Flex pl={3} pb={3} pr={1} justifyContent={'space-between'} alignItems={'center'}>
                <Text fontSize={3} fontWeight={700}>
                  Swap
                </Text>

                <Flex>
                  {!autoSlippageMode && (
                    <Badge text={`Slippage ${basisPointsToPercent(allowedSlippage).toSignificant()}%`} />
                  )}
                  <Flex
                    px={3}
                    alignItems={'center'}
                    style={{ gap: '8px', cursor: 'pointer' }}
                    onClick={() => {
                      setSettingsOpen(!settingsOpen)
                    }}
                  >
                    <Button variant={'icon'}>
                      {!settingsOpen ? (
                        <Sliders color="#000000" strokeWidth={2} size={16} />
                      ) : (
                        <X color="#000000" strokeWidth={2} size={20} />
                      )}
                    </Button>
                  </Flex>
                </Flex>
              </Flex>

              <Box py={2} />

              {!settingsOpen ? (
                <Box minHeight={280}>
                  <Flex width="100%" flexDirection={'column'} style={{ gap: '4px' }}>
                    <Box px={3}>
                      <CurrencyInputDropdown
                        id="swap-currency-input"
                        title="From"
                        value={formattedAmounts[Field.INPUT]}
                        onUserInput={handleTypeInput}
                        onCurrencySelect={handleInputSelect}
                        selectedCurrency={currencies[Field.INPUT]}
                        listType="Swap"
                        showETH={true}
                        fiatValue={fiatValueTradeInput}
                      />
                    </Box>
                    <Box py={3}>
                      <SwitchDirection
                        forwardOnly={(currencies as any).INPUT?.address === FUSD_DEPRECATED_ADDRESS}
                        onClick={() => {
                          if (currencies[Field.OUTPUT]) {
                            setApprovalSubmitted(false) // reset 2 step UI for approvals
                            onSwitchTokens()
                          }
                        }}
                      />
                    </Box>

                    <Box px={3}>
                      <CurrencyInputDropdown
                        id="swap-currency-output"
                        title="To"
                        disabled={(currencies as any).INPUT?.address === FUSD_DEPRECATED_ADDRESS}
                        priceImpact={estimatedPriceImpact}
                        value={formattedAmounts[Field.OUTPUT]}
                        onUserInput={handleTypeOutput}
                        onCurrencySelect={handleOutputSelect}
                        selectedCurrency={currencies[Field.OUTPUT]}
                        listType="Swap"
                        showETH={true}
                        fiatValue={fiatValueTradeOutput}
                      />
                    </Box>
                  </Flex>

                  <Box px={3} pt={2}>
                    <CheckConnectionWrapper>
                      <ApprovalButton
                        id="swap-button"
                        approval={approval}
                        error={swapInputError || priceImpactTooHighError || pegSwapInputError || fusdError}
                        onClick={() => {
                          if (showPegSwap && !Boolean(pegSwapInputError)) {
                            handlePegSwap()
                            return
                          }

                          if (showFusd && !Boolean(fusdError)) {
                            handleFusd()
                            return
                          }

                          if (isExpertMode) {
                            handleSwap()
                          } else {
                            setSwapState({
                              tradeToConfirm: trade,
                              attemptingTxn: false,
                              swapErrorMessage: undefined,
                              showConfirm: true,
                              txHash: undefined,
                            })
                          }
                        }}
                        approveCallback={approveCallback}
                      >
                        {showFusd ? fusdMethodName : 'Swap'}
                      </ApprovalButton>
                    </CheckConnectionWrapper>
                  </Box>
                </Box>
              ) : (
                <Box minHeight={280}>
                  <SwapSettings />
                </Box>
              )}

              {trade && !settingsOpen && (
                <Box pt={3}>
                  <Box opacity={0.5} variant="border"></Box>
                  <Box py={2}></Box>
                  <Box px={3}>
                    <TradeSummary
                      trade={trade}
                      priceImpact={estimatedPriceImpact}
                      slippageAdjustedAmounts={slippageAdjustedAmounts}
                    />
                  </Box>
                </Box>
              )}
            </Box>
          </Card>
        </Flex>
      </AppBody>
    </>
  )
}
