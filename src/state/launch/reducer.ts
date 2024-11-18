import { createReducer } from '@reduxjs/toolkit'
import { addLaunch, addUserLaunch } from './actions'

const initialState = {
  launches: [],
  user: [],
}
export default createReducer(initialState, (builder) =>
  builder
    .addCase(addLaunch, (state, { payload }) => {
      if (payload) {
        const index = state.launches.findIndex((launch) => launch.contractAddress === payload.contractAddress)

        if (index !== -1) {
          // If found, replace the object at the specific index
          state.launches[index] = payload
        } else {
          // If not found, push the new payload to the array
          state.launches.push(payload)
        }
      }
    })
    .addCase(addUserLaunch, (state, { payload }) => {
      if (payload) {
        const index = state.user.findIndex((launch) => launch.contractAddress === payload.contractAddress)

        if (index !== -1) {
          // If found, replace the object at the specific index
          state.user[index] = payload
        } else {
          // If not found, push the new payload to the array
          state.user.push(payload)
        }
      }
    })
)
