import { BigNumber, ethers } from 'ethers'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { Currency, CurrencyAmount } from '@voltage-finance/sdk-core'

import { getBridgeType } from '../utils'
import { ERC20_ABI } from '../constants/abis/erc20'
import { BridgeDirection, BridgeType } from '../state/bridge/actions'
import HOME_BRIDGE_ABI from '../constants/abis/homeMultiAMBErc20ToErc677.json'
import { bscReadProvider, fuseReadProvider, mainnetReadProvider } from '../connectors'
import {
  BINANCE_ERC20_TO_ERC677_FOREIGN_BRIDGE_ADDRESS,
  BINANCE_ERC20_TO_ERC677_HOME_BRIDGE_ADDRESS,
  FUSE_ERC20_TO_ERC677_BRIDGE_FOREIGN_ADDRESS,
  FUSE_ERC20_TO_ERC677_BRIDGE_HOME_ADDRESS,
} from '../constants'

function getErc20ToErc677Contract(address: string, provider: any) {
  return new ethers.Contract(address, HOME_BRIDGE_ABI, provider)
}

function getTokenContract(address: string, provider: any) {
  return new ethers.Contract(address, ERC20_ABI, provider)
}

async function getLiquidityETHErc20ToErc677(homeTokenAddress: string) {
  const homeBridgeContract = getErc20ToErc677Contract(FUSE_ERC20_TO_ERC677_BRIDGE_HOME_ADDRESS, fuseReadProvider)

  const foreignTokenAddress = await homeBridgeContract.foreignTokenAddress(homeTokenAddress)

  const foreignTokenContract = getTokenContract(foreignTokenAddress, mainnetReadProvider)

  return foreignTokenContract.balanceOf(FUSE_ERC20_TO_ERC677_BRIDGE_FOREIGN_ADDRESS)
}

async function getLiquidityBSCErc20ToErc677(homeTokenAddress: string) {
  const homeBridgeContract = getErc20ToErc677Contract(BINANCE_ERC20_TO_ERC677_HOME_BRIDGE_ADDRESS, fuseReadProvider)

  const foreignTokenAddress = await homeBridgeContract.foreignTokenAddress(homeTokenAddress)

  const foreignTokenContract = getTokenContract(foreignTokenAddress, bscReadProvider)

  return foreignTokenContract.balanceOf(BINANCE_ERC20_TO_ERC677_FOREIGN_BRIDGE_ADDRESS)
}

export default function useCheckBridgeLiquidity(
  tokenAmount?: CurrencyAmount<Currency>,
  bridgeDirection?: BridgeDirection
) {
  const [value, setValue] = useState<boolean>(false)

  const bridgeType = useMemo(() => {
    if (!tokenAmount || !bridgeDirection) return undefined

    return getBridgeType(tokenAmount.wrapped.currency.address, bridgeDirection)
  }, [bridgeDirection, tokenAmount])

  const checkLiquidity = useCallback(async () => {
    try {
      if (!tokenAmount) return undefined

      if (tokenAmount.currency.isNative) return undefined

      let getLiquidityFunc: (homeTokenAddress: string) => Promise<BigNumber>
      switch (bridgeType) {
        case BridgeType.ETH_FUSE_ERC20_TO_ERC677:
          getLiquidityFunc = getLiquidityETHErc20ToErc677
          break
        case BridgeType.BSC_FUSE_ERC20_TO_ERC677:
          getLiquidityFunc = getLiquidityBSCErc20ToErc677
          break
        default:
          throw new Error(`checkLiquidity: no check liquidity function for ${bridgeType}`)
      }

      const liquidityAmount = await getLiquidityFunc(tokenAmount.currency.wrapped.address)

      return tokenAmount.lessThan(liquidityAmount.toString())
    } catch (error) {
      console.error(error)
      return undefined
    }
  }, [bridgeType, tokenAmount])

  useEffect(() => {
    checkLiquidity().then((data) => setValue(data))
  }, [checkLiquidity])

  return value
}
