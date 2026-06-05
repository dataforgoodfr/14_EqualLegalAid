import {
  AirtableBaseNameEnum,
  type AirtableRecord,
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
  applicationTypes: FilterInterface
  asylumProcedures: FilterInterface
  authorities: FilterInterface
  categories: FilterInterface<AirtableRecord>
  vulnerability: FilterInterface<AirtableRecord>
  groundOfPersecution: FilterInterface<AirtableRecord>
  legalAndProceduralIssues: FilterInterface<AirtableRecord>
  householdIndividualStatus: FilterInterface<AirtableRecord>
  subCategories: FilterInterface<AirtableRecord>
  keywords: FilterInterface<AirtableRecord>
  countriesSelected: string[]
  outcomesSelected: string[]
  legalProcedureTypesSelected: string[]
  applicationTypesSelected: string[]
  asylumProceduresSelected: string[]
  authoritiesSelected: string[]
  keywordsSelected: string[]
  vulnerabilitySelected: string[]
  groundOfPersecutionSelected: string[]
  legalAndProceduralIssuesSelected: string[]
  householdIndividualStatusSelected: string[]
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
  categories: {
    label: AirtableBaseNameEnum.Categories,
    value: [],
    available: false,
  },
  vulnerability: {
    label: AirtableBaseNameEnum.Vulnerability,
    value: [],
    available: false,
  },
  groundOfPersecution: {
    label: AirtableBaseNameEnum.GroundOfPersecution,
    value: [],
    available: false,
  },
  legalAndProceduralIssues: {
    label: AirtableBaseNameEnum.LegalAndProceduralIssues,
    value: [],
    available: false,
  },
  householdIndividualStatus: {
    label: AirtableBaseNameEnum.HouseholdIndividualStatus,
    value: [],
    available: false,
  },
  subCategories: {
    label: AirtableBaseNameEnum.SubCategories,
    value: [],
    available: false,
  },
  keywords: {
    label: AirtableBaseNameEnum.Keywords,
    value: [],
    available: false,
  },
  authorities: {
    label: AirtableBaseNameEnum.Authorities,
    value: [],
    available: false,
  },
  authoritiesSelected: [],
  countriesSelected: [],
  outcomesSelected: [],
  legalProcedureTypesSelected: [],
  applicationTypesSelected: [],
  asylumProceduresSelected: [],
  keywordsSelected: [],
  vulnerabilitySelected: [],
  groundOfPersecutionSelected: [],
  legalAndProceduralIssuesSelected: [],
  householdIndividualStatusSelected: [],
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
    setCategoriesFilter: (state, action: PayloadAction<FilterInterface<AirtableRecord>>) => {
      state.categories = action.payload
    },
    setVulnerabilityFilter: (state, action: PayloadAction<FilterInterface<AirtableRecord>>) => {
      state.vulnerability = action.payload
    },
    setGroundOfPersecutionFilter: (state, action: PayloadAction<FilterInterface<AirtableRecord>>) => {
      state.groundOfPersecution = action.payload
    },
    setLegalAndProceduralIssuesFilter: (state, action: PayloadAction<FilterInterface<AirtableRecord>>) => {
      state.legalAndProceduralIssues = action.payload
    },
    setHouseholdIndividualStatusFilter: (state, action: PayloadAction<FilterInterface<AirtableRecord>>) => {
      state.householdIndividualStatus = action.payload
    },
    setSubCategoriesFilter: (state, action: PayloadAction<FilterInterface<AirtableRecord>>) => {
      state.subCategories = action.payload
    },
    setKeywordsFilter: (state, action: PayloadAction<FilterInterface<AirtableRecord>>) => {
      state.keywords = action.payload
    },
    setAuthoritiesFilter: (state, action: PayloadAction<FilterInterface>) => {
      state.authorities = action.payload
    },
    setDateStart: (state, action: PayloadAction<DatePartSelection>) => {
      state.dateStart = action.payload
    },
    setDateEnd: (state, action: PayloadAction<DatePartSelection>) => {
      state.dateEnd = action.payload
    },
    resetCategoriesFilter: (state) => { state.categories = initialState.categories },
    resetVulnerabilityFilter: (state) => { state.vulnerability = initialState.vulnerability },
    resetGroundOfPersecutionFilter: (state) => { state.groundOfPersecution = initialState.groundOfPersecution },
    resetLegalAndProceduralIssuesFilter: (state) => { state.legalAndProceduralIssues = initialState.legalAndProceduralIssues },
    resetHouseholdIndividualStatusFilter: (state) => { state.householdIndividualStatus = initialState.householdIndividualStatus },
    resetSubCategoriesFilter: (state) => { state.subCategories = initialState.subCategories },
    resetKeywordsFilter: (state) => { state.keywords = initialState.keywords },
    resetCountriesFilter: (state) => { state.countries = initialState.countries },
    resetOutcomesFilter: (state) => { state.outcomes = initialState.outcomes },
    resetLegalProcedureTypesFilter: (state) => { state.legalProcedureTypes = initialState.legalProcedureTypes },
    resetApplicationTypesFilter: (state) => { state.applicationTypes = initialState.applicationTypes },
    resetAsylumProceduresFilter: (state) => { state.asylumProcedures = initialState.asylumProcedures },
    resetAuthoritiesFilter: (state) => { state.authorities = initialState.authorities },
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
    toggleAuthoritiesSelected: (state, action: PayloadAction<ToggleSelectedPayload>) => {
      if (action.payload.checked) {
        if (!state.authoritiesSelected.includes(action.payload.id)) {
          state.authoritiesSelected.push(action.payload.id)
        }
      }
      else {
        state.authoritiesSelected = state.authoritiesSelected.filter(id => id !== action.payload.id)
      }
    },
    toggleKeywordsSelected: (state, action: PayloadAction<ToggleSelectedPayload>) => {
      if (action.payload.checked) {
        if (!state.keywordsSelected.includes(action.payload.id)) {
          state.keywordsSelected.push(action.payload.id)
        }
      }
      else {
        state.keywordsSelected = state.keywordsSelected.filter(id => id !== action.payload.id)
      }
    },
    toggleVulnerabilitySelected: (state, action: PayloadAction<ToggleSelectedPayload>) => {
      if (action.payload.checked) {
        if (!state.vulnerabilitySelected.includes(action.payload.id)) {
          state.vulnerabilitySelected.push(action.payload.id)
        }
      }
      else {
        state.vulnerabilitySelected = state.vulnerabilitySelected.filter(id => id !== action.payload.id)
      }
    },
    toggleGroundOfPersecutionSelected: (state, action: PayloadAction<ToggleSelectedPayload>) => {
      if (action.payload.checked) {
        if (!state.groundOfPersecutionSelected.includes(action.payload.id)) {
          state.groundOfPersecutionSelected.push(action.payload.id)
        }
      }
      else {
        state.groundOfPersecutionSelected = state.groundOfPersecutionSelected.filter(id => id !== action.payload.id)
      }
    },
    toggleLegalAndProceduralIssuesSelected: (state, action: PayloadAction<ToggleSelectedPayload>) => {
      if (action.payload.checked) {
        if (!state.legalAndProceduralIssuesSelected.includes(action.payload.id)) {
          state.legalAndProceduralIssuesSelected.push(action.payload.id)
        }
      }
      else {
        state.legalAndProceduralIssuesSelected = state.legalAndProceduralIssuesSelected.filter(id => id !== action.payload.id)
      }
    },
    toggleHouseholdIndividualStatusSelected: (state, action: PayloadAction<ToggleSelectedPayload>) => {
      if (action.payload.checked) {
        if (!state.householdIndividualStatusSelected.includes(action.payload.id)) {
          state.householdIndividualStatusSelected.push(action.payload.id)
        }
      }
      else {
        state.householdIndividualStatusSelected = state.householdIndividualStatusSelected.filter(id => id !== action.payload.id)
      }
    },

    resetAllSelected: (state) => {
      state.countriesSelected = []
      state.outcomesSelected = []
      state.legalProcedureTypesSelected = []
      state.applicationTypesSelected = []
      state.asylumProceduresSelected = []
      state.authoritiesSelected = []
      state.keywordsSelected = []
      state.vulnerabilitySelected = []
      state.groundOfPersecutionSelected = []
      state.legalAndProceduralIssuesSelected = []
      state.householdIndividualStatusSelected = []
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
  setAuthoritiesFilter,
  setCategoriesFilter,
  setVulnerabilityFilter,
  setGroundOfPersecutionFilter,
  setLegalAndProceduralIssuesFilter,
  setHouseholdIndividualStatusFilter,
  setSubCategoriesFilter,
  setKeywordsFilter,
  setDateStart,
  setDateEnd,
  setSearchInGivenFilter,
  resetCountriesFilter,
  resetOutcomesFilter,
  resetApplicationTypesFilter,
  resetAsylumProceduresFilter,
  resetLegalProcedureTypesFilter,
  resetCategoriesFilter,
  resetVulnerabilityFilter,
  resetGroundOfPersecutionFilter,
  resetLegalAndProceduralIssuesFilter,
  resetHouseholdIndividualStatusFilter,
  resetSubCategoriesFilter,
  resetKeywordsFilter,
  resetDateStart,
  resetDateEnd,
  toggleCountriesSelected,
  toggleOutcomesSelected,
  toggleLegalProcedureTypesSelected,
  toggleApplicationTypesSelected,
  toggleAsylumProceduresSelected,
  toggleAuthoritiesSelected,
  toggleKeywordsSelected,
  toggleVulnerabilitySelected,
  toggleGroundOfPersecutionSelected,
  toggleLegalAndProceduralIssuesSelected,
  toggleHouseholdIndividualStatusSelected,
  resetAllSelected,
} = filtersSlice.actions

export default filtersSlice.reducer
