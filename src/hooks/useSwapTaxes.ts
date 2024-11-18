import JSBI from 'jsbi'
import { useEffect, useState } from 'react'
import { Percent } from '@voltage-finance/sdk-core'

import { useWeb3 } from '.'
import { useContract } from './useContract'
import { ChainId } from '../constants/chains'
import { BIPS_BASE, wFUSE } from '../constants'
import { FEE_ON_TRANSFER_DETECTOR_ADDRESS } from '../constants/addresses'

import FOT_DETECTOR_ABI from '../constants/abis/fee-on-transfer-detector.json'

function useFeeOnTransferDetectorContract() {
  const { chainId } = useWeb3()
  return useContract(FEE_ON_TRANSFER_DETECTOR_ADDRESS[chainId], FOT_DETECTOR_ABI)
}

const WETH_ADDRESS = wFUSE.address
const AMOUNT_TO_BORROW = 10000
const ZERO_PERCENT = new Percent(JSBI.BigInt(0))

const FEE_CACHE: { [address in string]?: { sellTax?: Percent; buyTax?: Percent } } = {}

async function getSwapTaxes(
  fotDetector: any,
  inputTokenAddress: string | undefined,
  outputTokenAddress: string | undefined
) {
  const addresses = []
  if (
    inputTokenAddress &&
    FEE_CACHE[inputTokenAddress] === undefined &&
    inputTokenAddress !== WETH_ADDRESS
  ) {
    addresses.push(inputTokenAddress)
  }

  if (
    outputTokenAddress &&
    FEE_CACHE[outputTokenAddress] === undefined &&
    outputTokenAddress !== WETH_ADDRESS
  ) {
    addresses.push(outputTokenAddress)
  }

  try {
    if (addresses.length) {
      const data = await fotDetector.callStatic.batchValidate(addresses, WETH_ADDRESS, AMOUNT_TO_BORROW)

      addresses.forEach((address, index) => {
        const { sellFeeBps, buyFeeBps } = data[index]
        const sellTax = new Percent(sellFeeBps.toNumber(), BIPS_BASE)
        const buyTax = new Percent(buyFeeBps.toNumber(), BIPS_BASE)

        FEE_CACHE[address] = { sellTax, buyTax }
      })
    }
  } catch (e) {
    console.warn('Failed to get swap taxes for token(s):', addresses, e)
  }

  const inputTax = (inputTokenAddress ? FEE_CACHE[inputTokenAddress]?.sellTax : ZERO_PERCENT) ?? ZERO_PERCENT
  const outputTax = (outputTokenAddress ? FEE_CACHE[outputTokenAddress]?.buyTax : ZERO_PERCENT) ?? ZERO_PERCENT

  return { inputTax, outputTax }
}

export function useSwapTaxes(inputTokenAddress?: string, outputTokenAddress?: string) {
  const fotDetector = useFeeOnTransferDetectorContract()
  const [{ inputTax, outputTax }, setTaxes] = useState({ inputTax: ZERO_PERCENT, outputTax: ZERO_PERCENT })
  const { chainId } = useWeb3()

  useEffect(() => {
    if (!fotDetector || chainId !== ChainId.FUSE) return
    getSwapTaxes(fotDetector, inputTokenAddress, outputTokenAddress).then(setTaxes)
  }, [fotDetector, inputTokenAddress, outputTokenAddress, chainId])

  return { inputTax, outputTax }
}
