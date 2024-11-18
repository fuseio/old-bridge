import JSBI from 'jsbi'
import { useCallback, useMemo, useState } from 'react'
import { Box, Flex, Text } from 'rebass/styled-components'
import { Currency, Token } from '@voltage-finance/sdk-core'

import { Version } from '..'
import { useWeb3 } from '../../../hooks'
import { CurrencyInput } from '../../../wrappers/CurrencyInput'
import { ApprovalButton } from '../../../wrappers/ApprovalButton'
import TxHashSubmmitedModal from '../../../modals/TxSubmmitedModal'
import { useApproveCallback } from '../../../hooks/useApproveCallback'
import { useTransactionAdder } from '../../../state/transactions/hooks'
import tryParseCurrencyAmount from '../../../utils/tryParseCurrencyAmount'
import { useFusdLiquidity, useFusdLiquidityV3 } from '../../../graphql/hooks'
import { CheckConnectionWrapper } from '../../../wrappers/CheckConnectionWrapper'
import { useCurrencyBalance, useTokenBalance } from '../../../state/wallet/hooks'
import { useMassetContract as useMassetContractV2, useMassetContractV3 } from '../../../hooks/useContract'
import { FUSD, FUSD_V3, FUSE_BUSD, FUSE_USDC, FUSE_USDC_V2, FUSE_USDT, FUSE_USDT_V2 } from '../../../constants'
import { useTransactionRejectedNotification } from '../../../hooks/notifications/useTransactionRejectedNotification'

import fusdMintLogo from '../../../assets/svg/mint/fusd-mint-logo.svg'

const RedeemToken = ({ currency, amount }: { currency: Currency | Token; amount: string }) => (
  <Flex justifyContent={'space-between'}>
    <Flex sx={{ gap: 2 }} alignItems={'center'}>
      {/* <CurrencyLogo currency={currency} /> */}
      <Text opacity={0.5} fontSize={1}>
        {currency?.symbol}
      </Text>
    </Flex>
    <Text>{amount}</Text>
  </Flex>
)

