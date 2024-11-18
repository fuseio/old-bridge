import { BigNumber } from 'ethers'
import { parseUnits, formatUnits } from 'ethers/lib/utils'
import { TransactionResponse } from '@ethersproject/providers'

import TokenBridge from './tokenBridge'
import { ChainId } from '../../../constants/chains'
import { DEFAULT_CONFIRMATIONS_LIMIT } from '../../../constants/bridge'
import HomeBridgeABI from '../../../constants/abis/homeBridgeNativeToErc.json'
import { getChainNetworkLibrary, getNetworkLibrary } from '../../../connectors'
import ForeignBridgeABI from '../../../constants/abis/foreignBridgeNativeToErc.json'
import { getHomeBridgeNativeToErcContract, getERC677TokenContract, calculateGasMargin, pollEvent } from '../../../utils'
import {
  GAS_PRICE,
  FUSE_NATIVE_TO_ERC677_BRIDGE_HOME_ADDRESS,
  FUSE_NATIVE_TO_ERC677_BRIDGE_FOREIGN_ADDRESS,
} from '../../../constants'
import {
  tokenTransferSuccess,
  tokenTransferPending,
  confirmTokenTransferPending,
  confirmTokenTransferSuccess,
  transferError,
} from '../actions'

export default class NativeToErcBridge extends TokenBridge {
  private readonly FOREIGN_BRIDGE_EVENT = 'RelayedMessage(address,uint256,bytes32)'
  private readonly HOME_BRIDGE_EVENT = 'AffirmationCompleted(address,uint256,bytes32)'

  private get homeBridgeAddress() {
    return FUSE_NATIVE_TO_ERC677_BRIDGE_HOME_ADDRESS
  }

  private get foreignBridgeAddress() {
    return FUSE_NATIVE_TO_ERC677_BRIDGE_FOREIGN_ADDRESS
  }

  private get homeBridgeContract() {
    return getHomeBridgeNativeToErcContract(this.homeBridgeAddress, this.library, this.account)
  }

  private get homeNetworkLibrary() {
    return getNetworkLibrary()
  }

  private get foreignNetworkLibrary() {
    return getChainNetworkLibrary(ChainId.MAINNET)
  }

  private toBigNumber(value: string): BigNumber {
    return parseUnits(formatUnits(value))
  }

  private buildHomeTransaction() {
    return {
      to: this.homeBridgeAddress,
      from: this.account,
      value: this.toBigNumber(this.amount.quotient.toString()),
      ...(GAS_PRICE && { gasPrice: this.toBigNumber(GAS_PRICE) }),
    }
  }

  async transferToForeign(): Promise<TransactionResponse | null> {
    this.dispatch(tokenTransferPending())

    const response = await this.homeBridgeContract.signer.sendTransaction(this.buildHomeTransaction())

    this.dispatch(tokenTransferSuccess())

    return response
  }

  async transferToHome(): Promise<TransactionResponse> {
    if (this.chainId !== ChainId.MAINNET)
      throw new Error(`Chain not supported for nativeToErc bridge transaction, chainId: ${this.chainId}`)

    this.dispatch(tokenTransferPending())

    const contract = getERC677TokenContract(this.tokenAddress, this.library, this.account)
    const args = [this.foreignBridgeAddress, this.amount.quotient.toString(), []]

    const estimatedGas = await contract.estimateGas.transferAndCall(...args, {})
    const response = await contract.transferAndCall(...args, { gasLimit: calculateGasMargin(estimatedGas) })

    this.dispatch(tokenTransferSuccess())

    return response
  }

  async watchForeignBridge() {
    this.dispatch(confirmTokenTransferPending())

    await pollEvent(
      this.FOREIGN_BRIDGE_EVENT,
      this.foreignBridgeAddress,
      ForeignBridgeABI,
      this.foreignNetworkLibrary,
      async (eventArgs: any[]) => {
        const [recipient] = eventArgs
        return recipient === this.account
      }
    )

    this.dispatch(confirmTokenTransferSuccess())
  }

  async watchHomeBridge() {
    this.dispatch(confirmTokenTransferPending())

    await pollEvent(
      this.HOME_BRIDGE_EVENT,
      this.homeBridgeAddress,
      HomeBridgeABI,
      this.homeNetworkLibrary,
      async (eventArgs: any[]) => {
        const [recipient] = eventArgs
        return recipient === this.account
      }
    )

    this.dispatch(confirmTokenTransferSuccess())
  }

  async executeTransaction() {
    try {
      let response
      if (this.isHome) {
        response = await this.transferToForeign()
        this.dispatch(confirmTokenTransferSuccess())
      } else {
        response = await this.transferToHome()
        await this.waitForTransaction(response.hash, DEFAULT_CONFIRMATIONS_LIMIT)
        await this.watchHomeBridge()
      }
      this.addTransaction(response, { summary: this.transactionSummary, text: this.transactionText })
      return response
    } catch (error: any) {
      this.dispatch(transferError())

      if (error?.code !== 4001) {
        console.log(error)
      }

      return
    }
  }
}
