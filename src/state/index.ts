import { configureStore, getDefaultMiddleware } from '@reduxjs/toolkit'
import { save, load } from 'redux-localstorage-simple'

import application from './application/reducer'
import { updateVersion } from './global/actions'
import user from './user/reducer'
import transactions from './transactions/reducer'
import swap from './swap/reducer'
import mint from './mint/reducer'
import lists from './lists/reducer'
import burn from './burn/reducer'
import multicall from './multicall/reducer'
import bridge from './bridge/reducer'
import stableswap from './stableswap/reducer'
import zap from './zap/reducer'
import stake from './stake/reducer'
import pool from './pool/reducer'
import farm from './farm/reducer'
import launch from './launch/reducer'
import mintV3 from './mint/v3/reducer'
import burnV3 from './burn/v3/reducer'

import { BridgeTransactionStatus } from './bridge/actions'
import { Field } from './bridge/actions'
import { INITIAL_ALLOWED_SLIPPAGE, INITIAL_STABLESWAP_SLIPPAGE, DEFAULT_DEADLINE_FROM_NOW } from '../constants'
import { currentTimestamp } from '../utils'

const PERSISTED_KEYS: string[] = ['user', 'transactions', 'lists', 'bridge.bridgeTransactions']

const store = configureStore({
  reducer: {
    application,
    user,
    transactions,
    swap,
    mint,
    burn,
    multicall,
    lists,
    pool,
    bridge,
    stableswap,
    stake,
    farm,
    zap,
    launch,
    mintV3,
    burnV3
  },
  middleware: [...getDefaultMiddleware({ thunk: false, serializableCheck: false }), save({ states: PERSISTED_KEYS })],
  preloadedState: load({
    states: PERSISTED_KEYS,
    preloadedState: {
      bridge: {
        independentField: Field.INPUT,
        typedValue: '',
        [Field.INPUT]: {
          currencyId: '',
        },
        recipient: '',
        bridgeTransactionStatus: BridgeTransactionStatus.INITIAL,
        confirmations: 0,
        currentAmbBridgeTransaction: null,
        currentNativeBridgeTransaction: null,
        bridgeTransactions: [],
      },
      user: {
        userDarkMode: null,
        matchesDarkMode: false,
        userExpertMode: false,
        userSlippageTolerance: INITIAL_ALLOWED_SLIPPAGE,
        userStableSlippageTolerance: INITIAL_STABLESWAP_SLIPPAGE,
        userDeadline: DEFAULT_DEADLINE_FROM_NOW,
        tokens: {},
        pairs: {},
        timestamp: currentTimestamp(),
        completedBridgeTransfer: false,
        autoSlippageMode: true
      }
    },
  }),
})

store.dispatch(updateVersion())

export default store

export type AppState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
