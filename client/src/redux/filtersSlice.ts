import {
  AirtableBaseNameEnum,
  type DatePartSelection,
  type FilterInterface,
  type searchInGivenFilterInterface,
  type FilterTagInterface,
} from '@/types'
import {
  createSlice,
  type PayloadAction,
} from '@reduxjs/toolkit'

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
  dateStart: DatePartSelection
  dateEnd: DatePartSelection
  searchInGivenFilter: searchInGivenFilterInterface
  filterTags: FilterTagInterface[]
}

export interface ToggleSelectedPayload {
  id: string
  checked: boolean
}

const initialState: FiltersState = {
  countries: {
    label: AirtableBaseNameEnum.Countries,
    value: [],
    available: false,
  },
  outcomes: {
    label: AirtableBaseNameEnum.Outcomes,
    value: [],
    available: false,
  },
  legalProcedureTypes: {
    label: AirtableBaseNameEnum.LegalProcedureTypes,
    value: [],
    available: false,
  },
  applicationTypes: {
    label: AirtableBaseNameEnum.ApplicationTypes,
    value: [],
    available: false,
  },
  asylumProcedures: {
    label: AirtableBaseNameEnum.AsylumProcedures,
    value: [],
    available: false,
  },
  searchInGivenFilter: {
    value: '',
    airtableBaseName: AirtableBaseNameEnum.Countries,
    needFetch: false,
  },
  countriesSelected: [],
  outcomesSelected: [],
  legalProcedureTypesSelected: [],
  applicationTypesSelected: [],
  asylumProceduresSelected: [],
  dateStart: {
    month: null,
    year: null,
  },
  dateEnd: {
    month: null,
    year: null,
  },
  filterTags: [],
}

const filtersSlice = createSlice({
  name: 'filters',
  initialState,
  reducers: {
    // --- Available filter data (fetched from Airtable) ---
    setSearchInGivenFilter: (state, action: PayloadAction<searchInGivenFilterInterface>) => {
      if (action.payload.needFetch) {
        state.searchInGivenFilter = action.payload
      }
    },
    setFilterTag: (state, action: PayloadAction<{ itemChecked: boolean, item: FilterTagInterface }>) => {
      const { itemChecked, item } = action.payload
      if (itemChecked) {
        const alreadyExists = state.filterTags.some(tag => tag.id === item.id)
        if (!alreadyExists) {
          state.filterTags.push(item)
        }
      }
      else {
        state.filterTags = state.filterTags.filter(tag => tag.id !== item.id)
      }
    },
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
      state.asylumProcedures = action.payload
    },
    setDateStart: (state, action: PayloadAction<DatePartSelection>) => {
      state.dateStart = action.payload
    },
    setDateEnd: (state, action: PayloadAction<DatePartSelection>) => {
      state.dateEnd = action.payload
    },
    resetCountriesFilter: (state) => { state.countries = initialState.countries },
    resetOutcomesFilter: (state) => { state.outcomes = initialState.outcomes },
    resetLegalProcedureTypesFilter: (state) => { state.legalProcedureTypes = initialState.legalProcedureTypes },
    resetApplicationTypesFilter: (state) => { state.applicationTypes = initialState.applicationTypes },
    resetAsylumProceduresFilter: (state) => { state.asylumProcedures = initialState.asylumProcedures },
    resetDateStart: (state) => { state.dateStart = initialState.dateStart },
    resetDateEnd: (state) => { state.dateEnd = initialState.dateEnd },

    // --- Selected filter item IDs (id de BasicValuesInterface) ---
    toggleCountriesSelected: (state, action: PayloadAction<ToggleSelectedPayload>) => {
      if (action.payload.checked) {
        if (!state.countriesSelected.includes(action.payload.id)) {
          state.countriesSelected.push(action.payload.id)
        }
      }
      else {
        state.countriesSelected = state.countriesSelected.filter(id => id !== action.payload.id)
      }
    },

    toggleOutcomesSelected: (state, action: PayloadAction<ToggleSelectedPayload>) => {
      if (action.payload.checked) {
        if (!state.outcomesSelected.includes(action.payload.id)) {
          state.outcomesSelected.push(action.payload.id)
        }
      }
      else {
        state.outcomesSelected = state.outcomesSelected.filter(id => id !== action.payload.id)
      }
    },

    toggleLegalProcedureTypesSelected: (state, action: PayloadAction<ToggleSelectedPayload>) => {
      if (action.payload.checked) {
        if (!state.legalProcedureTypesSelected.includes(action.payload.id)) {
          state.legalProcedureTypesSelected.push(action.payload.id)
        }
      }
      else {
        state.legalProcedureTypesSelected = state.legalProcedureTypesSelected.filter(id => id !== action.payload.id)
      }
    },

    toggleApplicationTypesSelected: (state, action: PayloadAction<ToggleSelectedPayload>) => {
      if (action.payload.checked) {
        if (!state.applicationTypesSelected.includes(action.payload.id)) {
          state.applicationTypesSelected.push(action.payload.id)
        }
      }
      else {
        state.applicationTypesSelected = state.applicationTypesSelected.filter(id => id !== action.payload.id)
      }
    },

    toggleAsylumProceduresSelected: (state, action: PayloadAction<ToggleSelectedPayload>) => {
      if (action.payload.checked) {
        if (!state.asylumProceduresSelected.includes(action.payload.id)) {
          state.asylumProceduresSelected.push(action.payload.id)
        }
      }
      else {
        state.asylumProceduresSelected = state.asylumProceduresSelected.filter(id => id !== action.payload.id)
      }
    },

    resetAllSelected: (state) => {
      state.countriesSelected = []
      state.outcomesSelected = []
      state.legalProcedureTypesSelected = []
      state.applicationTypesSelected = []
      state.asylumProceduresSelected = []
      state.dateStart = initialState.dateStart
      state.dateEnd = initialState.dateEnd
      state.filterTags = []
    },
  },
})

export const {
  setFilterTag,
  setCountriesFilter,
  setOutcomesFilter,
  setLegalProcedureTypesFilter,
  setApplicationTypesFilter,
  setAsylumProceduresFilter,
  setDateStart,
  setDateEnd,
  setSearchInGivenFilter,
  resetCountriesFilter,
  resetOutcomesFilter,
  resetApplicationTypesFilter,
  resetAsylumProceduresFilter,
  resetLegalProcedureTypesFilter,
  resetDateStart,
  resetDateEnd,
  toggleCountriesSelected,
  toggleOutcomesSelected,
  toggleLegalProcedureTypesSelected,
  toggleApplicationTypesSelected,
  toggleAsylumProceduresSelected,

  resetAllSelected,
} = filtersSlice.actions

export default filtersSlice.reducer
