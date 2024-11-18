import { Plus } from 'react-feather'
import { BigNumber } from '@ethersproject/bignumber'
import { RouteComponentProps } from 'react-router-dom'
import { useCallback, useEffect, useState } from 'react'
import { TransactionResponse } from '@ethersproject/providers'
import { Currency, Token, CurrencyAmount } from '@voltage-finance/sdk-core'

import About from '../About'
import Title from '../Title'
import { Prices } from '../Price'
import AppBody from '../../AppBody'
import SwapChart from '../../Swap/SwapChart'
import { useChain, useWeb3 } from '../../../hooks'
import { PairState } from '../../../data/Reserves'
import { useCurrency } from '../../../hooks/Tokens'
import { Field } from '../../../state/mint/actions'
import useCurrencyAmountUSD from '../../../hooks/useUSDPrice'
import { currencyId } from '../../../utils/currencyId'
import useAnalytics from '../../../hooks/useAnalytics'
import { BackButton } from '../../../wrappers/BackButton'
import { IconDivider } from '../../../wrappers/IconDivider'
import SwitchNetwork from '../../../components/SwitchNetwork'
import { maxAmountSpend } from '../../../utils/maxAmountSpend'
import { wrappedCurrency } from '../../../utils/wrappedCurrency'
import DoubleCurrencyLogo from '../../../components/DoubleLogo'
import { ApprovalButton } from '../../../wrappers/ApprovalButton'
import { WRAPPED_NATIVE_CURRENCY } from '../../../constants/token'
import TokenMigrationModal from '../../../modals/TokenMigrationModal'
import { useTransactionAdder } from '../../../state/transactions/hooks'
import { Box, Button, Card, Flex, Text } from 'rebass/styled-components'
import { CurrencyInputDropdown } from '../../../wrappers/CurrencyInputDropdown'
import { FUSE_GRAPH_TOKEN, GAS_PRICE, ROUTER_ADDRESS } from '../../../constants'
import { CheckConnectionWrapper } from '../../../wrappers/CheckConnectionWrapper'
import { WrappedTokenInfo, useSelectedSwapListUrl } from '../../../state/lists/hooks'
import { ApprovalState, useApproveCallback } from '../../../hooks/useApproveCallback'
import TransactionConfirmationModalLegacy from '../../../modals/TransactionModalLegacy'
import { calculateGasMargin, calculateSlippageAmount, getRouterContract } from '../../../utils'
import { useDerivedMintInfo, useMintActionHandlers, useMintState } from '../../../state/mint/hooks'
import { useIsExpertMode, useUserDeadline, useUserSlippageTolerance } from '../../../state/user/hooks'
import { useTransactionRejectedNotification } from '../../../hooks/notifications/useTransactionRejectedNotification'

