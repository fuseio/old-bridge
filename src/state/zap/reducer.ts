import { createReducer } from '@reduxjs/toolkit'
import { Field, replaceZapState, selectCurrency, typeInput } from './actions'

export interface ZapState {
  readonly independentField: Field
  readonly typedValue: string
  readonly [Field.INPUT]: {
    readonly currencyId: string | undefined
  }
  readonly [Field.OUTPUT]: {
    readonly currencyId: string | undefined
  }
}

const initialState: ZapState = {
  independentField: Field.INPUT,
  typedValue: '0',
  [Field.INPUT]: {
    currencyId: 'FUSE'
  },
  [Field.OUTPUT]: {
    currencyId: '0x7Fe1A61E4FE983D275cb5669072A9d1dee9Bd45C'
  }
}

export default createReducer<ZapState>(initialState, builder =>
  builder
    .addCase(replaceZapState, (state, { payload: { typedValue, field, inputCurrencyId, outputCurrencyId } }) => {
      return {
        [Field.INPUT]: {
          currencyId: inputCurrencyId ?? ''
        },
        [Field.OUTPUT]: {
          currencyId: outputCurrencyId ?? ''
        },
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
    .addCase(typeInput, (state, { payload: { field, typedValue } }) => {
      return {
        ...state,
        independentField: field,
        typedValue
      }
    })
)
