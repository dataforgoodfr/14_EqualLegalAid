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
    const selectOptions = {
      pageSize: selectConfig?.pageSize ?? 100,
      cellFormat: selectConfig?.cellFormat ?? 'string',
      timeZone: selectConfig?.timeZone ?? 'UTC',
      userLocale: selectConfig?.userLocale ?? 'en-us',
      filterByFormula: selectConfig?.filterByFormula ?? '',
      sort: selectConfig?.sort ?? [],
      ...(selectConfig?.fields ? { fields: selectConfig.fields } : {}),
      ...(selectConfig?.view ? { view: selectConfig.view } : {}),
      ...(selectConfig?.maxRecords !== undefined ? { maxRecords: selectConfig.maxRecords } : {}),
    }

    await base(tableName)
      .select(selectOptions)
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
