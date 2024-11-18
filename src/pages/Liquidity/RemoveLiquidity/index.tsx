import { BigNumber } from '@ethersproject/bignumber'
import { splitSignature } from '@ethersproject/bytes'
import { Contract } from '@ethersproject/contracts'
import { TransactionResponse } from '@ethersproject/providers'
import { Percent } from '@voltage-finance/sdk-core'
import { useCallback, useMemo, useState } from 'react'
import { ArrowDown, Plus } from 'react-feather'
import { RouteComponentProps } from 'react-router'
import { Box, Flex, Link, Text } from 'rebass/styled-components'
import Card from '../../../collections/Card'
import { AutoColumn } from '../../../components/Column'
import CurrencyLogo from '../../../components/Logo/CurrencyLogo'
import { MinimalPositionCard } from '../../../components/PositionCard'
import { GAS_PRICE, ROUTER_ADDRESS } from '../../../constants'
import { useWeb3, useChain } from '../../../hooks'
import { useCurrency } from '../../../hooks/Tokens'
import useAnalytics from '../../../hooks/useAnalytics'
import { ApprovalState, useApproveCallback } from '../../../hooks/useApproveCallback'
import { usePairContract } from '../../../hooks/useContract'
import TransactionConfirmationModalLegacy from '../../../modals/TransactionModalLegacy'
import { Field } from '../../../state/burn/actions'
import { useBurnActionHandlers, useBurnState, useDerivedBurnInfo } from '../../../state/burn/hooks'
import { useTransactionAdder } from '../../../state/transactions/hooks'
import { useUserDeadline, useUserSlippageTolerance } from '../../../state/user/hooks'
import { calculateGasMargin, calculateSlippageAmount, getRouterContract } from '../../../utils'
import { wrappedCurrency } from '../../../utils/wrappedCurrency'
import { ApprovalButton } from '../../../wrappers/ApprovalButton'
import { InputRow } from '../../../wrappers/InputRow'
import NoSelect from '../../../wrappers/NoSelect'
import { PercentageButton } from '../../../wrappers/PrecentageButton'
import AppBody from '../../AppBody'
import { Prices } from '../Price'
import { ERROR, useAddPopup } from '../../../state/application/hooks'
import { BackButton } from '../../../wrappers/BackButton'
import { CheckConnectionWrapper } from '../../../wrappers/CheckConnectionWrapper'
import MultiCurrencyLogo from '../../../components/MultiCurrencyLogo'
import { WRAPPED_NATIVE_CURRENCY } from '../../../constants/token'