export default function AddLiquidity({
  match: {
    params: { currencyIdA, currencyIdB },
  },
  history,
}: RouteComponentProps<{ history?: any; currencyIdA?: string; currencyIdB?: string }>) {
  const { account, chainId, library } = useWeb3()
  const { isHome } = useChain()
  const currencyA = useCurrency(currencyIdA)
  const currencyB = useCurrency(currencyIdB)

  const oneCurrencyIsWETH = Boolean(
    chainId &&
      ((currencyA && currencyA.equals(WRAPPED_NATIVE_CURRENCY[chainId])) ||
        (currencyB && currencyB.equals(WRAPPED_NATIVE_CURRENCY[chainId])))
  )

  const expertMode = useIsExpertMode()

  // mint state
  const { independentField, typedValue, otherTypedValue } = useMintState()
  const {
    dependentField,
    currencies,
    pair,
    pairState,
    currencyBalances,
    parsedAmounts,
    price,
    noLiquidity,
    liquidityMinted,
    poolTokenPercentage,
    error,
  } = useDerivedMintInfo(currencyA ?? undefined, currencyB ?? undefined)

  const fiatValueTradeInput = useCurrencyAmountUSD(parsedAmounts[Field.CURRENCY_A])
  const fiatValueTradeOutput = useCurrencyAmountUSD(parsedAmounts[Field.CURRENCY_B])

  const { onFieldAInput, onFieldBInput } = useMintActionHandlers(noLiquidity)
  const rejectTransaction = useTransactionRejectedNotification()
  // modal and loading
  const [showConfirm, setShowConfirm] = useState<boolean>(false)
  const list = useSelectedSwapListUrl()

  // migration modal
  const [migrateModalOpen, setMigrateModalOpen] = useState(false)
  const [migrationCurrency, setMigrationCurrency] = useState<Currency | undefined>()

  // txn values
  const [deadline] = useUserDeadline() // custom from users settings
  const [allowedSlippage] = useUserSlippageTolerance() // custom from users
  const [txHash, setTxHash] = useState<string | undefined>(undefined)

  // get formatted amounts
  const formattedAmounts = {
    [independentField]: typedValue,
    [dependentField]: noLiquidity ? otherTypedValue : parsedAmounts[dependentField]?.toSignificant(6) ?? '',
  }

  // get the max amounts user can add
  const maxAmounts: { [field in Field]?: CurrencyAmount<Currency> } = [Field.CURRENCY_A, Field.CURRENCY_B].reduce(
    (accumulator, field) => {
      return {
        ...accumulator,
        [field]: maxAmountSpend(currencyBalances[field]),
      }
    },
    {}
  )

  const atMaxAmounts: { [field in Field]?: CurrencyAmount<Currency> } = [Field.CURRENCY_A, Field.CURRENCY_B].reduce(
    (accumulator, field) => {
      return {
        ...accumulator,
        [field]: maxAmounts[field]?.equalTo(parsedAmounts[field] ?? '0'),
      }
    },
    {}
  )

  // check whether the user has approved the router on the tokens
  const [approvalA, approveACallback] = useApproveCallback(parsedAmounts[Field.CURRENCY_A], ROUTER_ADDRESS)
  const [approvalB, approveBCallback] = useApproveCallback(parsedAmounts[Field.CURRENCY_B], ROUTER_ADDRESS)

  const addTransaction = useTransactionAdder()

  const { sendEvent } = useAnalytics()

  const [token0, setToken0] = useState(null)
  const [token1, setToken1] = useState(null)

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
    if (!chainId || !library || !account) return
    const router = getRouterContract(chainId, library, account)

    const { [Field.CURRENCY_A]: parsedAmountA, [Field.CURRENCY_B]: parsedAmountB } = parsedAmounts
    if (!parsedAmountA || !parsedAmountB || !currencyA || !currencyB) {
      return
    }

    const amountsMin = {
      [Field.CURRENCY_A]: calculateSlippageAmount(parsedAmountA, noLiquidity ? 0 : allowedSlippage)[0],
      [Field.CURRENCY_B]: calculateSlippageAmount(parsedAmountB, noLiquidity ? 0 : allowedSlippage)[0],
    }

    const deadlineFromNow = Math.ceil(Date.now() / 1000) + deadline
    let estimate,
      method: (...args: any) => Promise<TransactionResponse>,
      args: Array<string | string[] | number>,
      value: BigNumber | null
    if (currencyA.isNative || currencyB.isNative) {
      const tokenBIsETH = currencyB.isNative
      estimate = router.estimateGas.addLiquidityETH
      method = router.addLiquidityETH
      args = [
        wrappedCurrency(tokenBIsETH ? currencyA : currencyB, chainId)?.address ?? '', // token
        (tokenBIsETH ? parsedAmountA : parsedAmountB).quotient.toString(), // token desired
        amountsMin[tokenBIsETH ? Field.CURRENCY_A : Field.CURRENCY_B].toString(), // token min
        amountsMin[tokenBIsETH ? Field.CURRENCY_B : Field.CURRENCY_A].toString(), // eth min
        account,
        deadlineFromNow,
      ]
      value = BigNumber.from((tokenBIsETH ? parsedAmountB : parsedAmountA).quotient.toString())
    } else {
      estimate = router.estimateGas.addLiquidity
      method = router.addLiquidity
      args = [
        wrappedCurrency(currencyA, chainId)?.address ?? '',
        wrappedCurrency(currencyB, chainId)?.address ?? '',
        parsedAmountA.quotient.toString(),
        parsedAmountB.quotient.toString(),
        amountsMin[Field.CURRENCY_A].toString(),
        amountsMin[Field.CURRENCY_B].toString(),
        account,
        deadlineFromNow,
      ]
      value = null
    }

    await estimate(...args, value ? { value } : {})
      .then((estimatedGas) =>
        method(...args, {
          ...(value ? { value } : {}),
          ...(isHome && GAS_PRICE && { gasPrice: GAS_PRICE }),
          gasLimit: calculateGasMargin(estimatedGas),
        }).then((response) => {
          addTransaction(response, {
            summary:
              'Add ' +
              parsedAmounts[Field.CURRENCY_A]?.toSignificant(3) +
              ' ' +
              currencies[Field.CURRENCY_A]?.symbol +
              ' and ' +
              parsedAmounts[Field.CURRENCY_B]?.toSignificant(3) +
              ' ' +
              currencies[Field.CURRENCY_B]?.symbol,
          })

          setTxHash(response.hash)

          const currencyA = currencies[Field.CURRENCY_A] as Token
          const currencyB = currencies[Field.CURRENCY_B] as Token
          sendEvent('Add Liquidity V2', {
            pair: [currencyA?.symbol, currencyB?.symbol].join('/'),
            token0: currencyA?.address?.toLowerCase(),
            token1: currencyB?.address?.toLowerCase(),
            amount0: parsedAmounts[Field.CURRENCY_A]?.toSignificant(3),
            amount1: parsedAmounts[Field.CURRENCY_B]?.toSignificant(3),
          })
        })
      )
      .catch((error: any) => {
        if (error?.code === 4001 || error?.code === 'ACTION_REJECTED') {
          rejectTransaction()
        }
        if (error?.code !== 4001) {
          console.log(error)
        }
      })
  }

  const handleCurrencyASelect = useCallback(
    (currencyA: Currency) => {
      const wrappedToken = currencyA as WrappedTokenInfo
      if (wrappedToken.isDeprecated) {
        setMigrationCurrency(currencyA)
        setMigrateModalOpen(true)
        return
      }

      const newCurrencyIdA = currencyId(currencyA)
      if (newCurrencyIdA === currencyIdB) {
        history.push(`/add/${currencyIdB}/${currencyIdA}`)
      } else {
        history.push(`/add/${newCurrencyIdA}/${currencyIdB}`)
      }
    },
    [currencyIdB, history, currencyIdA]
  )
  const handleCurrencyBSelect = useCallback(
    (currencyB: Currency) => {
      const wrappedToken = currencyB as WrappedTokenInfo
      if (wrappedToken.isDeprecated) {
        setMigrationCurrency(currencyB)
        setMigrateModalOpen(true)
        return
      }

      const newCurrencyIdB = currencyId(currencyB)
      if (currencyIdA === newCurrencyIdB) {
        if (currencyIdB) {
          history.push(`/add/${currencyIdB}/${newCurrencyIdB}`)
        } else {
          history.push(`/add/${newCurrencyIdB}`)
        }
      } else {
        history.push(`/add/${currencyIdA ? currencyIdA : 'FUSE'}/${newCurrencyIdB}`)
      }
    },
    [currencyIdA, history, currencyIdB]
  )

  const handleDismissConfirmation = useCallback(() => {
    setShowConfirm(false)
    // if there was a tx hash, we want to clear the input
    if (txHash) {
      onFieldAInput('')
    }
    setTxHash(undefined)
  }, [onFieldAInput, txHash])

  return (
    <>
      <SwitchNetwork />

      <TransactionConfirmationModalLegacy
        isOpen={showConfirm}
        onDismiss={handleDismissConfirmation}
        hash={txHash}
        header={noLiquidity ? 'You are creating a pool' : 'You will receive'}
        onConfirm={onAdd}
        addCurrency={
          pair &&
          new Token(
            pair?.liquidityToken?.chainId,
            pair?.liquidityToken?.address,
            pair?.liquidityToken?.decimals,
            currencies[Field.CURRENCY_A]?.symbol + '/' + currencies[Field.CURRENCY_B]?.symbol,
            currencies[Field.CURRENCY_A]?.symbol + '/' + currencies[Field.CURRENCY_B]?.symbol
          )
        }
        transactionDetails={[
          {
            header: currencies[Field.CURRENCY_A]?.symbol + ' Deposited',
            Component: () => <div>{parsedAmounts[Field.CURRENCY_A]?.toSignificant(6) || '0'}</div>,
          },
          {
            header: currencies[Field.CURRENCY_B]?.symbol + ' Deposited',

            Component: () => <div>{parsedAmounts[Field.CURRENCY_B]?.toSignificant(6) || '0'}</div>,
          },
          {
            header: 'Rates',
            Component: () => (
              <Flex style={{ gap: '4px' }} flexDirection={'column'}>
                <Box ml="auto" width={'fit-content'}>
                  {`1 ${currencies[Field.CURRENCY_A]?.symbol} = ${price?.toSignificant(4) || '0'} ${
                    currencies[Field.CURRENCY_B]?.symbol
                  }`}
                </Box>
                <Box ml="auto" width={'fit-content'}>
                  {`1 ${currencies[Field.CURRENCY_B]?.symbol} = ${price?.invert().toSignificant(4) || '0'} ${
                    currencies[Field.CURRENCY_A]?.symbol
                  }`}
                </Box>
              </Flex>
            ),
          },
          {
            header: 'Share of Pool',
            Component: () => <div>{noLiquidity ? '100' : poolTokenPercentage?.toSignificant(4) || '0'}%</div>,
          },
        ]}
        tradeDetails={[
          {
            amount: liquidityMinted?.toSignificant(6) || '0',
            symbol:
              (currencies[Field.CURRENCY_A]?.symbol || 'FUSE') + '/' + (currencies[Field.CURRENCY_B]?.symbol || 'FUSE'),
            LogoComponent: () => (
              <DoubleCurrencyLogo
                currency0={currencies[Field.CURRENCY_A]}
                currency1={currencies[Field.CURRENCY_B]}
                size={30}
              />
            ),
          },
        ]}
      />
      <TokenMigrationModal
        token={migrationCurrency}
        isOpen={migrateModalOpen}
        onDismiss={() => setMigrateModalOpen(false)}
        listType="Swap"
      />
      <AppBody>
        <BackButton path="/pool" />
        <Title currencyA={currencyA} currencyB={currencyB} />
        <Flex pt={4} width={'100%'} flexDirection={['column', 'row']} sx={{ gap: 4 }}>
          <Flex sx={{ gap: 3 }} flexDirection={'column'} order={[1, 0]} width={[1, 10 / 16]}>
            <SwapChart token0={token0} token1={token1} />
            {currencies[Field.CURRENCY_A] &&
              currencies[Field.CURRENCY_B] &&
              pairState !== PairState.INVALID &&
              price && (
                <Prices
                  currencies={[
                    {
                      currencyA: currencies[Field.CURRENCY_A],
                      currencyB: currencies[Field.CURRENCY_B],
                      price: price?.toSignificant(18),
                    },
                    {
                      currencyA: currencies[Field.CURRENCY_B],
                      currencyB: currencies[Field.CURRENCY_A],
                      price: price?.invert()?.toSignificant(18),
                    },
                  ]}
                />
              )}
            <About />
          </Flex>
          <Card width={[1, 7 / 16]} height={'fit-content'} px={0}>
            {/* {noLiquidity && (
                <Box px={3} pb={3}>
                  <Flex fontSize={1} fontWeight={500} flexDirection={'column'} sx={{ gap: 1 }}>
                    <Text>You are the first liquidity provider.</Text>
                    <Text>The ratio of tokens you add will set the price of this pool.</Text>
                    <Text>Once you are happy with the rate click supply to review.</Text>
                  </Flex>
                </Box>
              )} */}

            <Flex width="100%" flexDirection={'column'} style={{ gap: '4px' }}>
              <Flex pl={3} pr={1} justifyContent={'space-between'}>
                <Text pb={3} fontSize={3} fontWeight={700}>
                  Add Liquidity
                </Text>
              </Flex>
              <Box px={3}>
                <CurrencyInputDropdown
                  value={formattedAmounts[Field.CURRENCY_A]}
                  onUserInput={onFieldAInput}
                  tokenAddress={currencyIdA}
                  onCurrencySelect={handleCurrencyASelect}
                  selectedCurrency={currencies[Field.CURRENCY_A]}
                  showCommonBases
                  listType="Swap"
                  showETH={true}
                  fiatValue={fiatValueTradeInput}
                />
              </Box>

              <IconDivider Icon={() => <Plus />} />
              <Box pt={3} px={3}>
                <CurrencyInputDropdown
                  tokenAddress={currencyIdB}
                  value={formattedAmounts[Field.CURRENCY_B]}
                  onUserInput={onFieldBInput}
                  onCurrencySelect={handleCurrencyBSelect}
                  selectedCurrency={currencies[Field.CURRENCY_B]}
                  showCommonBases
                  listType="Swap"
                  showETH={true}
                  fiatValue={fiatValueTradeOutput}
                />
              </Box>
            </Flex>

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
                <CheckConnectionWrapper>
                  <Button
                    width={'100%'}
                    variant={error ? 'error' : 'primary'}
                    onClick={() => {
                      expertMode ? onAdd() : setShowConfirm(true)
                    }}
                  >
                    {error ?? 'Supply'}
                  </Button>
                </CheckConnectionWrapper>
              </Box>
            )}

            {/* {poolTokenPercentage && !error && (
              <Card.Footer>
                <Card.Text
                  title="Pool Share"
                  content={(poolTokenPercentage?.lessThan(ONE_BIPS) ? '<0.01' : poolTokenPercentage?.toFixed(2)) ?? '0'}
                />
              </Card.Footer>
            )} */}
          </Card>

          {/* {pair && !noLiquidity && pairState !== PairState.INVALID ? (
            <AutoColumn style={{ minWidth: '20rem', marginTop: '1rem', marginBottom: '10px' }}>
              <MinimalPositionCard showUnwrapped={oneCurrencyIsWETH} pair={pair} />
            </AutoColumn>
          ) : null} */}
        </Flex>
      </AppBody>
    </>
  )
}
