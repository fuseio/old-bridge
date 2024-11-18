import { createAction } from '@reduxjs/toolkit'

export const setFieldValue = createAction<{ symbol; field; value }>('stake/setFieldValue')
