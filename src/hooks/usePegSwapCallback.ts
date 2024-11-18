import { Token } from '@voltage-finance/sdk-core'
import JSBI from 'jsbi'
import { usePegSwapContract } from './useContract'
import {
  FUSD,
  FUSD_DEPRECATED,
  FUSD_MIGRATION_PEGSWAP_ADDRESS,
  FUSE_USDC,
  FUSE_WETH,
  LAYERZERO_PEGSWAP_ADDRESS,
  USDC_V2,
  WETH_V2,
  PEG_SWAP_ADDRESS,
  FUSE_BUSD,
  FUSE_USDT,
  FUSE_USDT_V2,
  BUSD_USDT_V2_PEGSWAP_ADDRESS,
  FUSE_BNB,
  BNB_V2,
} from '../constants'
import { useMemo } from 'react'
import { useCurrencyBalance } from '../state/wallet/hooks'
import { useWeb3 } from '.'
import { useTransactionAdder } from '../state/transactions/hooks'
import { useSingleCallResult } from '../state/multicall/hooks'
import { isSwapPair, tryFormatAmount } from '../utils'
import { formatUnits } from 'ethers/lib/utils'
import tryParseCurrencyAmount from '../utils/tryParseCurrencyAmount'

export enum PegSwapType {
  NOT_APPLICABLE = 'NOT_APPLICABLE',
  SWAP = 'SWAP',
}

const NOT_APPLICABLE = { pegSwapType: PegSwapType.NOT_APPLICABLE }

function usePegLiquidity(pegswapAddress?: string, inputCurrency?: Token, outputCurrency?: Token) {
  const contract = usePegSwapContract(pegswapAddress)

  const inputs = useMemo(() => [inputCurrency?.address, outputCurrency?.address], [inputCurrency, outputCurrency])
  const liquidity = useSingleCallResult(contract, 'getSwappableAmount', inputs)?.result?.[0]

  return tryFormatAmount(liquidity?.toString(), outputCurrency?.decimals)
}

function usePegMinimum(inputCurrency?: Token, outputCurrency?: Token) {
  if (!inputCurrency || !outputCurrency) return

  const inputDecimals = inputCurrency.decimals
  const outputDecimals = outputCurrency.decimals
  const rate = JSBI.BigInt(Math.abs(inputDecimals - outputDecimals))
  const min = String(JSBI.exponentiate(JSBI.BigInt(10), rate))

  if (inputDecimals > outputDecimals) {
    return formatUnits(min, inputDecimals)
  }

  return
}

export function usePegSwapAddress(inputCurrency?: Token, outputCurrency?: Token) {
  return useMemo(() => {
    if (!inputCurrency || !outputCurrency) return

    if (isSwapPair(inputCurrency, outputCurrency, FUSD_DEPRECATED, FUSE_USDC)) {
      return PEG_SWAP_ADDRESS
    }

    if (isSwapPair(inputCurrency, outputCurrency, FUSD_DEPRECATED, FUSD)) {
      return FUSD_MIGRATION_PEGSWAP_ADDRESS
    }

    if (isSwapPair(inputCurrency, outputCurrency, FUSE_BUSD, FUSE_USDT_V2)) {
      return BUSD_USDT_V2_PEGSWAP_ADDRESS
    }

    if (
      isSwapPair(inputCurrency, outputCurrency, FUSE_USDC, USDC_V2) ||
      isSwapPair(inputCurrency, outputCurrency, FUSE_WETH, WETH_V2) ||
      isSwapPair(inputCurrency, outputCurrency, FUSE_USDT, FUSE_USDT_V2) ||
      isSwapPair(inputCurrency, outputCurrency, FUSE_BNB, BNB_V2)
    ) {
      return LAYERZERO_PEGSWAP_ADDRESS
    }

    return
  }, [inputCurrency, outputCurrency])
}

export default function usePegSwapCallback(
  inputCurrency: Token | undefined,
  outputCurrency: Token | undefined,
  typedValue: string | undefined
): {
  pegSwapType: PegSwapType
  pegSwapAddress?: string
  execute?: undefined | (() => Promise<any>)
  inputError?: string
} {
  const { account } = useWeb3()
  const pegSwapAddress = usePegSwapAddress(inputCurrency, outputCurrency)
  const pegSwapContract = usePegSwapContract(pegSwapAddress)
  const balance = useCurrencyBalance(account ?? undefined, inputCurrency)
  const inputAmount = useMemo(() => tryParseCurrencyAmount(typedValue, inputCurrency), [inputCurrency, typedValue])
  const liquidity = usePegLiquidity(pegSwapAddress, inputCurrency, outputCurrency)
  const minimum = usePegMinimum(inputCurrency, outputCurrency)
  const addTransaction = useTransactionAdder()

  return useMemo(() => {
    if (!inputCurrency || !outputCurrency || !pegSwapContract || !pegSwapAddress) return NOT_APPLICABLE

    let error

    if (inputAmount && balance && balance.lessThan(inputAmount)) {
      error = `Insufficient ${inputCurrency.symbol} balance`
    } else if (Number(typedValue) > Number(liquidity)) {
      error = `Insufficient liquidity`
    } else if (minimum && Number(typedValue) < Number(minimum)) {
      error = `Below minimum limit ${minimum}`
    }

    return {
      pegSwapType: PegSwapType.SWAP,
      pegSwapAddress,
      execute: async () => {
        try {
          const txReceipt = await pegSwapContract.swap(
            inputAmount?.quotient.toString(),
            inputCurrency.address,
            outputCurrency.address
          )

          addTransaction(txReceipt, {
            summary: `Migrate ${inputAmount?.toSignificant(6)} ${inputCurrency.symbol} to ${outputCurrency.symbol}`,
          })

          return txReceipt
        } catch (error) {
          throw new Error('Could not peg swap ' + error)
        }
      },
      inputError: error,
    }
  }, [
    addTransaction,
    balance,
    inputAmount,
    inputCurrency,
    liquidity,
    minimum,
    outputCurrency,
    pegSwapContract,
    pegSwapAddress,
    typedValue,
  ])
}
