import { maxBy, meanBy } from 'lodash'
import { Plus, Repeat } from 'react-feather'
import { BigNumber } from '@ethersproject/bignumber'
import { RouteComponentProps } from 'react-router-dom'
import { useCallback, useEffect, useState } from 'react'
import { Box, Button, Card, Flex, Text } from 'rebass/styled-components'
import { FeeAmount, NonfungiblePositionManager, Position } from '@voltage-finance/v3-sdk'
import { Currency, NONFUNGIBLE_POSITION_MANAGER_ADDRESSES, Percent, Token } from '@voltage-finance/sdk-core'

import Title from '../Title'
import AppBody from '../../AppBody'
import { useWeb3 } from '../../../hooks'
import { Field } from '../../../state/mint/actions'
import { useCurrency } from '../../../hooks/Tokens'
import useCurrencyAmountUSD from '../../../hooks/useUSDPrice'
import { POOL_PAGE_TABLE_FILTERS } from '../../Pool'
import { FUSE_GRAPH_TOKEN } from '../../../constants'
import { currencyId } from '../../../utils/currencyId'
import { Bound } from '../../../state/mint/v3/actions'
import { BackButton } from '../../../wrappers/BackButton'
import { IconDivider } from '../../../wrappers/IconDivider'
import { unwrappedToken } from '../../../utils/wrappedCurrency'
import { ApprovalButton } from '../../../wrappers/ApprovalButton'
import useIsTickAtLimit from '../../../hooks/v3/useIsTickAtLimit'
import { WRAPPED_NATIVE_CURRENCY } from '../../../constants/token'
import { OutOfRangeError } from '../AddLiquidityV3/OutOfRangeError'
import MultiCurrencyLogo from '../../../components/MultiCurrencyLogo'
import { useTransactionAdder } from '../../../state/transactions/hooks'
import { useV3PositionFromTokenId } from '../../../hooks/useV3Positions'
import { useIsExpertMode, useUserDeadline } from '../../../state/user/hooks'
import { useV3NFTPositionManagerContract } from '../../../hooks/useContract'
import { useDerivedPositionInfo } from '../../../hooks/useDerivedPositionInfo'
import { CurrencyInputDropdown } from '../../../wrappers/CurrencyInputDropdown'
import { CheckConnectionWrapper } from '../../../wrappers/CheckConnectionWrapper'
import { ApprovalState, useApproveCallback } from '../../../hooks/useApproveCallback'
import getPriceOrderingFromPosition from '../../../utils/getPriceOrderingFromPosition'
import TransactionConfirmationModalLegacy from '../../../modals/TransactionModalLegacy'
import { calculateGasMargin, formatFeeAmount, formatTickPrice, useInverter } from '../../../utils'
import { useV3DerivedMintInfo, useV3MintActionHandlers, useV3MintState } from '../../../state/mint/v3/hooks'

const DEFAULT_ADD_IN_RANGE_SLIPPAGE_TOLERANCE = new Percent(50, 10_000)

