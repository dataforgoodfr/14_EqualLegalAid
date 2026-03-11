import type { Base, Records, FieldSet } from 'airtable'
import type {
  AirtableRecord,
  AirtableFieldValue,
  AirtableBaseName,
} from '@/types'

/*
le cellFormat est la réponse a pas mal de nos problème
En gros pour les records des caselaw il faut demander la data en version string
Et pour les filtres on doit demander la data en json. En demandant json on récupère que des id de caselaws dans les filtres ce qui est parfait pour nous.
*/
interface FetchRecordsFromTableConfig {
  tableName: AirtableBaseName
  selectConfig?: {
    maxRecords?: number
    pageSize?: number
    userLocale?: 'en-us' | 'el-GR'
    cellFormat?: 'json' | 'string'
    timeZone?: string
    view?: string
    fields?: string[]
    filterByFormula?: string
    sort?: Array<{
      field: string
      direction?: 'asc' | 'desc'
    }>
  }
}

export function createAirtableService(base: Base) {
  async function fetchRecordsFromTable({
    tableName,
    selectConfig,
  }: FetchRecordsFromTableConfig): Promise<AirtableRecord[]> {
    const fetchedRecords: AirtableRecord[] = []
    await base(tableName)
      .select({
        maxRecords: selectConfig?.maxRecords ?? 100,
        pageSize: selectConfig?.pageSize ?? 100,
        cellFormat: selectConfig?.cellFormat ?? 'string',
        timeZone: selectConfig?.timeZone ?? 'UTC',
        userLocale: selectConfig?.userLocale ?? 'en-us',
        filterByFormula: selectConfig?.filterByFormula ?? '',
        sort: selectConfig?.sort ?? [],
      })
      .eachPage((records: Records<FieldSet>, fetchNextPage: () => void) => {
        records.forEach((record) => {
          fetchedRecords.push({
            id: record.id,
            fields: record.fields as Record<string, AirtableFieldValue>,
          })
        })
        fetchNextPage()
      })

    return fetchedRecords
  }
  return {
    fetchRecordsFromTable,
  }
}