export default function RemoveLiquidity({
  history,
  match: {
    params: { currencyIdA, currencyIdB },
  },
}: RouteComponentProps<{ currencyIdA: string; currencyIdB: string }>) {
  const [currencyA, currencyB] = [useCurrency(currencyIdA) ?? undefined, useCurrency(currencyIdB) ?? undefined]
  const { account, chainId, library } = useWeb3()
  const [tokenA, tokenB] = useMemo(
    () => [wrappedCurrency(currencyA, chainId), wrappedCurrency(currencyB, chainId)],
    [currencyA, currencyB, chainId]
  )

  const { isHome } = useChain()

  // burn state
  const { independentField, typedValue } = useBurnState()
  const { pair, parsedAmounts, error } = useDerivedBurnInfo(currencyA ?? undefined, currencyB ?? undefined)
  const { onUserInput: _onUserInput } = useBurnActionHandlers()

  // modal and loading
  const [showConfirm, setShowConfirm] = useState<boolean>(false)

  // txn values
  const [txHash, setTxHash] = useState<string | undefined>(undefined)
  const [deadline] = useUserDeadline()
  const [allowedSlippage] = useUserSlippageTolerance()

  const formattedAmounts = {
    [Field.LIQUIDITY_PERCENT]: parsedAmounts[Field.LIQUIDITY_PERCENT].equalTo('0')
      ? '0'
      : parsedAmounts[Field.LIQUIDITY_PERCENT].lessThan(new Percent('1', '100'))
      ? '<1'
      : parsedAmounts[Field.LIQUIDITY_PERCENT].toFixed(0),
    [Field.LIQUIDITY]:
      independentField === Field.LIQUIDITY ? typedValue : parsedAmounts[Field.LIQUIDITY]?.toSignificant(6) ?? '',
    [Field.CURRENCY_A]:
      independentField === Field.CURRENCY_A ? typedValue : parsedAmounts[Field.CURRENCY_A]?.toSignificant(6) ?? '',
    [Field.CURRENCY_B]:
      independentField === Field.CURRENCY_B ? typedValue : parsedAmounts[Field.CURRENCY_B]?.toSignificant(6) ?? '',
  }

  // pair contract
  const pairContract: Contract | null = usePairContract(pair?.liquidityToken?.address)

  // allowance handling
  const [signatureData, setSignatureData] = useState<{ v: number; r: string; s: string; deadline: number } | null>(null)
  const [approval, approveCallback] = useApproveCallback(parsedAmounts[Field.LIQUIDITY], ROUTER_ADDRESS)
  const addPopup = useAddPopup()
  async function onAttemptToApprove() {
    if (!pairContract || !pair || !library) throw new Error('missing dependencies')
    const liquidityAmount = parsedAmounts[Field.LIQUIDITY]
    if (!liquidityAmount) throw new Error('missing liquidity amount')
    // try to gather a signature for permission
    const nonce = await pairContract.nonces(account)

    const deadlineForSignature: number = Math.ceil(Date.now() / 1000) + deadline

    const EIP712Domain = [
      { name: 'name', type: 'string' },
      { name: 'version', type: 'string' },
      { name: 'chainId', type: 'uint256' },
      { name: 'verifyingContract', type: 'address' },
    ]
    const domain = {
      name: 'Voltage LP Token',
      version: '1',
      chainId: chainId,
      verifyingContract: pair.liquidityToken.address,
    }
    const Permit = [
      { name: 'owner', type: 'address' },
      { name: 'spender', type: 'address' },
      { name: 'value', type: 'uint256' },
      { name: 'nonce', type: 'uint256' },
      { name: 'deadline', type: 'uint256' },
    ]
    const message = {
      owner: account,
      spender: ROUTER_ADDRESS,
      value: liquidityAmount.quotient.toString(),
      nonce: nonce.toHexString(),
      deadline: deadlineForSignature,
    }
    const data = JSON.stringify({
      types: {
        EIP712Domain,
        Permit,
      },
      domain,
      primaryType: 'Permit',
      message,
    })

    library
      .send('eth_signTypedData_v4', [account, data])
      .then(splitSignature)
      .then((signature: any) => {
        setSignatureData({
          v: signature.v,
          r: signature.r,
          s: signature.s,
          deadline: deadlineForSignature,
        })
      })
      .catch((error: any) => {
        console.log(error?.code, 'error?.code')
        // for all errors other than 4001 (EIP-1193 user rejected request), fall back to manual approve
        if (error?.code !== 4001) {
          approveCallback()
        }
      })
  }

  // wrapped onUserInput to clear signatures
  const onUserInput = useCallback(
    (field: Field, typedValue: string) => {
      setSignatureData(null)
      return _onUserInput(field, typedValue)
    },
    [_onUserInput]
  )

  // tx sending
  const addTransaction = useTransactionAdder()
  const { sendEvent } = useAnalytics()
  async function onRemove() {
    if (!chainId || !library || !account) throw new Error('missing dependencies')
    const { [Field.CURRENCY_A]: currencyAmountA, [Field.CURRENCY_B]: currencyAmountB } = parsedAmounts
    if (!currencyAmountA || !currencyAmountB) {
      throw new Error('missing currency amounts')
    }
    const router = getRouterContract(chainId, library, account)

    const amountsMin = {
      [Field.CURRENCY_A]: calculateSlippageAmount(currencyAmountA, allowedSlippage)[0],
      [Field.CURRENCY_B]: calculateSlippageAmount(currencyAmountB, allowedSlippage)[0],
    }

    if (!currencyA || !currencyB) throw new Error('missing tokens')
    const liquidityAmount = parsedAmounts[Field.LIQUIDITY]
    if (!liquidityAmount) throw new Error('missing liquidity amount')

    const currencyBIsETH = currencyB.isNative
    const oneCurrencyIsETH = currencyA.isNative || currencyBIsETH
    const deadlineFromNow = Math.ceil(Date.now() / 1000) + deadline

    if (!tokenA || !tokenB) throw new Error('could not wrap')

    let methodNames: string[], args: Array<string | string[] | number | boolean>
    // we have approval, use normal remove liquidity
    if (approval === ApprovalState.APPROVED) {
      // removeLiquidityETH
      if (oneCurrencyIsETH) {
        methodNames = ['removeLiquidityETH', 'removeLiquidityETHSupportingFeeOnTransferTokens']
        args = [
          currencyBIsETH ? tokenA.address : tokenB.address,
          liquidityAmount.quotient.toString(),
          amountsMin[currencyBIsETH ? Field.CURRENCY_A : Field.CURRENCY_B].toString(),
          amountsMin[currencyBIsETH ? Field.CURRENCY_B : Field.CURRENCY_A].toString(),
          account,
          deadlineFromNow,
        ]
      }
      // removeLiquidity
      else {
        methodNames = ['removeLiquidity']
        args = [
          tokenA.address,
          tokenB.address,
          liquidityAmount.quotient.toString(),
          amountsMin[Field.CURRENCY_A].toString(),
          amountsMin[Field.CURRENCY_B].toString(),
          account,
          deadlineFromNow,
        ]
      }
    }
    // we have a signataure, use permit versions of remove liquidity
    else if (signatureData !== null) {
      // removeLiquidityETHWithPermit
      if (oneCurrencyIsETH) {
        methodNames = ['removeLiquidityETHWithPermit', 'removeLiquidityETHWithPermitSupportingFeeOnTransferTokens']
        args = [
          currencyBIsETH ? tokenA.address : tokenB.address,
          liquidityAmount.quotient.toString(),
          amountsMin[currencyBIsETH ? Field.CURRENCY_A : Field.CURRENCY_B].toString(),
          amountsMin[currencyBIsETH ? Field.CURRENCY_B : Field.CURRENCY_A].toString(),
          account,
          signatureData.deadline,
          false,
          signatureData.v,
          signatureData.r,
          signatureData.s,
        ]
      }
      // removeLiquidityETHWithPermit
      else {
        methodNames = ['removeLiquidityWithPermit']
        args = [
          tokenA.address,
          tokenB.address,
          liquidityAmount.quotient.toString(),
          amountsMin[Field.CURRENCY_A].toString(),
          amountsMin[Field.CURRENCY_B].toString(),
          account,
          signatureData.deadline,
          false,
          signatureData.v,
          signatureData.r,
          signatureData.s,
        ]
      }
    } else {
      throw new Error('Attempting to confirm without approval or a signature. Please contact support.')
    }

    const safeGasEstimates: (BigNumber | undefined)[] = await Promise.all(
      methodNames.map((methodName) =>
        router.estimateGas[methodName](...args)
          .then(calculateGasMargin)
          .catch((error) => {
            console.error(`estimateGas failed`, methodName, args, error)
            return undefined
          })
      )
    )

    const indexOfSuccessfulEstimation = safeGasEstimates.findIndex((safeGasEstimate) =>
      BigNumber.isBigNumber(safeGasEstimate)
    )

    // all estimations failed...
    if (indexOfSuccessfulEstimation === -1) {
      console.error('This transaction would fail. Please contact support.')
    } else {
      const methodName = methodNames[indexOfSuccessfulEstimation]
      const safeGasEstimate = safeGasEstimates[indexOfSuccessfulEstimation]

      await router[methodName](...args, {
        ...(isHome && GAS_PRICE && { gasPrice: GAS_PRICE }),
        gasLimit: safeGasEstimate,
      })
        .then((response: TransactionResponse) => {
          addTransaction(response, {
            summary:
              'Remove ' +
              parsedAmounts[Field.CURRENCY_A]?.toSignificant(3) +
              ' ' +
              currencyA?.symbol +
              ' and ' +
              parsedAmounts[Field.CURRENCY_B]?.toSignificant(3) +
              ' ' +
              currencyB?.symbol,
          })

          setTxHash(response.hash)

          sendEvent('Remove Liquidity V2', {
            pair: [currencyA?.symbol, currencyB?.symbol].join('/'),
            token0: (currencyA as any)?.address?.toLowerCase(),
            token1: (currencyB as any)?.address?.toLowerCase(),
            amount0: parsedAmounts[Field.CURRENCY_A]?.toSignificant(3),
            amount1: parsedAmounts[Field.CURRENCY_B]?.toSignificant(3),
          })
        })
        .catch((error: any) => {
          if (error?.code === 4001 || error?.code === 'ACTION_REJECTED') {
            addPopup({ error: { summary: ERROR.TRANSACTION_REJECTED } })
          }
          if (error.code !== 4001) {
          }

          // we only care if the error is something _other_ than the user rejected the tx
          console.error(error)
        })
    }
  }

  const oneCurrencyIsETH = currencyA.isNative || currencyB.isNative
  const oneCurrencyIsWETH = Boolean(
    chainId &&
      ((currencyA && WRAPPED_NATIVE_CURRENCY[chainId].equals(currencyA)) ||
        (currencyB && WRAPPED_NATIVE_CURRENCY[chainId].equals(currencyB)))
  )
  const handleDismissConfirmation = useCallback(() => {
    setShowConfirm(false)
    setSignatureData(null) // important that we clear signature data to avoid bad sigs
    // if there was a tx hash, we want to clear the input
    if (txHash) {
      onUserInput(Field.LIQUIDITY_PERCENT, '0')
    }
    setTxHash(undefined)
  }, [onUserInput, txHash])

  return (
    <>
      <TransactionConfirmationModalLegacy
        isOpen={showConfirm}
        onDismiss={handleDismissConfirmation}
        hash={txHash ? txHash : ''}
        header="You will receive"
        onConfirm={onRemove}
        transactionDetails={[
          {
            header: `${'UNI ' + currencyA?.symbol + '/' + currencyB?.symbol} Burned`,
            Component: () => <div>{parsedAmounts[Field.LIQUIDITY]?.toSignificant(6) || '0'}</div>,
          },
          {
            header: `Price`,
            Component: () => (
              <Flex flexDirection={'column'}>
                <Box ml="auto" width={'fit-content'}>
                  1 {currencyA?.symbol} = {tokenA ? pair?.priceOf(tokenA).toSignificant(6) : '-'} {currencyB?.symbol}
                </Box>
                <Box ml="auto" width="fit-content">
                  1 {currencyB?.symbol} = {tokenB ? pair?.priceOf(tokenB).toSignificant(6) : '-'} {currencyA?.symbol}
                </Box>
              </Flex>
            ),
          },
        ]}
        tradeDetails={[
          {
            amount: parsedAmounts[Field.CURRENCY_A]?.toSignificant(6) || '0',
            symbol: currencyA?.symbol || 'FUSE',
            LogoComponent: () => <CurrencyLogo currency={currencyA} />,
            SeperatorComponent: () => <Plus />,
          },
          {
            amount: parsedAmounts[Field.CURRENCY_B]?.toSignificant(6) || '0',
            symbol: currencyB?.symbol || 'FUSE',
            LogoComponent: () => <CurrencyLogo currency={currencyB} />,
          },
        ]}
      />
      <AppBody>
        <BackButton />
        <Box width={[1, 450]} mx="auto">
          <Card>
            <Card.Header>Remove Liquidity</Card.Header>
            <Card.Body>
              <Box>
                <Flex alignItems={'center'} width={'100%'} flexDirection={'column'}>
                  <Flex height={45} width={'100%'} style={{ gap: '8px' }}>
                    <PercentageButton
                      width={1 / 4}
                      amount={25}
                      onClick={() => onUserInput(Field.LIQUIDITY_PERCENT, '25')}
                      active={formattedAmounts[Field.LIQUIDITY_PERCENT] === '25'}
                    />
                    <PercentageButton
                      width={1 / 4}
                      amount={50}
                      active={formattedAmounts[Field.LIQUIDITY_PERCENT] === '50'}
                      onClick={() => onUserInput(Field.LIQUIDITY_PERCENT, '50')}
                    />
                    <PercentageButton
                      fontSize={1}
                      width={1 / 4}
                      active={formattedAmounts[Field.LIQUIDITY_PERCENT] === '75'}
                      amount={75}
                      onClick={() => onUserInput(Field.LIQUIDITY_PERCENT, '75')}
                    />
                    <PercentageButton
                      width={1 / 4}
                      amount={100}
                      active={formattedAmounts[Field.LIQUIDITY_PERCENT] === '100'}
                      onClick={() => onUserInput(Field.LIQUIDITY_PERCENT, '100')}
                    />
                  </Flex>
                  <Box py={2}>
                    <ArrowDown strokeWidth={1} size="18" />
                  </Box>
                  <InputRow height={'fit-content'}>
                    <Flex width={'100%'} py={3} sx={{ gap: 3 }} flexDirection={'column'}>
                      <Flex alignItems={'center'} justifyContent={'space-between'} width={'100%'}>
                        <Flex sx={{ gap: 2 }} alignItems={'center'}>
                          <MultiCurrencyLogo size={'20'} tokenAddresses={[currencyIdA]} />
                          <Text fontWeight={500} id="remove-liquidity-tokena-symbol">
                            {currencyA?.symbol}
                          </Text>
                        </Flex>
                        <Text fontWeight={500}>{formattedAmounts[Field.CURRENCY_A] || '-'}</Text>
                      </Flex>
                      <Flex alignItems={'center'} justifyContent={'space-between'} width={'100%'}>
                        <Flex sx={{ gap: 2 }} alignItems={'center'}>
                          <MultiCurrencyLogo size={'20'} tokenAddresses={[currencyIdB]} />
                          <Text fontSize={2} fontWeight={500} id="remove-liquidity-tokenb-symbol">
                            {currencyB?.symbol}
                          </Text>
                        </Flex>
                        <Text fontWeight={500}>{formattedAmounts[Field.CURRENCY_B] || '-'}</Text>
                      </Flex>
                    </Flex>
                  </InputRow>

                  <Box width={'100%'} py={4}>
                    <Prices
                      currencies={[
                        {
                          currencyA: currencyA,
                          currencyB: currencyB,
                          price: tokenA && pair?.priceOf(tokenA).toSignificant(18),
                        },
                        {
                          currencyA: currencyB,
                          currencyB: currencyA,
                          price: tokenB && pair?.priceOf(tokenB).toSignificant(18),
                        },
                      ]}
                    />
                  </Box>
                </Flex>

                <CheckConnectionWrapper>
                  <ApprovalButton
                    currencyToApprove={pair?.liquidityToken}
                    approveCallback={approveCallback}
                    approval={approval}
                    error={error}
                    onClick={() => {
                      setShowConfirm(true)
                    }}
                  >
                    Remove
                  </ApprovalButton>
                </CheckConnectionWrapper>
              </Box>
            </Card.Body>
            {chainId && (oneCurrencyIsWETH || oneCurrencyIsETH) && (
              <Card.Footer>
                <Flex fontSize={2} style={{ justifyContent: 'flex-end' }}>
                  <NoSelect>
                    <Link
                      onClick={() => {
                        if (oneCurrencyIsETH) {
                          history.push(
                            `/remove/${currencyA.isNative ? WRAPPED_NATIVE_CURRENCY[chainId].address : currencyIdA}/${
                              currencyB.isNative ? WRAPPED_NATIVE_CURRENCY[chainId].address : currencyIdB
                            }`
                          )
                        }

                        if (oneCurrencyIsWETH) {
                          history.push(
                            `/remove/${
                              currencyA && currencyA.equals(WRAPPED_NATIVE_CURRENCY[chainId]) ? 'FUSE' : currencyIdA
                            }/${currencyB && currencyB.equals(WRAPPED_NATIVE_CURRENCY[chainId]) ? 'FUSE' : currencyIdB}`
                          )
                        }
                      }}
                    >
                      {oneCurrencyIsETH ? 'Receive WFUSE' : 'Receive FUSE'}
                    </Link>
                  </NoSelect>
                </Flex>
              </Card.Footer>
            )}
          </Card>

          {pair ? (
            <AutoColumn style={{ minWidth: '20rem', marginTop: '1rem' }}>
              <MinimalPositionCard showUnwrapped={oneCurrencyIsWETH} pair={pair} />
            </AutoColumn>
          ) : null}
        </Box>
      </AppBody>
    </>
  )
}