export default function AdjustLiquidityV3({
  match: {
    params: { currencyIdA, currencyIdB, feeAmount: feeAmountFromUrl, tokenId },
  },
  history,
}: RouteComponentProps<{
  history?: any
  currencyIdA?: string
  currencyIdB?: string
  feeAmount?: string
  tokenId?: string
}>) {
  const { chainId, account, library } = useWeb3()
  const positionManager = useV3NFTPositionManagerContract(true)

  // fee selection from url
  const feeAmount: FeeAmount | undefined =
    feeAmountFromUrl && Object.values(FeeAmount).includes(parseFloat(feeAmountFromUrl))
      ? parseFloat(feeAmountFromUrl)
      : undefined

  // check for existing position if tokenId in url
  const { position: existingPositionDetails, loading: positionLoading } = useV3PositionFromTokenId(
    tokenId ? BigNumber.from(tokenId) : undefined
  )
  const hasExistingPosition = !!existingPositionDetails && !positionLoading
  const { position: existingPosition } = useDerivedPositionInfo(existingPositionDetails)

  const baseCurrency = useCurrency(currencyIdA)
  const currencyB = useCurrency(currencyIdB)
  // prevent an error if they input ETH/WETH
  const quoteCurrency =
    baseCurrency && currencyB && baseCurrency.wrapped.equals(currencyB.wrapped) ? undefined : currencyB

  // mint state
  const { independentField, typedValue } = useV3MintState()

  const {
    position,
    currencies,
    outOfRange,
    noLiquidity,
    parsedAmounts,
    dependentField,
    depositADisabled,
    depositBDisabled,
    errorMessage: error,
  } = useV3DerivedMintInfo(
    baseCurrency ?? undefined,
    quoteCurrency ?? undefined,
    feeAmount,
    baseCurrency ?? undefined,
    existingPosition
  )

  const fiatValueTradeInput = useCurrencyAmountUSD(parsedAmounts[Field.CURRENCY_A])
  const fiatValueTradeOutput = useCurrencyAmountUSD(parsedAmounts[Field.CURRENCY_B])

  const currency0 = existingPosition?.pool?.token0 ? unwrappedToken(existingPosition?.pool?.token0) : undefined
  const currency1 = existingPosition?.pool?.token1 ? unwrappedToken(existingPosition?.pool?.token1) : undefined

  const pricesFromPosition = getPriceOrderingFromPosition(existingPosition)

  const [manuallyInverted, setManuallyInverted] = useState(false)

  const { priceLower, priceUpper, base } = useInverter({
    priceLower: pricesFromPosition.priceLower,
    priceUpper: pricesFromPosition.priceUpper,
    quote: pricesFromPosition.quote,
    base: pricesFromPosition.base,
    invert: manuallyInverted,
  })

  const inverted = baseCurrency && base ? base.equals(baseCurrency) : undefined
  const currencyQuote = inverted ? currency0 : currency1
  const currencyBase = inverted ? currency1 : currency0

  const tickAtLimit = useIsTickAtLimit(feeAmount, existingPosition?.tickLower, existingPosition?.tickUpper)

  const positionValueUpper = existingPosition?.amount1
  const positionValueLower = existingPosition?.amount0

  const expertMode = useIsExpertMode()

  const { onFieldAInput, onFieldBInput } = useV3MintActionHandlers(noLiquidity)
  // modal and loading
  const [showConfirm, setShowConfirm] = useState<boolean>(false)

  // redirect
  const [shouldRedirect, setShouldRedirect] = useState<boolean>(false)

  const [deadline] = useUserDeadline()
  const deadlineFromNow = Math.ceil(Date.now() / 1000) + deadline

  const [txHash, setTxHash] = useState<string | undefined>(undefined)

  const addTransaction = useTransactionAdder()

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

  const [, setToken0] = useState(null)
  const [, setToken1] = useState(null)

  useEffect(() => {
    const currency0 = currencies[Field.CURRENCY_A] as any
    const currency1 = currencies[Field.CURRENCY_B] as any
    if (currency0 && currency1) {
      if (currency0?.symbol === 'FUSE') {
        setToken0(FUSE_GRAPH_TOKEN)
      }
      if (currency1?.symbol === 'FUSE') {
        setToken1(FUSE_GRAPH_TOKEN)
      }
      if (currency0?.address) {
        setToken0(
          new Token(currency0?.chainId, currency0?.address, currency0?.decimals, currency0?.symbol, currency0?.name)
        )
      }
      if (currency1?.address) {
        setToken1(
          new Token(currency1?.chainId, currency1?.address, currency1?.decimals, currency1?.symbol, currency1?.name)
        )
      }
    }
  }, [currencies])

  async function onAdd() {
    if (!chainId || !library || !account) {
      return
    }

    if (!positionManager || !baseCurrency || !quoteCurrency) {
      return
    }

    if (!existingPosition || !deadline) {
      return
    }

    const connectedChainId = await library.getSigner().getChainId()
    if (chainId !== connectedChainId) {
      throw new Error('Wrong chain')
    }

    const useNative = baseCurrency.isNative ? baseCurrency : quoteCurrency.isNative ? quoteCurrency : undefined

    let calldata
    let value
    if (hasExistingPosition && tokenId && position) {
      ;({ calldata, value } = NonfungiblePositionManager.addCallParameters(position, {
        tokenId,
        slippageTolerance: DEFAULT_ADD_IN_RANGE_SLIPPAGE_TOLERANCE,
        deadline: deadlineFromNow.toString(),
        useNative,
      }))
    } else {
      ;({ calldata, value } = NonfungiblePositionManager.addCallParameters(existingPosition, {
        slippageTolerance: DEFAULT_ADD_IN_RANGE_SLIPPAGE_TOLERANCE,
        recipient: account,
        deadline: deadlineFromNow.toString(),
        useNative,
        createPool: noLiquidity,
      }))
    }

    const txn = {
      to: NONFUNGIBLE_POSITION_MANAGER_ADDRESSES[chainId],
      data: calldata,
      value,
    }

    try {
      const gasEstimate = await library.getSigner().estimateGas(txn)

      const newTxn = {
        ...txn,
        gasLimit: calculateGasMargin(gasEstimate),
      }

      const tx = await library.getSigner().sendTransaction(newTxn)

      addTransaction(tx, {
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
      setTxHash(tx.hash)
    } catch (error: any) {
      setShowConfirm(false)
      console.error('Failed to send transaction', error)

      if (error?.code !== 4001) {
        console.error(error)
      }
    }
  }

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
        history.push(`/add/${idA}`)
      } else {
        history.push(`/add/${idA}/${idB}`)
      }
    },
    [handleCurrencySelect, currencyIdB, history]
  )

  const handleCurrencyBSelect = useCallback(
    (currencyBNew: Currency) => {
      const [idB, idA] = handleCurrencySelect(currencyBNew, currencyIdA)
      if (idA === undefined) {
        history.push(`/add/${idB}`)
      } else {
        history.push(`/add/${idA}/${idB}`)
      }
    },
    [handleCurrencySelect, currencyIdA, history]
  )

  const [currentPrice] = useState(0)
  const [data] = useState([])
  const max = (maxBy(data, 'amount') as any)?.amount
  const mean = meanBy(data, 'amount') as any

  const [, setRange] = useState([0, 0])

  useEffect(() => {
    if (max && mean) {
      setRange([Math.round(currentPrice + -5), Math.round(currentPrice + 5)])
    }
  }, [currentPrice, max, mean])

  const handleDismissConfirmation = useCallback(() => {
    setShowConfirm(false)

    if (txHash) {
      onFieldAInput('')
      setShouldRedirect(true)
    }

    setTxHash('')
  }, [onFieldAInput, txHash])

  useEffect(() => {
    if (shouldRedirect && !showConfirm) {
      history.push(`/pool?filter=${POOL_PAGE_TABLE_FILTERS.MY_POSITIONS.key}`)
      setShouldRedirect(false)
    }
  }, [shouldRedirect, showConfirm])

  return (
    <>
      <TransactionConfirmationModalLegacy
        isOpen={showConfirm}
        hash={txHash}
        onDismiss={handleDismissConfirmation}
        header="Adjust Liquidity V3"
        onConfirm={onAdd}
        transactionDetails={[]}
        tradeDetails={[]}
      />

      <AppBody>
        <BackButton />

        <Title currencyA={baseCurrency} currencyB={currencyB} />

        <Flex pt={3} width={'100%'} flexDirection={['column', 'row']} sx={{ gap: 4 }}>
          <Flex sx={{ gap: 3 }} flexDirection={'column'} order={[1, 0]} width={[1, 10 / 16]}>
            <Card minHeight={467}>
              <Flex alignItems={'flex-start'} justifyContent={'space-between'} flexDirection={'row'}>
                <Text fontSize={3} fontWeight={700} pb={1}>
                  Pair Details
                </Text>
                {outOfRange ? (
                  <Box
                    backgroundColor={'grayLt'}
                    color={'secondary'}
                    width={90}
                    py={1}
                    fontWeight={700}
                    textAlign={'center'}
                    fontSize={1}
                    sx={{ borderRadius: 'rounded' }}
                  >
                    INACTIVE
                  </Box>
                ) : (
                  <Box
                    backgroundColor={'highlight'}
                    color={'secondary'}
                    width={80}
                    py={1}
                    fontWeight={700}
                    textAlign={'center'}
                    fontSize={1}
                    sx={{ borderRadius: 'rounded' }}
                  >
                    ACTIVE
                  </Box>
                )}
              </Flex>
              <Box mt={3} variant={'outline'}>
                <Flex px={3} width={'100%'} py={3} sx={{ gap: 3 }} flexDirection={'column'}>
                  <Flex alignItems={'center'} justifyContent={'space-between'} width={'100%'}>
                    <Flex sx={{ gap: 2 }} alignItems={'center'}>
                      <MultiCurrencyLogo size={'20'} tokenAddresses={[positionValueLower?.currency?.address]} />
                      <Text fontWeight={500} id="remove-liquidity-tokena-symbol">
                        {positionValueLower?.currency?.symbol}
                      </Text>
                    </Flex>
                    <Text fontWeight={500}>{positionValueLower?.toSignificant(4)}</Text>
                  </Flex>
                  <Flex alignItems={'center'} justifyContent={'space-between'} width={'100%'}>
                    <Flex sx={{ gap: 2 }} alignItems={'center'}>
                      <MultiCurrencyLogo size={'20'} tokenAddresses={[positionValueUpper?.currency?.address]} />
                      <Text fontSize={2} fontWeight={500} id="remove-liquidity-tokenb-symbol">
                        {positionValueUpper?.currency?.symbol}
                      </Text>
                    </Flex>
                    <Text fontWeight={500}>{positionValueUpper?.toSignificant(4)}</Text>
                  </Flex>
                </Flex>
                <IconDivider />
                <Flex alignItems={'center'} p={3} justifyContent={'space-between'} width={'100%'}>
                  <Text fontSize={2} fontWeight={500}>
                    Fee Tier
                  </Text>
                  <Text fontWeight={500}>{formatFeeAmount(feeAmount.toString())}%</Text>
                </Flex>
              </Box>
              <Flex justifyContent={'space-between'} alignItems={'center'} paddingY={3}>
                <Text fontSize={3} fontWeight={700} pb={1}>
                  Selected Range
                </Text>
                <Repeat height={'15px'} onClick={() => setManuallyInverted(!manuallyInverted)} />
              </Flex>
              <Box variant={'outline'}>
                <Flex px={3} width={'100%'} py={3} sx={{ gap: 3 }} flexDirection={'column'}>
                  <Flex alignItems={'center'} justifyContent={'space-between'} width={'100%'}>
                    <Text fontSize={2} fontWeight={500} id="remove-liquidity-tokena-symbol">
                      Min Price
                    </Text>
                    <Text fontWeight={500}>
                      {formatTickPrice(priceLower, tickAtLimit, Bound.LOWER)} {currencyQuote?.symbol} per{' '}
                      {currencyBase?.symbol}
                    </Text>
                  </Flex>

                  <Flex alignItems={'center'} justifyContent={'space-between'} width={'100%'}>
                    <Text fontSize={2} fontWeight={500} id="remove-liquidity-tokenb-symbol">
                      Max Price
                    </Text>

                    <Text fontWeight={500}>
                      {formatTickPrice(priceUpper, tickAtLimit, Bound.UPPER)} {currencyQuote?.symbol} per{' '}
                      {currencyBase?.symbol}
                    </Text>
                  </Flex>
                </Flex>
                <IconDivider />
                <Flex alignItems={'center'} p={3} justifyContent={'space-between'} width={'100%'}>
                  <Text fontSize={2} fontWeight={500}>
                    Current Price
                  </Text>
                  <Text fontWeight={500}>
                    {inverted
                      ? existingPosition?.pool?.token0Price?.toSignificant(4)
                      : existingPosition?.pool?.token1Price?.toSignificant(4)}{' '}
                    {currencyQuote?.symbol} per {currencyBase?.symbol}
                  </Text>
                </Flex>
              </Box>
            </Card>
          </Flex>

          <Card width={[1, 11 / 16]} height={'fit-content'} px={0}>
            <Text pl={3} pr={1} pb={3} fontSize={3} fontWeight={700}>
              Add Liquidity
            </Text>

            <Box px={3}>
              {depositADisabled ? (
                <OutOfRangeError />
              ) : (
                <CurrencyInputDropdown
                  value={formattedAmounts[Field.CURRENCY_A]}
                  onUserInput={onFieldAInput}
                  tokenAddress={currencyIdA}
                  onCurrencySelect={handleCurrencyASelect}
                  selectedCurrency={currencies[Field.CURRENCY_A]}
                  showCommonBases
                  listType="Swap"
                  onlyInput
                  showETH={true}
                  fiatValue={fiatValueTradeInput}
                />
              )}
            </Box>

            <Box py={3}>
              <IconDivider Icon={Plus} />
            </Box>

            <Box pt={3} px={3}>
              {depositBDisabled ? (
                <OutOfRangeError />
              ) : (
                <CurrencyInputDropdown
                  tokenAddress={currencyIdB}
                  value={formattedAmounts[Field.CURRENCY_B]}
                  onUserInput={onFieldBInput}
                  onCurrencySelect={handleCurrencyBSelect}
                  selectedCurrency={currencies[Field.CURRENCY_B]}
                  showCommonBases
                  listType="Swap"
                  showETH={true}
                  onlyInput
                  fiatValue={fiatValueTradeOutput}
                />
              )}
            </Box>

            <Box py={2} />

            <CheckConnectionWrapper>
              {(approvalA === ApprovalState.NOT_APPROVED ||
                approvalA === ApprovalState.PENDING ||
                approvalB === ApprovalState.NOT_APPROVED ||
                approvalB === ApprovalState.PENDING) &&
              !error ? (
                <Flex px={3} sx={{ gap: 2 }}>
                  {(approvalA === ApprovalState.NOT_APPROVED || approvalA === ApprovalState.PENDING) && (
                    <ApprovalButton
                      currencyToApprove={currencies[Field.CURRENCY_A]}
                      approveCallback={approveACallback}
                      approval={approvalA}
                    ></ApprovalButton>
                  )}
                  {(approvalB === ApprovalState.NOT_APPROVED || approvalB === ApprovalState.PENDING) && (
                    <ApprovalButton
                      currencyToApprove={currencies[Field.CURRENCY_B]}
                      approveCallback={approveBCallback}
                      approval={approvalB}
                    ></ApprovalButton>
                  )}
                </Flex>
              ) : (
                <Box px={3}>
                  <Button
                    width={'100%'}
                    variant={error ? 'error' : 'primary'}
                    onClick={() => {
                      expertMode ? onAdd() : setShowConfirm(true)
                    }}
                  >
                    {error ?? 'Supply'}
                  </Button>
                </Box>
              )}
            </CheckConnectionWrapper>
          </Card>
        </Flex>
      </AppBody>
    </>
  )
}
