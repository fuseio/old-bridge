import { createAction } from '@reduxjs/toolkit'

export enum Field {
  INPUT = 'INPUT',
  OUTPUT = 'OUTPUT'
}

export const selectCurrency = createAction<{ field: Field; currencyId: string }>('stableswap/selectCurrency')
export const switchCurrencies = createAction<void>('stableswap/switchCurrencies')
export const typeInput = createAction<{ field: Field; typedValue: string }>('stableswap/typeInput')
export const replaceSwapState = createAction<{
  field: Field
  typedValue: string
  inputCurrencyId?: string
  outputCurrencyId?: string
  pool?: string
}>('stableswap/replaceSwapState')
export const selectPool = createAction<string>('stableswap/selectPool')
