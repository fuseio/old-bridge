import { BigNumber } from '@ethersproject/bignumber'
import { Link, useLocation } from 'react-router-dom'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { Box, Button, Card, Flex, Text } from 'rebass/styled-components'
import { FeeAmount, NonfungiblePositionManager } from '@voltage-finance/v3-sdk'
import { Currency, NONFUNGIBLE_POSITION_MANAGER_ADDRESSES, Percent } from '@voltage-finance/sdk-core'

import AppBody from '../../AppBody'
import { useWeb3 } from '../../../hooks'
import ChooseTokens from './ChooseTokens'
import ChooseFeeTier from './ChooseFeeTier'
import Page from '../../../collections/Page'
import LiquidityInput from './LiquidityInput'
import { useCurrency } from '../../../hooks/Tokens'
import { calculateGasMargin } from '../../../utils'
import { Field } from '../../../state/mint/actions'
import { POOL_PAGE_TABLE_FILTERS } from '../../Pool'
import { Bound } from '../../../state/mint/v3/actions'
import { currencyId } from '../../../utils/currencyId'
import LiquidityPriceRange from './LiquidityPriceRange'
import useAnalytics from '../../../hooks/useAnalytics'
import { BackButton } from '../../../wrappers/BackButton'
import SwitchNetwork from '../../../components/SwitchNetwork'
import { WRAPPED_NATIVE_CURRENCY } from '../../../constants/token'
import { useTransactionAdder } from '../../../state/transactions/hooks'
import { useV3PositionFromTokenId } from '../../../hooks/useV3Positions'
import { useDensityChartData } from '../../../hooks/v3/useDensityChartData'
import { useV3NFTPositionManagerContract } from '../../../hooks/useContract'
import { useIsExpertMode, useUserDeadline } from '../../../state/user/hooks'
import { useRangeHopCallbacks } from '../../../hooks/v3/useRangeHopCallbacks'
import { useDerivedPositionInfo } from '../../../hooks/useDerivedPositionInfo'
import { CheckConnectionWrapper } from '../../../wrappers/CheckConnectionWrapper'
import TransactionConfirmationModalLegacy from '../../../modals/TransactionModalLegacy'
import { useV3DerivedMintInfo, useV3MintActionHandlers, useV3MintState } from '../../../state/mint/v3/hooks'
import { ApprovalState, useApproveCallback } from '../../../hooks/useApproveCallback'

interface AddLiquidityV3Props {
  history?: any
  match?: {
    params?: {
      currencyIdA?: string
      currencyIdB?: string
    }
  }
}

const DEFAULT_ADD_IN_RANGE_SLIPPAGE_TOLERANCE = new Percent(50, 10_000)

const maxColumnWidth = ['400px', '35vw', '400px']
const minColumnWidth = ['0px', '35vw', '400px']

