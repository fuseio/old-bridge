import { TransactionResponse } from '@ethersproject/providers'

import TokenBridge from './tokenBridge'
import { ChainId } from '../../../constants/chains'
import { DEFAULT_CONFIRMATIONS_LIMIT } from '../../../constants/bridge'
import HomeBridgeABI from '../../../constants/abis/homeAMBNativeToErc20.json'
import { getChainNetworkLibrary, getNetworkLibrary } from '../../../connectors'
import ForeignBridgeABI from '../../../constants/abis/foreignAMBNativeToErc20.json'
import { getERC677TokenContract, calculateGasMargin, pollEvent, getContract } from '../../../utils'
import {
  BSC_BNB_NATIVE_TO_ERC20_BRIDGE_HOME_ADDRESS,
  BSC_BNB_NATIVE_TO_ERC20_BRIDGE_FOREIGN_ADDRESS,
} from '../../../constants'
import {
  tokenTransferSuccess,
  tokenTransferPending,
  confirmTokenTransferPending,
  confirmTokenTransferSuccess,
  transferError,
} from '../actions'

export default class BscBnbNativeToErc20Bridge extends TokenBridge {
  private readonly BRIDGE_EVENT = 'TokensBridged(address,uint256,bytes32)'

  private get homeBridgeAddress() {
    return BSC_BNB_NATIVE_TO_ERC20_BRIDGE_HOME_ADDRESS
  }

  private get foreignBridgeAddress() {
    return BSC_BNB_NATIVE_TO_ERC20_BRIDGE_FOREIGN_ADDRESS
  }

  private get homeBridgeContract() {
    return getContract(this.homeBridgeAddress, HomeBridgeABI, this.library, this.account)
  }

  private get homeNetworkLibrary() {
    return getChainNetworkLibrary(ChainId.BINANCE_MAINNET)
  }

  private get foreignNetworkLibrary() {
    return getNetworkLibrary()
  }

  async transferToForeign(): Promise<TransactionResponse> {
    this.dispatch(tokenTransferPending())

    const contract = this.homeBridgeContract
    const address = this.receiverAddress ? this.receiverAddress : this.account
    const args = [address]
    const value = this.amount.quotient.toString()

    const estimatedGas = await contract.estimateGas.relayTokens(...args, { value })
    const response = await contract.relayTokens(...args, { gasLimit: calculateGasMargin(estimatedGas), value })

    this.dispatch(tokenTransferSuccess())

    return response
  }

  async transferToHome(): Promise<TransactionResponse> {
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
      this.BRIDGE_EVENT,
      this.foreignBridgeAddress,
      ForeignBridgeABI,
      this.foreignNetworkLibrary,
      async (eventArgs: any[]) => {
        const [recipient] = eventArgs
        const receiver = this.receiverAddress ? this.receiverAddress : this.account
        return recipient === receiver
      }
    )

    this.dispatch(confirmTokenTransferSuccess())
  }

  async watchHomeBridge() {
    this.dispatch(confirmTokenTransferPending())

    await pollEvent(
      this.BRIDGE_EVENT,
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

  get transactionSummary(): string {
    return this.isHome
      ? 'Your tokens were transferred successfully to Binance please switch to the BNB chain to use them'
      : 'Your tokens were transferred successfully to Fuse please switch to the Fuse Network to use them'
  }

  async executeTransaction() {
    try {
      let response
      if (this.isHome) {
        response = await this.transferToHome()
        await this.watchHomeBridge()
      } else {
        response = await this.transferToForeign()
        await this.waitForTransaction(response.hash, DEFAULT_CONFIRMATIONS_LIMIT)
        await this.watchForeignBridge()
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
