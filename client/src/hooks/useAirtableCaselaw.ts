import {  AirtableBaseNameEnum, type AirtableRecord } from '@/types'
import { useState, useEffect, useCallback } from 'react'
import { useAirtableService } from '@/providers'
import { APP_CONFIG } from '@/constants/config'
import type { SelectedFilters } from './useApplyFilters'

// Mapping entre les filtres Redux et les colonnes de la table Caselaws
const FILTER_COLUMN_MAP: Record<keyof SelectedFilters, string> = {
  [AirtableBaseNameEnum.Countries]: 'CountryOfOrigin',
  [AirtableBaseNameEnum.Outcomes]: 'CaselawOutcome',
  [AirtableBaseNameEnum.LegalProcedureTypes]: 'LegalProcedureTypes',
  [AirtableBaseNameEnum.ApplicationTypes]: 'ApplicationTypes',
  [AirtableBaseNameEnum.AsylumProcedures]: 'AsylumProcedures',
}

/*
  Pour chaque filtre actif, on génère un OR sur les IDs sélectionnés.
  Tous les filtres actifs sont reliés par un AND.

  Exemple avec 2 pays et 1 outcome :
  AND(
    OR(FIND('rec1', {CountryOfOrigin}), FIND('rec2', {CountryOfOrigin})),
    FIND('rec3', {CaselawOutcome})
  )
*/
const buildFilterFormula = (selectedFilters: SelectedFilters): string => {
  const andClauses = (Object.entries(selectedFilters) as [keyof SelectedFilters, string[]][])
    .filter(([, ids]) => ids.length > 0)
    .map(([filterKey, ids]) => {
      const column = FILTER_COLUMN_MAP[filterKey]
      const orClauses = ids.map(id => `SEARCH('${id}', {${column}})`).join(',')
      return ids.length > 1 ? `OR(${orClauses})` : orClauses
    })

  return andClauses.length > 1 ? `AND(${andClauses.join(',')})` : andClauses[0]
}

export const useAirtableCaselaw = () => {
  const airtableService = useAirtableService()

  const [caselawRecords, setCaselawRecords] = useState<AirtableRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchCaseLawsRecords = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const fetchedRecords = await airtableService.fetchRecordsFromTable({
        tableName: APP_CONFIG.defaultBaseName,
      })
      setCaselawRecords(fetchedRecords)
    }
    catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch case laws from Airtable'
      setError(errorMessage)
      console.error('Airtable case laws error:', err)
    }
    finally {
      setLoading(false)
    }
  }, [airtableService])

  const fetchFilteredCaselaws = useCallback(async (selectedFilters: SelectedFilters) => {
    try {
      setLoading(true)
      setError(null)

      const formula = buildFilterFormula(selectedFilters)

      const fetchedRecords = await airtableService.fetchRecordsFromTable({
        tableName: APP_CONFIG.defaultBaseName,
        selectConfig: {
          filterByFormula: formula,
        },
      })
      setCaselawRecords(fetchedRecords)
    }
    catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch filtered case laws'
      setError(errorMessage)
      console.error('Airtable filtered case laws error:', err)
    }
    finally {
      setLoading(false)
    }
  }, [airtableService])

  useEffect(() => {
    fetchCaseLawsRecords()
  }, [])

  return {
    caselawRecords,
    loading,
    error,
    refetchCaselawRecords: fetchCaseLawsRecords,
    fetchFilteredCaselaws,
  }
}