import { createReducer } from '@reduxjs/toolkit'
import { setFieldValue } from './actions'

const initialState = {
  xVOLT: {
    tvl: null,
    apy: null,
    apySinceDayZero: null,
    stakers: null
  },
  sFUSE: {
    tvl: null,
    apy: null,
    validators: null,
    apySinceDayZero: null
  }
}

export default createReducer(initialState, builder =>
  builder.addCase(setFieldValue, (state, { payload: { symbol, field, value } }) => {
    state[symbol][field] = value
  })
)
