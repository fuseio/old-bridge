import { createAction } from '@reduxjs/toolkit'

export enum BridgeType {
  ETH_FUSE_NATIVE = 'ETH_FUSE_NATIVE',
  ETH_FUSE_ERC677_TO_ERC677 = 'ETH_FUSE_ERC677_TO_ERC677',
  ETH_FUSE_ERC20_TO_ERC677 = 'ETH_FUSE_ERC20_TO_ERC677',
  BSC_FUSE_ERC20_TO_ERC677 = 'BSC_FUSE_ERC20_TO_ERC677',
  BSC_FUSE_NATIVE = 'BSC_FUSE_NATIVE',
  BSC_FUSE_BNB_NATIVE = 'BSC_FUSE_BNB_NATIVE',
}

export enum BridgeDirection {
  ETH_TO_FUSE = 'ETH_TO_FUSE',
  FUSE_TO_ETH = 'FUSE_TO_ETH',
  BSC_TO_FUSE = 'BSC_TO_FUSE',
  FUSE_TO_BSC = 'FUSE_TO_BSC',
}

export enum Field {
  INPUT = 'INPUT',
}

export enum BridgeTransactionStatus {
  INITIAL,
  TOKEN_TRANSFER_PENDING,
  TOKEN_TRANSFER_SUCCESS,
  CONFIRMATION_TRANSACTION_PENDING,
  CONFIRMATION_TRANSACTION_SUCCESS,
  CONFIRM_TOKEN_TRANSFER_PENDING,
  CONFIRM_TOKEN_TRANSFER_SUCCESS,
}

export const selectCurrency = createAction<{ field: Field; currencyId: string | undefined }>('bridge/selectCurrency')
export const typeInput = createAction<{ field: Field; typedValue: string }>('bridge/typeInput')

export const tokenTransferPending = createAction('bridge/tokenTransferPending')
export const tokenTransferSuccess = createAction('bridge/tokenTransferSuccess')

export const confirmTransactionPending = createAction('bridge/confirmTransactionPending')
export const updateConfirmationsCount = createAction<{ confirmations: number }>('bridge/updateConfirmationsCount')
export const confirmTransactionSuccess = createAction('bridge/confirmTransactionSuccess')

export const confirmTokenTransferPending = createAction('bridge/confirmTokenTransferPending')
export const confirmTokenTransferSuccess = createAction('bridge/confirmTokenTransferSuccess')

export const transferError = createAction('bridge/transferError')

export const selectBridgeDirection = createAction<{ direction: BridgeDirection }>('bridge/selectBridgeDirection')

export const setRecipient = createAction<string>('bridge/setRecipient')

export const addBridgeTransaction = createAction<{
  foreignTxHash?: string
  homeTxHash?: string
  bridgeType?: BridgeType
  bridgeDirection: BridgeDirection
}>('bridge/addBridgeTransaction')

export const setCurrentBridgeTransaction = createAction<{
  foreignTxHash?: string
  homeTxHash?: string
  bridgeType?: BridgeType
  bridgeDirection: BridgeDirection
} | null>('bridge/setCurrentBridgeTransaction')

export const finalizeBridgeTransaction = createAction<{ homeTxHash: string; foreignTxHash: string }>(
  'bridge/finalizeBridgeTransaction'
)
