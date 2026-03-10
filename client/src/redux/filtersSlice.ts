import { AiretableBaseNameEnum, type FilterInterface } from '@/types'
import { createSlice, type PayloadAction } from '@reduxjs/toolkit'

interface FiltersState {
  countries: FilterInterface
  outcomes: FilterInterface
  legalProcedureTypes: FilterInterface
  countriesSelected: string[]
  outcomesSelected: string[]
  legalProcedureTypesSelected: string[]
  applicationTypes: FilterInterface
  applicationTypesSelected: string[]
  asylumProcedures: FilterInterface
  asylumProceduresSelected: string[]
}

export interface ToggleSelectedPayload {
  id: string
  checked: boolean
}

const initialState: FiltersState = {
  countries: {
    label: AiretableBaseNameEnum.Countries,
    value: [],
    available: false,
  },
  outcomes: {
    label: AiretableBaseNameEnum.Outcomes,
    value: [],
    available: false,
  },
  legalProcedureTypes: {
    label: AiretableBaseNameEnum.LegalProcedureTypes,
    value: [],
    available: false,
  },
  applicationTypes: {
    label: AiretableBaseNameEnum.ApplicationTypes,
    value: [],
    available: false,
  },
  asylumProcedures  : {
    label: AiretableBaseNameEnum.AsylumProcedures,
    value: [],
    available: false,
  },
  countriesSelected: [],
  outcomesSelected: [],
  legalProcedureTypesSelected: [],
  applicationTypesSelected: [],
  asylumProceduresSelected: [],
}

const filtersSlice = createSlice({
  name: 'filters',
  initialState,
  reducers: {
    // --- Available filter data (fetched from Airtable) ---
    setCountriesFilter: (state, action: PayloadAction<FilterInterface>) => {
      state.countries = action.payload
    },
    setOutcomesFilter: (state, action: PayloadAction<FilterInterface>) => {
      state.outcomes = action.payload
    },
    setLegalProcedureTypesFilter: (state, action: PayloadAction<FilterInterface>) => {
      state.legalProcedureTypes = action.payload
    },
    setApplicationTypesFilter: (state, action: PayloadAction<FilterInterface>) => {
      state.applicationTypes = action.payload
    },
    setAsylumProceduresFilter: (state, action: PayloadAction<FilterInterface>) => {
      state.applicationTypes = action.payload
    },
    resetCountriesFilter: (state) => { state.countries = initialState.countries },
    resetOutcomesFilter: (state) => { state.outcomes = initialState.outcomes },
    resetLegalProcedureTypesFilter: (state) => { state.legalProcedureTypes = initialState.legalProcedureTypes },
    resetApplicationTypesFilter: (state) => { state.applicationTypes = initialState.applicationTypes },
    resetAsylumProceduresFilter: (state) => { state.asylumProcedures = initialState.asylumProcedures },
    
    // --- Selected filter item IDs (id de BasicValuesInterface) ---
    toggleCountriesSelected: (state, action: PayloadAction<ToggleSelectedPayload>) => {
      if (action.payload.checked) {
        if (!state.countriesSelected.includes(action.payload.id)) {
          state.countriesSelected.push(action.payload.id)
        }
      } else {
        state.countriesSelected = state.countriesSelected.filter(id => id !== action.payload.id)
      }
    },
    toggleOutcomesSelected: (state, action: PayloadAction<ToggleSelectedPayload>) => {
      if (action.payload.checked) {
        if (!state.outcomesSelected.includes(action.payload.id)) {
          state.outcomesSelected.push(action.payload.id)
        }
      } else {
        state.outcomesSelected = state.outcomesSelected.filter(id => id !== action.payload.id)
      }
    },
    toggleLegalProcedureTypesSelected: (state, action: PayloadAction<ToggleSelectedPayload>) => {
      if (action.payload.checked) {
        if (!state.legalProcedureTypesSelected.includes(action.payload.id)) {
          state.legalProcedureTypesSelected.push(action.payload.id)
        }
      } else {
        state.legalProcedureTypesSelected = state.legalProcedureTypesSelected.filter(id => id !== action.payload.id)
      }
    },
        toggleApplicationTypesSelected: (state, action: PayloadAction<ToggleSelectedPayload>) => {
      if (action.payload.checked) {
        if (!state.applicationTypesSelected.includes(action.payload.id)) {
          state.applicationTypesSelected.push(action.payload.id)
        }
      } else {
        state.applicationTypesSelected = state.applicationTypesSelected.filter(id => id !== action.payload.id)
      }
    },
    toggleAsylumProceduresSelected: (state, action: PayloadAction<ToggleSelectedPayload>) => {
      if (action.payload.checked) {
        if (!state.asylumProceduresSelected.includes(action.payload.id)) {
          state.asylumProceduresSelected.push(action.payload.id)
        }
      } else {
        state.asylumProceduresSelected = state.asylumProceduresSelected.filter(id => id !== action.payload.id)
      }
    },
    resetAllSelected: (state) => {
      state.countriesSelected = []
      state.outcomesSelected = []
      state.legalProcedureTypesSelected = []
      state.applicationTypesSelected = []
      state.asylumProceduresSelected = []
    },
  },
})

export const {
  setCountriesFilter,
  setOutcomesFilter,
  setLegalProcedureTypesFilter,
  setApplicationTypesFilter,
  setAsylumProceduresFilter,
  resetCountriesFilter,
  resetOutcomesFilter,
  resetApplicationTypesFilter,
  resetAsylumProceduresFilter,
  resetLegalProcedureTypesFilter,
  toggleCountriesSelected,
  toggleOutcomesSelected,
  toggleLegalProcedureTypesSelected,
  toggleApplicationTypesSelected,
  toggleAsylumProceduresSelected,

  resetAllSelected,
} = filtersSlice.actions

export default filtersSlice.reducer
