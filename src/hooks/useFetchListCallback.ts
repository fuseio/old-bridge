import { useCallback } from 'react'
import { useDispatch } from 'react-redux'
import { nanoid } from '@reduxjs/toolkit'
import { TokenList } from '@fuseio/token-lists'
import { ChainId } from '@voltage-finance/sdk-core'

import { useWeb3 } from './index'
import { AppDispatch } from '../state'
import getTokenList from '../utils/getTokenList'
import { getNetworkLibrary } from '../connectors'
import { fetchTokenList } from '../state/lists/actions'
import resolveENSContentHash from '../utils/resolveENSContentHash'

export function useFetchListCallback(): (listUrl: string, listType: CurrencyListType) => Promise<TokenList> {
  const { chainId, library } = useWeb3()
  const dispatch = useDispatch<AppDispatch>()

  const ensResolver = useCallback(
    (ensName: string) => {
      if (!library || chainId !== ChainId.MAINNET) {
        const networkLibrary = getNetworkLibrary()
        if (networkLibrary) {
          return resolveENSContentHash(ensName, networkLibrary)
        }

        throw new Error('Could not construct mainnet ENS resolver')
      }
      return resolveENSContentHash(ensName, library)
    },
    [chainId, library]
  )

  return useCallback(
    async (listUrl: string, listType: CurrencyListType) => {
      const requestId = nanoid()
      dispatch(fetchTokenList.pending({ requestId, listType, url: listUrl }))
      return getTokenList(listUrl, ensResolver)
        .then((tokenList) => {
          dispatch(fetchTokenList.fulfilled({ url: listUrl, tokenList, requestId, listType }))
          return tokenList
        })
        .catch((error) => {
          console.debug(`Failed to get list at url ${listUrl}`, error)
          dispatch(fetchTokenList.rejected({ url: listUrl, requestId, listType, errorMessage: error.message }))
          throw error
        })
    },
    [dispatch, ensResolver]
  )
}
