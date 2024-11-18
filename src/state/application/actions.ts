import { createAction } from '@reduxjs/toolkit'
import { TokenList } from '@fuseio/token-lists'
import { Currency } from '@voltage-finance/sdk-core'

export type PopupContent =
  | {
      txn: {
        hash: string
        success: boolean
        summary?: string
      }
    }
  | {
      listUpdate: {
        listUrl: string
        oldList: TokenList
        newList: TokenList
        auto: boolean
        listType: CurrencyListType
      }
    }
  | {
      deprecated: {
        token: string
        currency: Currency
      }
    }
  | {
      error: {
        summary: string
      }
    }
export const setConnectedStatus = createAction<{ connected: string }>('app/setConnectedStatus')
export const updateBlockNumber = createAction<{ chainId: number; blockNumber: number }>('app/updateBlockNumber')
export const toggleWalletModal = createAction<void>('app/toggleWalletModal')
export const toggleSettingsMenu = createAction<void>('app/toggleSettingsMenu')
export const toggleNavMenu = createAction<void>('app/toggleNavMenu')
export const toggleClaimModal = createAction<void>('app/toggleClaimModal')
export const toggleLendingModal = createAction<void>('app/toggleLendingModal')
export const addPopup = createAction<{ key?: string; removeAfterMs?: number | null; content: PopupContent }>(
  'app/addPopup'
)
export const removePopup = createAction<{ key: string }>('app/removePopup')
