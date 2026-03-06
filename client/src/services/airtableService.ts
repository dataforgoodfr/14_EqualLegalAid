import Airtable from 'airtable'
import type { Base, Records, FieldSet } from 'airtable'
import type {
  AirtableRecord,
  AirtableConfig,
  AirtableFieldValue,
  AiretableBaseName,
} from '../types'

/**
 * Service for interacting with Airtable API
 */
class AirtableService {
  private base: Base
  private tableName: string

  constructor(config: AirtableConfig) {
    this.base = new Airtable({ apiKey: config.apiKey }).base(config.baseId)
    this.tableName = config.tableName
  }

  /**
   * Fetches records from Airtable
   * @param viewName - The name of the view to fetch from (default: 'Caselaws')
   * @param maxRecords - Maximum number of records to fetch (default: 100)
   * @returns Promise with array of Airtable records
   */
  async fetchRecordsFromTable(
    airtableBaseName: AiretableBaseName = 'Caselaws',
    maxRecords: number = 100,
  ): Promise<AirtableRecord[]> {
    const fetchedRecords: AirtableRecord[] = []

    await this.base(airtableBaseName)
      .select({
        maxRecords: maxRecords,
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
}

/**
 * Creates and returns an instance of AirtableService
 */
export const createAirtableService = (config: AirtableConfig): AirtableService => {
  return new AirtableService(config)
}

export default AirtableService
