import { createAction } from '@reduxjs/toolkit'

export const addFarms = createAction<any>('farm/addFarms')
export const addExpiredFarms = createAction<any>('farm/addExpiredFarms')
export const addMyFarms = createAction<any>('farm/addMyFarms')
export const setFarmsLoading = createAction<any>('farm/setFarmsLoading')
export const addV3Farms = createAction<any>('farm/addV3Farms')
