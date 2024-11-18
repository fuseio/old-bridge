import { isEmpty } from 'lodash'
import { parseBytes32String } from '@ethersproject/strings'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { Currency, Token, ChainId } from '@voltage-finance/sdk-core'

import { useWeb3 } from './index'
import { fuseReadProvider } from '../connectors'
import useNativeCurrency from './useNativeCurrency'
import ERC20_INTERFACE from '../constants/abis/erc20'
import { getReadContract, isAddress } from '../utils'
import { useUserAddedTokens } from '../state/user/hooks'
import { useBytes32TokenContract, useTokenContract } from './useContract'
import { NEVER_RELOAD, useSingleCallResult } from '../state/multicall/hooks'
import { useSelectedSwapTokenList, useSelectedBridgeTokenList } from '../state/lists/hooks'

export function useAllSwapTokens(): { [address: string]: Token } {
  const { chainId } = useWeb3()
  const userAddedTokens = useUserAddedTokens()
  const allTokens = useSelectedSwapTokenList()

  return useMemo(() => {
    // if (!chainId) return {}
    return (
      userAddedTokens
        // reduce into all ALL_TOKENS filtered by the current chain
        .reduce<{ [address: string]: Token }>(
          (tokenMap, token) => {
            tokenMap[token.address] = token
            return tokenMap
          },
          // must make a copy because reduce modifies the map, and we do not
          // want to make a copy in every iteration
          { ...(isEmpty(allTokens[chainId]) ? allTokens[ChainId.FUSE] : allTokens[chainId]) }
        )
    )
  }, [chainId, userAddedTokens, allTokens])
}

export function useAllBridgeTokens(): { [address: string]: Token } {
  const { chainId } = useWeb3()
  const userAddedTokens = useUserAddedTokens()
  const allTokens = useSelectedBridgeTokenList()
  return useMemo(() => {
    // if (!chainId) return {}
    return (
      userAddedTokens
        // reduce into all ALL_TOKENS filtered by the current chain
        .reduce<{ [address: string]: Token }>(
          (tokenMap, token) => {
            tokenMap[token.address] = token
            return tokenMap
          },
          // must make a copy because reduce modifies the map, and we do not
          // want to make a copy in every iteration
          { ...allTokens[chainId || ChainId.FUSE] }
        )
    )
  }, [chainId, userAddedTokens, allTokens])
}

// Check if currency is included in custom list from user storage
export function useIsUserAddedToken(currency: Currency): boolean {
  const userAddedTokens = useUserAddedTokens()
  return !!userAddedTokens.find((token) => currency.equals(token))
}

// parse a name or symbol from a token response
const BYTES32_REGEX = /^0x[a-fA-F0-9]{64}$/
function parseStringOrBytes32(str: string | undefined, bytes32: string | undefined, defaultValue: string): string {
  return str && str.length > 0
    ? str
    : bytes32 && BYTES32_REGEX.test(bytes32)
    ? parseBytes32String(bytes32)
    : defaultValue
}

// undefined if invalid or does not exist
// null if loading
// otherwise returns the token
export function useToken(tokenAddress?: string, listType?: CurrencyListType): Token | undefined | null {
  const { chainId } = useWeb3()
  const useAllTokens = listType === 'Swap' ? useAllSwapTokens : useAllBridgeTokens
  const tokens = useAllTokens()

  const address = isAddress(tokenAddress)

  const tokenContract = useTokenContract(address ? address : undefined, false)
  const tokenContractBytes32 = useBytes32TokenContract(address ? address : undefined, false)
  const token: Token | undefined = address ? tokens[address] : undefined

  const tokenName = useSingleCallResult(token ? undefined : tokenContract, 'name', undefined, NEVER_RELOAD)
  const tokenNameBytes32 = useSingleCallResult(
    token ? undefined : tokenContractBytes32,
    'name',
    undefined,
    NEVER_RELOAD
  )
  const symbol = useSingleCallResult(token ? undefined : tokenContract, 'symbol', undefined, NEVER_RELOAD)
  const symbolBytes32 = useSingleCallResult(token ? undefined : tokenContractBytes32, 'symbol', undefined, NEVER_RELOAD)
  const decimals = useSingleCallResult(token ? undefined : tokenContract, 'decimals', undefined, NEVER_RELOAD)

  return useMemo(() => {
    if (token) return token
    if (!chainId || !address) return undefined
    if (decimals.loading || symbol.loading || tokenName.loading) return null
    if (decimals.result) {
      return new Token(
        chainId,
        address,
        decimals.result[0],
        parseStringOrBytes32(symbol.result?.[0], symbolBytes32.result?.[0], 'UNKNOWN'),
        parseStringOrBytes32(tokenName.result?.[0], tokenNameBytes32.result?.[0], 'Unknown Token')
      )
    }
    return undefined
  }, [
    address,
    chainId,
    decimals.loading,
    decimals.result,
    symbol.loading,
    symbol.result,
    symbolBytes32.result,
    token,
    tokenName.loading,
    tokenName.result,
    tokenNameBytes32.result,
  ])
}

export function useTokenOnChain(tokenAddress?: string, chainId?: ChainId): Token | undefined | null {
  const [token, setToken] = useState(null)

  const address = isAddress(tokenAddress)

  const getToken = useCallback(async () => {
    if (!address || !chainId) return null

    const tokenContract = getReadContract(address, ERC20_INTERFACE, fuseReadProvider)

    const name = await tokenContract.name()
    const decimals = await tokenContract.decimals()
    const symbol = await tokenContract.symbol()

    return address && decimals && symbol && name ? new Token(ChainId.FUSE, address, decimals, symbol, name) : null
  }, [address, chainId])

  useEffect(() => {
    getToken().then((tkn) => {
      if (tkn) {
        setToken(tkn)
      }
    })
  }, [getToken])

  return useMemo(() => token, [token])
}

export function useCurrency(
  currencyId: string | undefined,
  listType: CurrencyListType = 'Swap'
): Currency | null | undefined {
  const native = useNativeCurrency()
  const isNative = currencyId?.toUpperCase() === native.symbol?.toUpperCase()
  const token = useToken(isNative ? undefined : currencyId, listType)
  return isNative ? native : token
}
