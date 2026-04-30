import type { chartName } from '@/types/chartNames'
import { createSlice } from '@reduxjs/toolkit'

import {
  type PayloadAction,
} from '@reduxjs/toolkit'

interface ChartState {
  chartName: chartName
}

const initialState: ChartState = {
  chartName: 'global',
}

const chartSlice = createSlice({
  name: 'charts',
  initialState,
  reducers: {
    setChartToDisplay: (state, action: PayloadAction<chartName>) => {
      state.chartName = action.payload
      console.log('setChartToDisplay in action')
    },
  },
})

export const {
  setChartToDisplay,
} = chartSlice.actions

export default chartSlice.reducer