export default function AddLiquidityV3(props: AddLiquidityV3Props) {
  const {
    history,
    match: {
      params: { currencyIdA, currencyIdB },
    },
  } = props

  const { search } = useLocation()
  const expertMode = useIsExpertMode()
  const { sendEvent } = useAnalytics()
  const { chainId, account, library } = useWeb3()
  const positionManager = useV3NFTPositionManagerContract(true)

  const tokenId = useMemo(() => {
    if (!search) return
    return new URLSearchParams(search).get('tokenId')
  }, [search])

  const [showConfirm, setShowConfirm] = useState<boolean>(false)
  const [txHash, setTxHash] = useState<string | undefined>(undefined)
  const [shouldRedirect, setShouldRedirect] = useState<boolean>(false)
  const addTransaction = useTransactionAdder()

  const [deadline] = useUserDeadline()
  const deadlineFromNow = Math.ceil(Date.now() / 1000) + deadline

  // fee selection from url
  const [feeUserInput, setFeeUserInput] = useState(100)

  const baseCurrency = useCurrency(currencyIdA)
  const currencyB = useCurrency(currencyIdB)
  // prevent an error if they input ETH/WETH
  const quoteCurrency =
    baseCurrency && currencyB && baseCurrency?.wrapped.equals(currencyB?.wrapped) ? undefined : currencyB

  const feeAmount: FeeAmount | undefined =
    feeUserInput && Object.values(FeeAmount).includes(feeUserInput) ? feeUserInput : undefined

  const { error: chartDataError, formattedData, isLoading: chartDataLoading } = useDensityChartData({
    currencyA: baseCurrency,
    currencyB: quoteCurrency,
    feeAmount,
  })

  // check for existing position if tokenId in url
  const { position: existingPositionDetails, loading: positionLoading } = useV3PositionFromTokenId(
    tokenId ? BigNumber.from(tokenId) : undefined
  )
  const hasExistingPosition = !!existingPositionDetails && !positionLoading
  const { position: existingPosition } = useDerivedPositionInfo(existingPositionDetails)

  const {
    pool,
    dependentField,
    price: tempPrice,
    pricesAtTicks,
    pricesAtLimit,
    parsedAmounts,
    position,
    noLiquidity,
    currencies,
    invalidRange,
    outOfRange,
    depositADisabled,
    depositBDisabled,
    invertPrice,
    ticksAtLimit,
    ticks,
    errorMessage: error,
  } = useV3DerivedMintInfo(
    baseCurrency ?? undefined,
    quoteCurrency ?? undefined,
    feeAmount,
    baseCurrency ?? undefined,
    existingPosition
  )

  // Needed so component is not refreshed
  const [price, setPrice] = useState(tempPrice)

  const {
    onFieldAInput,
    onFieldBInput,
    onStartPriceInput,
    onBothRangeInput,
    onLeftRangeInput,
    onRightRangeInput,
  } = useV3MintActionHandlers(noLiquidity)

  // mint state
  const {
    independentField,
    typedValue,
    startPriceTypedValue,
    leftRangeTypedValue,
    rightRangeTypedValue,
  } = useV3MintState()

  const { [Bound.LOWER]: tickLower, [Bound.UPPER]: tickUpper } = ticks

  const {
    getDecrementLower,
    getIncrementLower,
    getDecrementUpper,
    getIncrementUpper,
    getSetFullRange,
  } = useRangeHopCallbacks(baseCurrency ?? undefined, quoteCurrency ?? undefined, feeAmount, tickLower, tickUpper, pool)

  const hasStartingPrice = noLiquidity && price && feeAmount

  const hasValidMinMax =
    noLiquidity &&
    (rightRangeTypedValue as any).length !== 0 &&
    (leftRangeTypedValue as any).length !== 0 &&
    !outOfRange &&
    !invalidRange

  // get formatted amounts
  const formattedAmounts = {
    [independentField]: typedValue,
    [dependentField]: parsedAmounts[dependentField]?.toSignificant(6) ?? '',
  }

  // check whether the user has approved the router on the tokens
  const [approvalA, approveACallback] = useApproveCallback(
    parsedAmounts[Field.CURRENCY_A],
    NONFUNGIBLE_POSITION_MANAGER_ADDRESSES[chainId]
  )
  const [approvalB, approveBCallback] = useApproveCallback(
    parsedAmounts[Field.CURRENCY_B],
    NONFUNGIBLE_POSITION_MANAGER_ADDRESSES[chainId]
  )

  const isInitialized = !!(price && feeAmount)

  const addLiquidityView = isInitialized && !noLiquidity

  const handleCurrencySelect = useCallback(
    (currencyNew: Currency, currencyIdOther?: string): (string | undefined)[] => {
      const currencyIdNew = currencyId(currencyNew)

      if (currencyIdNew === currencyIdOther) {
        // not ideal, but for now clobber the other if the currency ids are equal
        return [currencyIdNew, undefined]
      } else {
        // prevent weth + eth
        const isETHOrWETHNew =
          currencyIdNew === 'ETH' ||
          (chainId !== undefined && currencyIdNew === WRAPPED_NATIVE_CURRENCY[chainId]?.address)
        const isETHOrWETHOther =
          currencyIdOther !== undefined &&
          (currencyIdOther === 'ETH' ||
            (chainId !== undefined && currencyIdOther === WRAPPED_NATIVE_CURRENCY[chainId]?.address))

        if (isETHOrWETHNew && isETHOrWETHOther) {
          return [currencyIdNew, undefined]
        } else {
          return [currencyIdNew, currencyIdOther]
        }
      }
    },
    [chainId]
  )

  const handleCurrencyASelect = useCallback(
    (currencyANew: Currency) => {
      const [idA, idB] = handleCurrencySelect(currencyANew, currencyIdB)
      if (idB === undefined) {
        history.push(`/add/${idA}?version=v3`)
      } else {
        history.push(`/add/${idA}/${idB}?version=v3`)
      }
    },
    [handleCurrencySelect, currencyIdB, history]
  )

  const handleCurrencyBSelect = useCallback(
    (currencyBNew: Currency) => {
      const [idB, idA] = handleCurrencySelect(currencyBNew, currencyIdA)
      if (idA === undefined) {
        history.push(`/add/${idB}?version=v3`)
      } else {
        history.push(`/add/${idA}/${idB}?version=v3`)
      }
    },
    [handleCurrencySelect, currencyIdA, history]
  )

  const handleDismissConfirmation = useCallback(() => {
    setShowConfirm(false)

    if (txHash) {
      onFieldAInput('')
      setShouldRedirect(true)
    }

    setTxHash('')
  }, [onFieldAInput, txHash])

  async function onAdd() {
    if (!chainId || !library || !account) return

    if (!positionManager || !baseCurrency || !quoteCurrency) return

    if (position && account && deadline) {
      const useNative = baseCurrency.isNative ? baseCurrency : quoteCurrency.isNative ? quoteCurrency : undefined
      const { calldata, value } =
        hasExistingPosition && tokenId
          ? NonfungiblePositionManager.addCallParameters(position, {
              tokenId,
              slippageTolerance: DEFAULT_ADD_IN_RANGE_SLIPPAGE_TOLERANCE,
              deadline: deadlineFromNow.toString(),
              useNative,
            })
          : NonfungiblePositionManager.addCallParameters(position, {
              slippageTolerance: DEFAULT_ADD_IN_RANGE_SLIPPAGE_TOLERANCE,
              recipient: account,
              deadline: deadlineFromNow.toString(),
              useNative,
              createPool: noLiquidity,
            })

      const txn = {
        to: NONFUNGIBLE_POSITION_MANAGER_ADDRESSES[chainId],
        data: calldata,
        value,
      }

      const connectedChainId = await library.getSigner().getChainId()
      if (chainId !== connectedChainId) throw new Error('Wrong chain')

      library
        .getSigner()
        .estimateGas(txn)
        .then((estimate) => {
          const newTxn = {
            ...txn,
            gasLimit: calculateGasMargin(estimate),
          }

          return library
            .getSigner()
            .sendTransaction(newTxn)
            .then((response) => {
              addTransaction(response, {
                summary:
                  'Add V3 ' +
                  parsedAmounts[Field.CURRENCY_A]?.toSignificant(3) +
                  ' ' +
                  currencies[Field.CURRENCY_A]?.symbol +
                  ' and ' +
                  parsedAmounts[Field.CURRENCY_B]?.toSignificant(3) +
                  ' ' +
                  currencies[Field.CURRENCY_B]?.symbol,
              })
              sendEvent('Add Liquidity V3', {
                currencyAAmount: parsedAmounts[Field.CURRENCY_A]?.toSignificant(3),
                currencyBAmount: parsedAmounts[Field.CURRENCY_B]?.toSignificant(3),
                currencyA: currencies[Field.CURRENCY_A]?.symbol,
                currencyB: currencies[Field.CURRENCY_B]?.symbol,
              })
              setTxHash(response.hash)
            })
        })
        .catch((error) => {
          setShowConfirm(false)
          console.error('Failed to send transaction', error)

          if (error?.code !== 4001) {
            console.error(error)
          }
        })
    } else {
      return
    }
  }

  function getButtonText() {
    if (!isInitialized) {
      return 'Enter Starting Price'
    }

    if (error) {
      return error
    }

    if (addLiquidityView) {
      return 'Add Liquidity'
    }

    return 'Create Pool'
  }

  useEffect(() => {
    if (shouldRedirect && !showConfirm) {
      history.push(`/pool?filter=${POOL_PAGE_TABLE_FILTERS.MY_POSITIONS.key}`)
      setShouldRedirect(false)
    }
  }, [history, shouldRedirect, showConfirm])

  // Needed so component is not refreshed
  useEffect(() => {
    if (tempPrice) {
      setPrice(tempPrice)
    }
  }, [baseCurrency, quoteCurrency, feeAmount, tempPrice])

  return (
    <AppBody>
      <BackButton path="/pool" />
      <SwitchNetwork />
      <TransactionConfirmationModalLegacy
        isOpen={showConfirm}
        hash={txHash}
        onDismiss={handleDismissConfirmation}
        header="Add Liquidity V3"
        onConfirm={onAdd}
        transactionDetails={[]}
        tradeDetails={[]}
      />

      <Page>
        <Page.Header>
          <Flex sx={{ justifyContent: 'space-between' }}>
            <Box sx={{ flex: '1 1 auto' }}>
              <Text fontSize={['40px', '50px', '60px']}>Add Liquidity</Text>
            </Box>

            <Box sx={{ flex: '1 1 auto', textAlign: 'right' }}>
              <Link to={`/add/${currencyIdA}/${currencyIdB}?version=v2`}>
                <Text display={['none', 'block']} fontSize={['18px', '16px', '18px']}>
                  Add V2 Liquidity
                </Text>{' '}
              </Link>
            </Box>
          </Flex>
        </Page.Header>

        <Page.Subheader>
          <Text fontSize={['16px', '17px', '18px']}>
            Create a new pool or create a liquidity position on an existing pool.
          </Text>
        </Page.Subheader>

        <Page.Body>
          <Card padding={['20px', '20px', '30px']}>
            <Flex
              pt={[2, 2, 3]}
              pb={5}
              flexDirection={['column', 'row']}
              sx={{ justifyContent: 'space-between', gap: [4, 2, 0] }}
            >
              <Box sx={{ flex: '1 1 auto', maxWidth: maxColumnWidth, minWidth: minColumnWidth }}>
                <Text pb={3} fontSize={'18px'} fontWeight={700}>
                  {addLiquidityView ? 'Token Pair' : 'Tokens'}
                </Text>
                <Text fontSize={'14px'} fontWeight={300} maxWidth={'300px'}>
                  Which token pair would you like to add liquidity to.
                </Text>
              </Box>
              <Box sx={{ flex: '1 1 auto' }}>
                <ChooseTokens
                  currencies={currencies}
                  currencyIdA={currencyIdA}
                  currencyIdB={currencyIdB}
                  handleCurrencyASelect={handleCurrencyASelect}
                  handleCurrencyBSelect={handleCurrencyBSelect}
                />
              </Box>
            </Flex>

            <Flex flexDirection={['column', 'row']} pb={5} sx={{ justifyContent: 'space-between', gap: [4, 2, 0] }}>
              <Box sx={{ flex: '1 1 auto', maxWidth: maxColumnWidth, minWidth: minColumnWidth }}>
                <Text pb={3} fontSize={'18px'} fontWeight={700}>
                  Fee tier
                </Text>
                <Text fontSize={'14px'} fontWeight={300} maxWidth={'300px'}>
                  {addLiquidityView
                    ? 'Select a fee tier. Typically, lower fee tiers are more suitable for stablecoin pairs, while higher fee tiers are better suited for pairs involving exotic coins.'
                    : 'The effectiveness of fee tiers varies based on the volatility of your pair. Lower fee tiers are typically more effective for stablecoin pairs, while higher fee tiers are better suited for pairs with exotic coins.'}
                </Text>
              </Box>
              <Box sx={{ flex: '1 1 auto' }}>
                <ChooseFeeTier feeUserInput={feeUserInput} setFeeUserInput={setFeeUserInput} />
              </Box>
            </Flex>

            <Flex flexDirection={['column', 'row']} pb={5} sx={{ justifyContent: 'space-between', gap: [4, 2, 0] }}>
              <Box sx={{ flex: '1 1 auto', maxWidth: maxColumnWidth, minWidth: minColumnWidth }}>
                <Text pb={3} fontSize={'18px'} fontWeight={700}>
                  {addLiquidityView ? 'Set price range' : `Set starting ${baseCurrency?.symbol} Price`}
                </Text>
                <Text fontSize={'14px'} fontWeight={300} maxWidth={'300px'}>
                  {addLiquidityView
                    ? 'Choose a price range within which to provide liquidity. You will not earn fees if prices fall outside this selected range.'
                    : 'Before you can add liquidity, this pool needs to be initialized. Begin by selecting a starting price for the pool. Next, define your liquidity price range and the amount you wish to deposit. Note that gas fees will be higher than usual for the initialization transaction.'}
                </Text>
              </Box>
              <Box sx={{ flex: '1 1 auto' }}>
                <LiquidityPriceRange
                  price={price}
                  error={chartDataError}
                  feeAmount={feeAmount}
                  currencies={currencies}
                  noLiquidity={noLiquidity}
                  invertPrice={invertPrice}
                  ticksAtLimit={ticksAtLimit}
                  baseCurrency={baseCurrency}
                  quoteCurrency={quoteCurrency}
                  pricesAtTicks={pricesAtTicks}
                  pricesAtLimit={pricesAtLimit}
                  formattedData={formattedData}
                  isInitialized={isInitialized}
                  getSetFullRange={getSetFullRange}
                  chartDataLoading={chartDataLoading}
                  onBothRangeInput={onBothRangeInput}
                  onLeftRangeInput={onLeftRangeInput}
                  onRightRangeInput={onRightRangeInput}
                  getDecrementLower={getDecrementLower}
                  getIncrementLower={getIncrementLower}
                  getDecrementUpper={getDecrementUpper}
                  getIncrementUpper={getIncrementUpper}
                  onStartPriceInput={onStartPriceInput}
                  leftRangeTypedValue={leftRangeTypedValue}
                  startPriceTypedValue={startPriceTypedValue}
                  rightRangeTypedValue={rightRangeTypedValue}
                  hasExistingPosition={hasExistingPosition}
                />
              </Box>
            </Flex>

            <Flex flexDirection={['column', 'row']} pb={5} sx={{ justifyContent: 'space-between', gap: [4, 2, 0] }}>
              <Box sx={{ flex: '1 1 auto', maxWidth: maxColumnWidth, minWidth: minColumnWidth }}>
                <Text pb={3} fontSize={'18px'} fontWeight={700}>
                  Liquidity
                </Text>
                <Text fontSize={'14px'} fontWeight={300} maxWidth={'300px'}>
                  The ratio of tokens supplied for this position may not always be 50:50, depending on the range you
                  select.
                </Text>
              </Box>
              <Box sx={{ flex: '1 1 auto' }}>
                <LiquidityInput
                  currencies={currencies}
                  noLiquidity={noLiquidity}
                  currencyIdA={currencyIdA}
                  currencyIdB={currencyIdB}
                  onFieldAInput={onFieldAInput}
                  onFieldBInput={onFieldBInput}
                  parsedAmounts={parsedAmounts}
                  hasValidMinMax={hasValidMinMax}
                  formattedAmounts={formattedAmounts}
                  depositADisabled={depositADisabled}
                  depositBDisabled={depositBDisabled}
                  hasStartingPrice={hasStartingPrice}
                  handleCurrencyASelect={handleCurrencyASelect}
                  handleCurrencyBSelect={handleCurrencyBSelect}
                />
              </Box>
            </Flex>

            <Flex
              flexDirection={['column', 'row']}
              pb={approvalA === ApprovalState.NOT_APPROVED || approvalB === ApprovalState.NOT_APPROVED ? 4 : 0}
              sx={{ justifyContent: 'space-between' }}
            >
              <Box sx={{ flex: '1 1 auto', maxWidth: maxColumnWidth, minWidth: minColumnWidth }}></Box>
              <Box sx={{ flex: '1 1 auto' }}>
                {approvalA === ApprovalState.NOT_APPROVED && (
                  <Button variant={'primary'} onClick={() => approveACallback()} mb={3}>
                    Approve {baseCurrency?.symbol}
                  </Button>
                )}
                {approvalB === ApprovalState.NOT_APPROVED && (
                  <Button variant={'primary'} onClick={() => approveBCallback()}>
                    Approve {currencyB?.symbol}
                  </Button>
                )}
              </Box>
            </Flex>

            <Flex flexDirection={['column', 'row']} pb={5} sx={{ justifyContent: 'space-between' }}>
              <Box sx={{ flex: '1 1 auto', maxWidth: maxColumnWidth, minWidth: minColumnWidth }}></Box>
              <Box sx={{ flex: '1 1 auto' }}>
                <CheckConnectionWrapper>
                  <Button
                    width={'100%'}
                    variant={error ? 'error' : 'primary'}
                    backgroundColor={!isInitialized ? undefined : error ?? 'gray500'}
                    onClick={() => {
                      expertMode ? onAdd() : setShowConfirm(true)
                    }}
                    disabled={approvalA === ApprovalState.NOT_APPROVED || approvalB === ApprovalState.NOT_APPROVED}
                  >
                    {getButtonText()}
                  </Button>
                </CheckConnectionWrapper>
              </Box>
            </Flex>
          </Card>
        </Page.Body>
      </Page>
    </AppBody>
  )
}
