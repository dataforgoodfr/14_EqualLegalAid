import { createSlice } from '@reduxjs/toolkit'

import {
  type PayloadAction,
} from '@reduxjs/toolkit'

interface ChartState {
  chartName: string
}

const initialState: ChartState = {
  chartName: 'global',
}

const chartSlice = createSlice({
  name: 'charts',
  initialState,
  reducers: {
    setChartToDisplay: (state, action: PayloadAction<string>) => {
      state.chartName = action.payload
      console.log('setChartToDisplay in action')
    },
  },
})

export const {
  setChartToDisplay,
} = chartSlice.actions

export default chartSlice.reducer
