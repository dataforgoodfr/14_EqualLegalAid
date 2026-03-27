import type { Base, Records, FieldSet } from 'airtable'
import type {
  AirtableRecord,
  AirtableFieldValue,
  FetchRecordsFromTableConfig,
} from '@/types'

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
