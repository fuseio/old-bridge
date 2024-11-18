import { createAction } from '@reduxjs/toolkit'

export const addTokenPairs = createAction<any>('pool/addTokenPairs')
export const setLoadingPairs = createAction<any>('pool/setLoadingPairs')
export const addUserTokenPairs = createAction<any>('pool/addUserTokenPairs')
export const addUserMerklPairs = createAction<any>('pool/addUserMerklPairs')
export const addMerklPairs = createAction<any>('pool/addMerklPairs')
