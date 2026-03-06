import type { Base, Records, FieldSet } from 'airtable'
import type {
  AiretableBaseName,
  AirtableRecord,
  AirtableFieldValue,
} from '@/types'

export function createAirtableService(base: Base) {
  async function fetchRecordsFromTable(
    tableName: AiretableBaseName,
    maxRecords: number = 100): Promise<AirtableRecord[]> {
    const fetchedRecords: AirtableRecord[] = []
    await base(tableName)
      .select({
        maxRecords,
        cellFormat: 'string',
        timeZone: 'UTC',
        userLocale: 'en-us',
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
