import { useHistory } from 'react-router-dom'
import { ArrowDown, Plus } from 'react-feather'
import { RouteComponentProps } from 'react-router'
import { useCallback, useEffect, useState } from 'react'
import { CurrencyAmount, Percent } from '@voltage-finance/sdk-core'
import { Box, Flex, Card, Text, Button } from 'rebass/styled-components'
import { FeeAmount, NonfungiblePositionManager } from '@voltage-finance/v3-sdk'

import Title from '../Title'
import AppBody from '../../AppBody'
import { useWeb3 } from '../../../hooks'
import { PairDetails } from '../PairDetails'
import { useCurrency } from '../../../hooks/Tokens'
import { calculateGasMargin } from '../../../utils'
import { POOL_PAGE_TABLE_FILTERS } from '../../Pool'
import useAnalytics from '../../../hooks/useAnalytics'
import { BackButton } from '../../../wrappers/BackButton'
import { IconDivider } from '../../../wrappers/IconDivider'
import { useUserDeadline } from '../../../state/user/hooks'
import CurrencyLogo from '../../../components/Logo/CurrencyLogo'
import MultiCurrencyLogo from '../../../components/MultiCurrencyLogo'
import { PercentageButton } from '../../../wrappers/PrecentageButton'
import { useTransactionAdder } from '../../../state/transactions/hooks'
import { useV3PositionFromTokenId } from '../../../hooks/useV3Positions'
import { useV3NFTPositionManagerContract } from '../../../hooks/useContract'
import { CheckConnectionWrapper } from '../../../wrappers/CheckConnectionWrapper'
import TransactionConfirmationModalLegacy from '../../../modals/TransactionModalLegacy'
import { useBurnV3ActionHandlers, useBurnV3State, useDerivedV3BurnInfo } from '../../../state/burn/v3/hooks'

const DEFAULT_ADD_IN_RANGE_SLIPPAGE_TOLERANCE = new Percent(50, 10_000)

