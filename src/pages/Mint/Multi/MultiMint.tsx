import { BigNumber } from 'ethers'
import { flattenDeep } from 'lodash'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { Box, Button, Flex, Text } from 'rebass/styled-components'

import { useWeb3 } from '../../../hooks'
import { useMassetContractV3 } from '../../../hooks/useContract'
import { useTokenBalances } from '../../../state/wallet/hooks'
import { CurrencyInput } from '../../../wrappers/CurrencyInput'
import { ApprovalButton } from '../../../wrappers/ApprovalButton'
import TxHashSubmmitedModal from '../../../modals/TxSubmmitedModal'
import { calculatePriceImpact } from '../../../state/stableswap/hooks'
import { useTransactionAdder } from '../../../state/transactions/hooks'
import tryParseCurrencyAmount from '../../../utils/tryParseCurrencyAmount'
import { VOLTAGE_FINANCE_LOGOS_URL } from '../../../constants/lists'
import { CheckConnectionWrapper } from '../../../wrappers/CheckConnectionWrapper'
import { ApprovalState, useApproveCallback } from '../../../hooks/useApproveCallback'
import { formatSignificant, tryFormatAmount, tryFormatDecimalAmount } from '../../../utils'
import { FUSD, FUSD_ADDRESS_V3, FUSE_USDC_V2, FUSE_USDT_V2, ONE_ETH } from '../../../constants'
import { useTransactionRejectedNotification } from '../../../hooks/notifications/useTransactionRejectedNotification'

