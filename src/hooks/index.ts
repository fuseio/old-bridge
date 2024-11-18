import { getAddress } from 'ethers/lib/utils'
import { useAsyncMemo } from 'use-async-memo'
import { useEffect, useMemo, useState } from 'react'
import { Currency } from '@voltage-finance/sdk-core'
import { useConnectWallet } from '@web3-onboard/react'
import { Web3Provider } from '@ethersproject/providers'

import useAnalytics from './useAnalytics'
import { useFusePrice } from '../graphql/hooks'
import { getTokenMigrationContract } from '../utils'
import { WrappedTokenInfo } from '../state/lists/hooks'
import { ChainId, getChains } from '../constants/chains'

import type { DisconnectOptions, WalletState } from '@web3-onboard/core'

export const useChains = () => {
  const { wallet, chainId } = useWeb3()
  const [chain, setChain] = useState(undefined)
  useEffect(() => {
    if (wallet) {
      const chain = getChains().find(({ id }) => Number(id) === Number(wallet.chains[0].id))
      setChain(chain)
    }
  }, [wallet, chainId])
  return chain
}
export const useWalletBalance = () => {
  const { wallet } = useWeb3()
  const [usdPrice, setUSDPrice] = useState(0)
  const [tokenPrice, setTokenPrice] = useState(0)

  const chain = useChains()
  const fusePrice = useFusePrice()

  useEffect(() => {
    if (wallet && wallet?.accounts[0].balance && chain) {
      setTokenPrice(parseFloat((wallet as any).accounts[0].balance[chain?.token]))
    }
  }, [wallet?.accounts, chain, wallet])

  useEffect(() => {
    let usdPrice = 0
    if (tokenPrice) {
      if (chain?.token === 'FUSE') {
        usdPrice = tokenPrice * parseFloat(fusePrice)
      }
    }
    setUSDPrice(usdPrice)
  }, [tokenPrice, chain, fusePrice])

  return {
    tokenPrice,
    usdPrice,
  }
}

export function useWeb3(): {
  wallet: WalletState
  connecting: boolean
  chainId?: number
  account?: string
  library?: Web3Provider
  connectWallet: () => void
  disconnectWallet: (wallet: DisconnectOptions) => Promise<WalletState[]>
} {
  const [{ wallet, connecting }, connect, disconnect] = useConnectWallet()

  const { sendEvent } = useAnalytics()

  const handleConnectWallet = async () => {
    const result = await connect()

    if (result?.length > 0) {
      const connectedWallet = result[0]
      sendEvent('Wallet connected', { walletType: connectedWallet.label })
    }
  }

  return useMemo(
    () => ({
      wallet,
      connecting,
      chainId: wallet ? Number(wallet.chains[0].id) : ChainId.FUSE,
      account: wallet ? getAddress(wallet.accounts[0].address) : undefined,
      library: wallet ? new Web3Provider(wallet.provider) : undefined,
      connectWallet: handleConnectWallet,
      disconnectWallet: disconnect,
    }),
    [connect, disconnect, wallet]
  )
}

export function useChain() {
  const { chainId } = useWeb3()

  return useMemo(() => {
    const isHome = chainId === ChainId.FUSE
    const isEtheruem = chainId === ChainId.MAINNET
    const isForeign = chainId === ChainId.MAINNET
    const isBsc = chainId === ChainId.BINANCE_MAINNET
    const isFuse = chainId === ChainId.FUSE

    return { isHome, isEtheruem, isForeign, isBsc, isFuse }
  }, [chainId])
}

export function useUpgradedTokenAddress(token: Currency | undefined) {
  const { library, account } = useWeb3()

  return useAsyncMemo(async () => {
    if (!library || !account || !token) return

    try {
      const wrappedToken = token as WrappedTokenInfo

      const tokenMigrator = getTokenMigrationContract(library, account)
      const result = await tokenMigrator.upgradedTokenAddress(wrappedToken.address)
      return result
    } catch (e) {
      console.log(e)
    }
  }, [library, account, token])
}

export function useInjectedProvider() {
  const { ethereum: library } = window
  return useMemo(() => library, [library])
}