export default function RemoveLiquidityV3({
  match: {
    params: { tokenId, feeAmount: feeAmountFromUrl },
  },
}: RouteComponentProps<any>) {
  const positionManager = useV3NFTPositionManagerContract(true)
  const history = useHistory()
  const { position } = useV3PositionFromTokenId(tokenId)

  const { token0: currencyIdA, token1: currencyIdB } = position || {}
  const feeAmount: FeeAmount | undefined =
    feeAmountFromUrl && Object.values(FeeAmount).includes(parseFloat(feeAmountFromUrl))
      ? parseFloat(feeAmountFromUrl)
      : undefined

  const [currencyA, currencyB] = [useCurrency(currencyIdA) ?? undefined, useCurrency(currencyIdB) ?? undefined]

  const { account, chainId, library } = useWeb3()

  // burn state
  const { percent } = useBurnV3State()
  const {
    position: positionSDK,
    liquidityPercentage,
    liquidityValue0,
    liquidityValue1,
    feeValue0,
    feeValue1,
    outOfRange,
    error,
  } = useDerivedV3BurnInfo(position, false)

  const { onPercentSelect } = useBurnV3ActionHandlers()

  // modal and loading
  const [showConfirm, setShowConfirm] = useState<boolean>(false)

  // redirect
  const [shouldRedirect, setShouldRedirect] = useState<boolean>(false)

  // txn values
  const [txHash, setTxHash] = useState<string | undefined>(undefined)

  const [deadline] = useUserDeadline()
  const deadlineFromNow = Math.ceil(Date.now() / 1000) + deadline

  // tx sending
  const addTransaction = useTransactionAdder()

  const { sendEvent } = useAnalytics()

  const onRemove = useCallback(async () => {
    if (
      !positionManager ||
      !liquidityValue0 ||
      !liquidityValue1 ||
      !deadlineFromNow ||
      !account ||
      !chainId ||
      !positionSDK ||
      !liquidityPercentage ||
      !library
    ) {
      return
    }

    const { calldata, value } = NonfungiblePositionManager.removeCallParameters(positionSDK, {
      tokenId: tokenId.toString(),
      liquidityPercentage,
      slippageTolerance: DEFAULT_ADD_IN_RANGE_SLIPPAGE_TOLERANCE,
      deadline: deadlineFromNow.toString(),
      collectOptions: {
        expectedCurrencyOwed0: feeValue0 ?? CurrencyAmount.fromRawAmount(liquidityValue0.currency, 0),
        expectedCurrencyOwed1: feeValue1 ?? CurrencyAmount.fromRawAmount(liquidityValue1.currency, 0),
        recipient: account,
      },
    })

    const txn = {
      to: positionManager.address,
      data: calldata,
      value,
    }

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
          .then((response: any) => {
            addTransaction(response, {
              summary:
                'Remove V3 ' +
                liquidityValue0?.toSignificant(3) +
                ' ' +
                liquidityValue0?.currency?.symbol +
                ' and ' +
                liquidityValue1?.toSignificant(3) +
                ' ' +
                liquidityValue1?.currency?.symbol,
            })
            sendEvent('Remove Liquidity V3', {
              currencyAAmount: liquidityValue0?.toSignificant(3),
              currencyBAmount: liquidityValue1?.toSignificant(3),
              currencyA: liquidityValue0?.currency?.symbol,
              currencyB: liquidityValue1?.currency?.symbol,
            })
            setTxHash(response.hash)
          })
      })
      .catch((error) => {
        setShowConfirm(false)
        console.error(error)
      })
  }, [
    account,
    addTransaction,
    chainId,
    deadlineFromNow,
    feeValue0,
    feeValue1,
    library,
    liquidityPercentage,
    liquidityValue0,
    liquidityValue1,
    positionManager,
    positionSDK,
    tokenId,
  ])

  const handleDismissConfirmation = useCallback(() => {
    setShowConfirm(false)
    // if there was a tx hash, we want to clear the input
    if (txHash) {
      onPercentSelect(0)
      setShouldRedirect(true)
    }
    setTxHash(undefined)
  }, [onPercentSelect, txHash])

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
        onDismiss={handleDismissConfirmation}
        hash={txHash}
        header="You will receive"
        onConfirm={onRemove}
        transactionDetails={[]}
        tradeDetails={[
          {
            amount: liquidityValue0?.toSignificant(6) || '0',
            symbol: currencyA?.symbol || 'FUSE',
            LogoComponent: () => <CurrencyLogo currency={currencyA} />,
            SeperatorComponent: () => <Plus />,
          },
          {
            amount: liquidityValue1?.toSignificant(6) || '0',
            symbol: currencyB?.symbol || 'FUSE',
            LogoComponent: () => <CurrencyLogo currency={currencyB} />,
          },
        ]}
      />
      <AppBody>
        <BackButton />

        <Title currencyA={currencyA} currencyB={currencyB} />

        <Flex pt={3} width={'100%'} flexDirection={['column', 'row']} sx={{ gap: 3 }}>
          <PairDetails baseCurrency={currencyA} quoteCurrency={currencyB} feeAmount={feeAmount} tokenId={tokenId} />

          <Card width={[1, 1 / 2]}>
            <Text fontSize={3} fontWeight={700} pb={1}>
              Amount of Liquidity to Remove
            </Text>

            <Box mt={3} variant={'outline'}>
              <Text px={3} pt={2} fontSize={6} fontWeight={700}>
                {percent}%
              </Text>

              <Flex height={45} width={'100%'} style={{ gap: '8px' }}>
                <PercentageButton
                  amount={25}
                  px={3}
                  py={1}
                  fontSize={3}
                  onClick={() => onPercentSelect(25)}
                  active={liquidityPercentage.equalTo(new Percent(25, 100))}
                />
                <PercentageButton
                  amount={50}
                  fontSize={3}
                  onClick={() => onPercentSelect(50)}
                  active={liquidityPercentage.equalTo(new Percent(50, 100))}
                />
                <PercentageButton
                  fontSize={3}
                  amount={75}
                  onClick={() => onPercentSelect(75)}
                  active={liquidityPercentage.equalTo(new Percent(75, 100))}
                />
                <PercentageButton
                  amount={100}
                  fontSize={3}
                  onClick={() => onPercentSelect(100)}
                  active={liquidityPercentage.equalTo(new Percent(100, 100))}
                />
              </Flex>
            </Box>

            <Box mx="auto" width={'fit-content'} pt={3} pb={1}>
              <ArrowDown strokeWidth={1} size="42px" />
            </Box>

            <Text fontSize={3} fontWeight={700} pb={3}>
              You Will Recieve{' '}
            </Text>

            <Box variant={'outline'}>
              <Flex px={3} width={'100%'} py={3} sx={{ gap: 3 }} flexDirection={'column'}>
                <Flex alignItems={'center'} justifyContent={'space-between'} width={'100%'}>
                  <Flex sx={{ gap: 2 }} alignItems={'center'}>
                    <MultiCurrencyLogo size={'20'} tokenAddresses={[currencyIdA]} />
                    <Text fontWeight={500} id="remove-liquidity-tokena-symbol">
                      Pooled {liquidityValue0?.currency?.symbol}
                    </Text>
                  </Flex>
                  <Text fontWeight={500}>{liquidityValue0?.toSignificant(4) || '-'}</Text>
                </Flex>

                <Flex alignItems={'center'} justifyContent={'space-between'} width={'100%'}>
                  <Flex sx={{ gap: 2 }} alignItems={'center'}>
                    <MultiCurrencyLogo size={'20'} tokenAddresses={[currencyIdB]} />
                    <Text fontSize={2} fontWeight={500} id="remove-liquidity-tokenb-symbol">
                      Pooled {liquidityValue1?.currency?.symbol}
                    </Text>
                  </Flex>
                  <Text fontWeight={500}>{liquidityValue1?.toSignificant(4) || '-'}</Text>
                </Flex>
              </Flex>

              <IconDivider />

              <Flex px={3} width={'100%'} py={3} sx={{ gap: 3 }} flexDirection={'column'}>
                <Flex alignItems={'center'} justifyContent={'space-between'} width={'100%'}>
                  <Flex sx={{ gap: 2 }} alignItems={'center'}>
                    <MultiCurrencyLogo size={'20'} tokenAddresses={[currencyIdA]} />
                    <Text fontWeight={500}>{feeValue0?.currency?.symbol} Fee Earned</Text>
                  </Flex>
                  <Text fontWeight={500}>{feeValue0?.toSignificant(4)}</Text>
                </Flex>

                <Flex alignItems={'center'} justifyContent={'space-between'} width={'100%'}>
                  <Flex sx={{ gap: 2 }} alignItems={'center'}>
                    <MultiCurrencyLogo size={'20'} tokenAddresses={[currencyIdB]} />
                    <Text fontSize={2} fontWeight={500}>
                      {feeValue1?.currency?.symbol} Fee Earned
                    </Text>
                  </Flex>
                  <Text fontWeight={500}>{feeValue1?.toSignificant(4)}</Text>
                </Flex>
              </Flex>
            </Box>
            <Box py={2}></Box>
            <CheckConnectionWrapper>
              <Button disabled={Boolean(error)} onClick={() => setShowConfirm(true)}>
                {error ?? 'Remove'}
              </Button>
            </CheckConnectionWrapper>
          </Card>
        </Flex>
      </AppBody>
    </>
  )
}
