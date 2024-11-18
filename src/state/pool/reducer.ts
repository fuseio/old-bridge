import { createReducer } from '@reduxjs/toolkit'

import { addMerklPairs, addTokenPairs, addUserMerklPairs, addUserTokenPairs, setLoadingPairs } from './actions'

const initialState = {
  pairs: [],
  userPairs: [],
  userMerklPairs: [],
  merklPairs: {},
  loadingPairs: false,
}

export default createReducer(initialState, (builder) =>
  builder
    .addCase(addTokenPairs, (state, { payload }) => {
      const allPairs = [...state.pairs, ...payload]
      const uniquePairsById = Array.from(new Map(allPairs.map((item) => [item.id, item])).values())
      state.pairs = uniquePairsById
    })

    .addCase(addUserTokenPairs, (state, { payload }) => {
      const allUserPairs = [...state.userPairs, ...payload]
      const uniqueUserPairsById = Array.from(new Map(allUserPairs.map((item) => [item.id, item])).values())
      const sortedUserPairs = uniqueUserPairsById.sort((a, b) => {
        // Sort by 'version' descending
        if (b.version > a.version) return 1
        if (b.version < a.version) return -1

        return 0
      })
      state.userPairs = sortedUserPairs
    })

    .addCase(setLoadingPairs, (state, { payload }) => {
      state.loadingPairs = payload
    })
    .addCase(addUserMerklPairs, (state, { payload }) => {
      state.userMerklPairs = payload
    })
    .addCase(addMerklPairs, (state, { payload }) => {
      state.merklPairs = payload
    })
)
