import { createReducer } from '@reduxjs/toolkit'
import { addExpiredFarms, addFarms, addMyFarms, addV3Farms, setFarmsLoading } from './actions'

const initialState = {
  farms: {
    activeFarms: [],
    expiredFarms: [],
    myFarms: [],
    v3Farms: [],
    loadingFarms: false,
  },
}

export default createReducer(initialState, (builder) =>
  builder
    .addCase(addExpiredFarms, (state, { payload }) => {
      state.farms.expiredFarms = payload
    })
    .addCase(addFarms, (state, { payload }) => {
      state.farms.activeFarms = payload
    })
    .addCase(addMyFarms, (state, { payload }) => {
      state.farms.myFarms = payload
    })
    .addCase(addV3Farms, (state, { payload }) => {
      state.farms.v3Farms = payload
    })
    .addCase(setFarmsLoading, (state, { payload }) => {
      state.farms.loadingFarms = payload
    })
)
