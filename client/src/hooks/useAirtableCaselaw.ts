import { AirtableBaseNameEnum, type AirtableRecord, type FetchRecordsFromTableConfig } from '@/types'
import { useState, useEffect, useCallback } from 'react'
import { useAirtableService } from '@/providers'
import { APP_CONFIG } from '@/constants/config'
import type { FacetSelectedFilters, SelectedFilters } from './useApplyFilters'

// Mapping entre les filtres Redux et les colonnes de la table Caselaws
const FILTER_COLUMN_MAP: Record<keyof FacetSelectedFilters, string> = {
  [AirtableBaseNameEnum.Countries]: 'CountryOfOrigin',
  [AirtableBaseNameEnum.Outcomes]: 'CaselawOutcome',
  [AirtableBaseNameEnum.LegalProcedureTypes]: 'LegalProcedureType',
  [AirtableBaseNameEnum.ApplicationTypes]: 'ApplicationType',
  [AirtableBaseNameEnum.AsylumProcedures]: 'AsylumProcedure',
  [AirtableBaseNameEnum.Authorities]: 'CompetentCourtOrAuthority',
  [AirtableBaseNameEnum.Keywords]: 'Keywords',
}

const PUBLISHED_AT_FIELD = 'PublishedAt'

const buildOnOrAfterFormula = (date: string) => {
  const parsedDate = `DATETIME_PARSE('${date}')`
  return `OR(IS_AFTER({${PUBLISHED_AT_FIELD}}, ${parsedDate}), IS_SAME({${PUBLISHED_AT_FIELD}}, ${parsedDate}, 'day'))`
}

const buildOnOrBeforeFormula = (dateExpression: string) => {
  return `OR(IS_BEFORE({${PUBLISHED_AT_FIELD}}, ${dateExpression}), IS_SAME({${PUBLISHED_AT_FIELD}}, ${dateExpression}, 'day'))`
}

const buildDateFormula = ({ startDate, endDate }: SelectedFilters): string[] => {
  if (startDate && endDate) {
    return [buildOnOrAfterFormula(startDate), buildOnOrBeforeFormula(`DATETIME_PARSE('${endDate}')`)]
  }

  if (startDate) {
    return [buildOnOrAfterFormula(startDate), buildOnOrBeforeFormula('TODAY()')]
  }

  if (endDate) {
    return [buildOnOrBeforeFormula(`DATETIME_PARSE('${endDate}')`)]
  }

  return []
}

const getPublishedAtDate = (record: AirtableRecord): Date | null => {
  const value = record.fields[PUBLISHED_AT_FIELD]

  if (typeof value !== 'string') {
    return null
  }

  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? null : date
}

const getDateBounds = (records: AirtableRecord[]) => {
  const dates = records
    .map(getPublishedAtDate)
    .filter((date): date is Date => date !== null)
    .sort((left, right) => left.getTime() - right.getTime())

  return {
    minDate: dates[0] ?? null,
    maxDate: dates[dates.length - 1] ?? null,
  }
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
const PUBLISHED_FILTER = '{Published} = TRUE()'

const escapeFormulaValue = (value: string) => value.replace(/"/g, '\\"')

const buildFilterFormula = (selectedFilters: SelectedFilters): string => {
  const andClauses = (Object.entries(FILTER_COLUMN_MAP) as [keyof FacetSelectedFilters, string][]) 
    .map(([filterKey, column]) => ({
      column,
      values: selectedFilters[filterKey],
    }))
    .filter(({ values }) => values.length > 0)
    .map(({ column, values }) => {
      const orClauses = values.map((value) => {
        const escapedValue = escapeFormulaValue(value)
        if (column === 'Keywords') {
          return `SEARCH(LOWER("${escapedValue}"), LOWER({Keywords}))`
        }

        return `SEARCH(LOWER("${escapedValue}"), LOWER({${column}}))`
      }).join(',')

      return values.length > 1 ? `OR(${orClauses})` : orClauses
    })

  const clauses = [PUBLISHED_FILTER, ...andClauses, ...buildDateFormula(selectedFilters)]
  return clauses.length > 1 ? `AND(${clauses.join(',')})` : clauses[0]
}

export const useAirtableCaselaw = () => {
  const airtableService = useAirtableService()

  const [caselawRecords, setCaselawRecords] = useState<AirtableRecord[]>([])
  const [dateBounds, setDateBounds] = useState<{ minDate: Date | null, maxDate: Date | null }>({
    minDate: null,
    maxDate: null,
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchCaseLawsRecords = useCallback(async (config?: Omit<FetchRecordsFromTableConfig, 'tableName'>) => {
    try {
      setLoading(true)
      setError(null)
      const userFilterByFormula = config?.selectConfig?.filterByFormula

      const fetchedRecords = await airtableService.fetchRecordsFromTable({
        tableName: APP_CONFIG.defaultBaseName,
        ...config,
        selectConfig: {
          ...config?.selectConfig,
          filterByFormula: userFilterByFormula
            ? `AND(${PUBLISHED_FILTER}, ${userFilterByFormula})`
            : PUBLISHED_FILTER,
        },
      })
      setCaselawRecords(fetchedRecords)
      setDateBounds(getDateBounds(fetchedRecords))
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

  const findSpecificCaseLawBasedOnId = useCallback((id: string) => {
    const trimmedValue = id.trim()
    if (!trimmedValue) {
      fetchCaseLawsRecords()
      return
    }
    const escapedValue = trimmedValue.replace(/"/g, '\\"')
    fetchCaseLawsRecords({
      selectConfig: {
        filterByFormula: `SEARCH(LOWER("${escapedValue}"), LOWER({Title}))`,
      },
    })
  }, [fetchCaseLawsRecords])

  useEffect(() => {
    fetchCaseLawsRecords()
  }, [fetchCaseLawsRecords])

  return {
    caselawRecords,
    dateBounds,
    loading,
    error,
    refetchCaselawRecords: fetchCaseLawsRecords,
    fetchFilteredCaselaws,
    findSpecificCaseLawBasedOnId,
  }
}
