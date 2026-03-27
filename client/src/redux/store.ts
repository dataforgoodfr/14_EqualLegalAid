import { configureStore } from '@reduxjs/toolkit'
import filtersReducer from './filtersSlice'
import chartReducer from './chartSlice'

export const store = configureStore({
  reducer: {
    filters: filtersReducer,
    charts: chartReducer,
  },
})

// Types utiles à exporter
export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
