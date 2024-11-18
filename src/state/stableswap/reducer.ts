import { createReducer } from '@reduxjs/toolkit'
import { Field, replaceSwapState, selectCurrency, selectPool, switchCurrencies, typeInput } from './actions'
import { STABLESWAP_POOLS } from '../../constants'

const DEFAULT_POOL = Object.keys(STABLESWAP_POOLS)[0]

export interface StableSwapState {
  readonly independentField: Field
  readonly typedValue: string
  readonly pool: string
  readonly [Field.INPUT]: {
    readonly currencyId: string | undefined
  }
  readonly [Field.OUTPUT]: {
    readonly currencyId: string | undefined
  }
}

const initialState: StableSwapState = {
  independentField: Field.INPUT,
  typedValue: '0',
  pool: DEFAULT_POOL,
  [Field.INPUT]: {
    currencyId: STABLESWAP_POOLS[DEFAULT_POOL].tokenList[0].address
  },
  [Field.OUTPUT]: {
    currencyId: STABLESWAP_POOLS[DEFAULT_POOL].tokenList[1].address
  }
}

export default createReducer<StableSwapState>(initialState, builder =>
  builder
    .addCase(replaceSwapState, (state, { payload: { typedValue, field, inputCurrencyId, outputCurrencyId, pool } }) => {
      return {
        [Field.INPUT]: {
          currencyId: inputCurrencyId ?? STABLESWAP_POOLS[pool ?? DEFAULT_POOL].tokenList[0].address
        },
        [Field.OUTPUT]: {
          currencyId: outputCurrencyId ?? STABLESWAP_POOLS[pool ?? DEFAULT_POOL].tokenList[1].address
        },
        pool: pool ?? DEFAULT_POOL,
        independentField: field,
        typedValue: typedValue
      }
    })
    .addCase(selectCurrency, (state, { payload: { currencyId, field } }) => {
      const otherField = field === Field.INPUT ? Field.OUTPUT : Field.INPUT

      if (currencyId === state[otherField].currencyId) {
        return {
          ...state,
          independentField: state.independentField === Field.INPUT ? Field.OUTPUT : Field.INPUT,
          [field]: { currencyId: currencyId },
          [otherField]: { currencyId: state[field].currencyId }
        }
      } else {
        return {
          ...state,
          [field]: { currencyId: currencyId }
        }
      }
    })
    .addCase(switchCurrencies, state => {
      return {
        ...state,
        independentField: state.independentField === Field.INPUT ? Field.OUTPUT : Field.INPUT,
        [Field.INPUT]: { currencyId: state[Field.OUTPUT].currencyId },
        [Field.OUTPUT]: { currencyId: state[Field.INPUT].currencyId }
      }
    })
    .addCase(typeInput, (state, { payload: { field, typedValue } }) => {
      return {
        ...state,
        independentField: field,
        typedValue
      }
    })
    .addCase(selectPool, (state, { payload: pool }) => {
      return {
        ...state,
        pool
      }
    })
)