export default function MultiMint() {
  const { account } = useWeb3()
  const massetContract = useMassetContractV3()
  const [usdtAmount, setUsdtAmount] = useState('0.0')
  const [usdcAmount, setUsdcAmount] = useState('0.0')

  const [txHash, setTxHash] = useState(null)

  const tokens = useMemo(() => [FUSE_USDT_V2, FUSE_USDC_V2], [])
  const rejectTransaction = useTransactionRejectedNotification()
  const [usdtToken, usdcToken] = tokens
  const tokenBalances = useTokenBalances(account ?? undefined, tokens)
  const usdtCurrencyBalance = tokenBalances?.[usdtToken.address]

  const usdcCurrencyBalance = tokenBalances?.[usdcToken.address]

  const [usdtParsedAmount, usdcParsedAmount] = [
    useMemo(() => tryParseCurrencyAmount(usdtAmount, usdtToken ?? undefined), [usdtAmount, usdtToken]),
    useMemo(() => tryParseCurrencyAmount(usdcAmount, usdcToken ?? undefined), [usdcAmount, usdcToken]),
  ]

  const [usdcApprovalState, usdcApprovalCallback] = useApproveCallback(usdcParsedAmount, FUSD_ADDRESS_V3)

  const [usdtApprovalState, usdtApprovalCallback] = useApproveCallback(usdtParsedAmount, FUSD_ADDRESS_V3)
  const balances = useMemo(() => [usdtParsedAmount, usdcParsedAmount], [usdcParsedAmount, usdtParsedAmount])

  const mintOutputParams = useMemo(
    () =>
      tokens.reduce(
        (prev: any, curr: any, idx: any) => {
          if (curr?.address && balances[idx]) {
            const [addresses, amounts] = prev
            return [
              [...addresses, curr?.address],
              [...amounts, balances[idx]?.quotient.toString()],
            ]
          }

          return prev
        },
        [[], []]
      ),
    [balances, tokens]
  )

  const [mintOutput, setMintOutput] = useState<string | undefined>()

  useEffect(() => {
    async function getMintOutput() {
      try {
        if (massetContract && mintOutputParams && flattenDeep(mintOutputParams).length !== 0) {
          const result = await massetContract.getMintMultiOutput(...mintOutputParams)

          if (result) {
            setMintOutput(result.toString())
          }
        }
      } catch (error) {
        setMintOutput('0')
      }
    }

    getMintOutput()
  }, [massetContract, mintOutput, mintOutputParams])

  const formattedMintOutput = useMemo(() => tryFormatAmount(mintOutput, FUSD?.decimals), [mintOutput])
  const totalInputAmount = useMemo(
    () =>
      [usdcParsedAmount, usdtParsedAmount].reduce(
        (sum, amount) => sum.add(amount?.multiply(ONE_ETH.toString()).toFixed(0) ?? '0'),
        BigNumber.from(0)
      ),
    [usdcParsedAmount, usdtParsedAmount]
  )
  const priceImpact = useMemo(
    () => calculatePriceImpact(totalInputAmount, BigNumber.from(mintOutput ?? '0')),
    [mintOutput, totalInputAmount]
  )

  const slippage = tryFormatDecimalAmount(priceImpact.mul(100).toString(), 18, 4)
  const addTransaction = useTransactionAdder()

  const onMint = useCallback(async () => {
    if (!account || !mintOutputParams.every((b: any) => b) || !mintOutput || !massetContract) return
    try {
      const response = await (massetContract as any).mintMulti(
        mintOutputParams[0],
        mintOutputParams[1],
        mintOutput,
        account
      )
      setTxHash(response?.hash)
      addTransaction(response, {
        summary: 'Multi Mint',
      })

      setUsdcAmount('')
      setUsdtAmount('')
      setMintOutput(null)
    } catch (e: any) {
      if (e?.code === 4001 || e?.code === 'ACTION_REJECTED') {
        rejectTransaction()
      }
      console.error(e)
    }
  }, [account, addTransaction, massetContract, mintOutput, mintOutputParams, rejectTransaction])

  let inputError = null

  if (usdcParsedAmount?.greaterThan(usdcCurrencyBalance) && !usdcParsedAmount?.equalTo(usdcCurrencyBalance)) {
    inputError = 'Insufficient USDC balance'
  }
  if (usdtParsedAmount?.greaterThan(usdtCurrencyBalance) && !usdtParsedAmount?.equalTo(usdtCurrencyBalance)) {
    inputError = 'Insufficient USDT balance'
  }

  const getApprovalStates = () => {
    return (
      usdcApprovalState === ApprovalState.PENDING ||
      usdcApprovalState === ApprovalState.NOT_APPROVED ||
      usdtApprovalState === ApprovalState.PENDING ||
      usdtApprovalState === ApprovalState.NOT_APPROVED
    )
  }

  return (
    <>
      <TxHashSubmmitedModal txHash={txHash} setTxHash={setTxHash} />

      <Box pb={3} width={'100%'}>
        <Box px={3}>
          <CurrencyInput
            onUserInput={(value: string) => setUsdtAmount(value)}
            onMax={() => setUsdtAmount(usdtCurrencyBalance?.toExact())}
            value={usdtAmount}
            currency={usdtToken}
            tokenUrl={`${VOLTAGE_FINANCE_LOGOS_URL}/0xFaDbBF8Ce7D5b7041bE672561bbA99f79c532e10/logo.png`}
          />

          <Box py={1}></Box>
          <CurrencyInput
            onUserInput={(value: string) => setUsdcAmount(value)}
            onMax={() => setUsdcAmount(usdcCurrencyBalance?.toExact())}
            value={usdcAmount}
            currency={usdcToken}
            tokenUrl={`${VOLTAGE_FINANCE_LOGOS_URL}/0x620fd5fa44BE6af63715Ef4E65DDFA0387aD13F5/logo.png`}
          />
          <Box py={1}></Box>

          <Box pt={3}>
            {getApprovalStates() && !inputError ? (
              <Flex width={'100%'} sx={{ gap: 2 }}>
                {(usdtApprovalState === ApprovalState.NOT_APPROVED || usdtApprovalState === ApprovalState.PENDING) && (
                  <ApprovalButton
                    currencyToApprove={usdtToken}
                    approval={usdtApprovalState}
                    approveCallback={usdtApprovalCallback}
                  ></ApprovalButton>
                )}
                {(usdcApprovalState === ApprovalState.NOT_APPROVED || usdcApprovalState === ApprovalState.PENDING) && (
                  <ApprovalButton
                    currencyToApprove={usdcToken}
                    approval={usdcApprovalState}
                    approveCallback={usdcApprovalCallback}
                  ></ApprovalButton>
                )}
              </Flex>
            ) : (
              <CheckConnectionWrapper>
                <Button
                  width={'100%'}
                  variant={inputError ? 'error' : 'primary'}
                  disabled={inputError || balances.filter(Boolean).length === 0}
                  onClick={onMint}
                >
                  {inputError || 'Mint'}
                </Button>
              </CheckConnectionWrapper>
            )}
          </Box>
        </Box>
        {parseFloat(formattedMintOutput || '0') !== 0 && (
          <Box>
            <Box py={3}>
              <Box opacity={0.3} variant="border"></Box>
            </Box>
            <Box px={3}>
              <Flex justifyContent={'space-between'}>
                <Text opacity={0.5} fontSize={1}>
                  fUSD Received
                </Text>
                <Text fontSize={1}>
                  {parseFloat(formattedMintOutput || '0') === 0
                    ? '0.0'
                    : formatSignificant({
                        value: formattedMintOutput,
                      })}
                </Text>
              </Flex>
              <Flex pt={1} justifyContent={'space-between'}>
                <Text opacity={0.5} fontSize={1}>
                  Slippage
                </Text>

                {parseFloat(slippage) !== 0 && (
                  <Text fontSize={1}>{parseFloat(slippage) < 0.01 ? '<0.01' : parseFloat(slippage).toFixed(2)}%</Text>
                )}
              </Flex>
            </Box>
          </Box>
        )}
      </Box>
    </>
  )
}
