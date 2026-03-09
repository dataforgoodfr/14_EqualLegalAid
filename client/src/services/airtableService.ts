import Airtable from 'airtable'
import type { Base } from 'airtable'
import type {
  AirtableConfig,
  AirtableFieldValue,
  AirtablePageRequest,
  AirtablePageResponse,
  AirtableSort,
  AirtableRecord,
} from '@/types'

interface AirtableSdkRecord {
  id: string
  fields: Record<string, AirtableFieldValue>
}

interface AirtableTableWithListRecords {
  _listRecords: (
    pageSize: number,
    offset: string | null | undefined,
    options: {
      view: string
      sort: AirtableSort[]
      cellFormat: 'string'
      timeZone: string
      userLocale: string
    },
    done: (error: unknown, records?: AirtableSdkRecord[], nextOffset?: string) => void,
  ) => void
}

/**
 * Service for interacting with Airtable API
 */
class AirtableService {
  private base: Base
  private tableName: string

  constructor(config: AirtableConfig) {
    if (!config.apiKey || !config.baseId || !config.tableName) {
      throw new Error('Missing Airtable configuration. Check the Vite environment variables.')
    }

    this.base = new Airtable({ apiKey: config.apiKey }).base(config.baseId)
    this.tableName = config.tableName
  }

  /**
   * Fetches a single page of records from Airtable and returns the next cursor.
   */
  async fetchPage({
    viewName = 'Caselaws',
    pageSize,
    offset,
    sort = [],
  }: AirtablePageRequest): Promise<AirtablePageResponse> {
    const table = this.base(this.tableName) as unknown as AirtableTableWithListRecords

    return new Promise((resolve, reject) => {
      table._listRecords(
        pageSize,
        offset,
        {
          view: viewName,
          sort,
          cellFormat: 'string',
          timeZone: 'UTC',
          userLocale: 'en-us',
        },
        (error, records = [], nextOffset) => {
          if (error) {
            const errorMessage
              = error instanceof Error ? error.message : 'Failed to fetch records from Airtable'
            reject(new Error(errorMessage))
            return
          }

          resolve({
            records: records.map(record => ({
              id: record.id,
              fields: record.fields,
            })) as AirtableRecord[],
            nextOffset,
          })
        },
      )
    })
  }
}

/**
 * Creates and returns an instance of AirtableService
 */
export const createAirtableService = (config: AirtableConfig): AirtableService => {
  return new AirtableService(config)
}

export default AirtableService