export default function MultiRedeem({ version }: { version: Version }) {
  const { account } = useWeb3()

  const [fusdAmount, setFusdAmount] = useState('0.0')
  const [txHash, setTxHash] = useState(null)

  const isV3 = useMemo(() => version === Version.v3, [version])

  const fusdToken = isV3 ? FUSD_V3 : FUSD
  const usdtToken = isV3 ? FUSE_USDT_V2 : FUSE_USDT
  const usdcToken = isV3 ? FUSE_USDC_V2 : FUSE_USDC

  const fusdBalance = useTokenBalance(account ?? undefined, fusdToken)
  const parsedFusdAmount = useMemo(() => tryParseCurrencyAmount(fusdAmount, fusdToken), [fusdAmount, fusdToken])

  const useLiquidity = isV3 ? useFusdLiquidityV3 : useFusdLiquidity

  const fusdLiquidity = useLiquidity()

  const userShare = fusdAmount && fusdLiquidity ? Number(fusdAmount) / fusdLiquidity?.totalLiquidity : 0

  const { busdAmount, usdcAmount, usdtAmount } = useMemo(
    () => ({
      busdAmount:
        fusdLiquidity?.busdLiquidity && !isV3
          ? tryParseCurrencyAmount((userShare * fusdLiquidity.busdLiquidity).toFixed(FUSE_BUSD.decimals), FUSE_BUSD)
          : undefined,
      usdcAmount: fusdLiquidity?.usdcLiquidity
        ? tryParseCurrencyAmount((userShare * fusdLiquidity.usdcLiquidity).toFixed(usdcToken.decimals), usdcToken)
        : undefined,
      usdtAmount: fusdLiquidity?.usdtLiquidity
        ? tryParseCurrencyAmount((userShare * fusdLiquidity?.usdtLiquidity).toFixed(usdtToken.decimals), usdtToken)
        : undefined,
    }),
    [
      fusdLiquidity?.busdLiquidity,
      fusdLiquidity?.usdcLiquidity,
      fusdLiquidity?.usdtLiquidity,
      isV3,
      userShare,
      usdcToken,
      usdtToken,
    ]
  )

  const { busdRatio, usdcRatio, usdtRatio } = useMemo(() => {
    if (!fusdLiquidity)
      return {
        usdcRatio: undefined,
        usdtRatio: undefined,
        busdRatio: undefined,
      }

    return {
      usdcRatio: (parseFloat(fusdLiquidity.usdcLiquidity) / parseFloat(fusdLiquidity.totalLiquidity)) * 100,
      usdtRatio: (parseFloat(fusdLiquidity.usdtLiquidity) / parseFloat(fusdLiquidity.totalLiquidity)) * 100,
      busdRatio: isV3
        ? undefined
        : (parseFloat(fusdLiquidity.busdLiquidity) / parseFloat(fusdLiquidity.totalLiquidity)) * 100,
    }
  }, [fusdLiquidity, isV3])

  const useMassetContract = version === Version.v3 ? useMassetContractV3 : useMassetContractV2

  const massetContract = useMassetContract()

  const [approval, approvalCallback] = useApproveCallback(parsedFusdAmount, fusdToken?.address)

  let inputError = null
  if (
    parsedFusdAmount &&
    fusdBalance &&
    parsedFusdAmount?.greaterThan(fusdBalance) &&
    !parsedFusdAmount?.equalTo(fusdBalance)
  ) {
    inputError = 'Insufficient balance'
  }

  const fusdCurrencyBalance = useCurrencyBalance(account ?? undefined, fusdToken)
  const rejectTransaction = useTransactionRejectedNotification()
  const addTransaction = useTransactionAdder()

  const onRedeem = useCallback(async () => {
    if (!account || !parsedFusdAmount || !usdcAmount || !usdtAmount || !massetContract) return
    if (version === Version.v2 && !busdAmount) return
    try {
      const response = await massetContract.redeemMasset(
        parsedFusdAmount?.quotient.toString(),
        ['0', '0', '0'],
        account
      )
      setTxHash(response?.hash)
      addTransaction(response, {
        summary: 'Redeem',
      })

      setFusdAmount('')
    } catch (e: any) {
      if (e?.code === 4001 || e?.code === 'ACTION_REJECTED') {
        rejectTransaction()
      }
      console.error(e)
    }
  }, [
    account,
    addTransaction,
    busdAmount,
    massetContract,
    parsedFusdAmount,
    rejectTransaction,
    usdcAmount,
    usdtAmount,
    version,
  ])
  const ZERO = JSBI.BigInt(0)

  const getUserShouldRecieveAmount = () => {
    if (version === Version.v2) {
      return usdtAmount?.greaterThan(ZERO) && usdcAmount?.greaterThan(ZERO) && busdAmount?.greaterThan(ZERO)
    }
    return usdtAmount?.greaterThan(ZERO) && usdcAmount?.greaterThan(ZERO)
  }

  return (
    <>
      <TxHashSubmmitedModal txHash={txHash} setTxHash={setTxHash} />
      <Box pb={3} width={'100%'}>
        <Box px={3}>
          <CurrencyInput
            onMax={() => setFusdAmount(fusdCurrencyBalance?.toSignificant(18) || '0')}
            onUserInput={(value: string) => setFusdAmount(value)}
            value={fusdAmount}
            currency={fusdToken}
            icon={fusdMintLogo}
          />
          <Box py={2}></Box>
          <CheckConnectionWrapper>
            <ApprovalButton
              currencyToApprove={fusdToken}
              onClick={() => onRedeem()}
              approval={approval}
              error={inputError}
              approveCallback={approvalCallback}
            >
              Redeem
            </ApprovalButton>
          </CheckConnectionWrapper>
        </Box>
        {!inputError && account && getUserShouldRecieveAmount() && (
          <>
            <Box mt={3} opacity={0.4} variant={'border'}></Box>
            <Box pt={3} px={3}>
              <Text opacity={0.5} fontSize={1}>
                {isV3
                  ? `You will receive ${usdcRatio?.toFixed(2)}% USDC and ${usdtRatio?.toFixed(2)}% USDT in tokens.`
                  : `You will receive ${usdcRatio?.toFixed(2)}% USDC, ${busdRatio?.toFixed(
                      2
                    )}% BUSD and ${usdtRatio?.toFixed(2)}% USDT in tokens.`}
              </Text>
            </Box>
            <Box pt={3} px={3}>
              <Flex sx={{ gap: 2 }} flexDirection={'column'}>
                <RedeemToken currency={usdtToken} amount={usdtAmount?.toSignificant(4) ?? '0'} />
                <RedeemToken currency={usdcToken} amount={usdcAmount?.toSignificant(4) ?? '0'} />
                {version === Version.v2 && (
                  <RedeemToken currency={FUSE_BUSD} amount={busdAmount?.toSignificant(4) ?? '0'} />
                )}
              </Flex>
            </Box>
          </>
        )}
      </Box>
    </>
  )
}
