import TokenBridge from './tokenBridge'
import { ChainId } from '../../../constants/chains'
import BridgeABI from '../../../constants/abis/ambErc677ToErc677.json'
import { DEFAULT_CONFIRMATIONS_LIMIT } from '../../../constants/bridge'
import { getChainNetworkLibrary, getNetworkLibrary } from '../../../connectors'
import { getERC677TokenContract, calculateGasMargin, pollEvent } from '../../../utils'
import {
  GAS_PRICE,
  FUSE_ERC677_TO_ERC677_BRIDGE_HOME_ADDRESS,
  FUSE_ERC677_TO_ERC677_BRIDGE_FOREIGN_ADDRESS,
} from '../../../constants'
import {
  tokenTransferPending,
  tokenTransferSuccess,
  confirmTokenTransferPending,
  confirmTokenTransferSuccess,
  transferError,
} from '../actions'

export default class Erc677ToErc677Bridge extends TokenBridge {
  private readonly BRIDGE_EVENT = 'TokensBridged(address,uint256,bytes32)'

  private get homeBridgeAddress() {
    return FUSE_ERC677_TO_ERC677_BRIDGE_HOME_ADDRESS
  }

  private get homeNetworkLibrary() {
    return getNetworkLibrary()
  }

  private get foreignNetworkLibrary() {
    return getChainNetworkLibrary(ChainId.MAINNET)
  }

  private get foreignBridgeAddress() {
    return FUSE_ERC677_TO_ERC677_BRIDGE_FOREIGN_ADDRESS
  }

  async transferToForeign() {
    this.dispatch(tokenTransferPending())

    const contract = getERC677TokenContract(this.tokenAddress, this.library, this.account)
    const args = [this.homeBridgeAddress, this.amount.quotient.toString(), []]

    const estimatedGas = await contract.estimateGas.transferAndCall(...args, {})
    const response = await contract.transferAndCall(...args, {
      ...(GAS_PRICE && { gasPrice: GAS_PRICE }),
      gasLimit: calculateGasMargin(estimatedGas),
    })

    this.dispatch(tokenTransferSuccess())

    return response
  }

  async transferToHome() {
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
      BridgeABI,
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
      this.BRIDGE_EVENT,
      this.homeBridgeAddress,
      BridgeABI,
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
