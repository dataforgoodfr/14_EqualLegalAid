/**
 * Application configuration constants
 */

export const AIRTABLE_CONFIG = {
  apiKey: import.meta.env.VITE_AIRTABLE_API_KEY,
  baseId: import.meta.env.VITE_AIRTABLE_BASE_ID,
  tableName: import.meta.env.VITE_AIRTABLE_TABLE_NAME,
} as const;

export const APP_CONFIG = {
  defaultView: 'Caselaws',
  maxRecords: 100,
} as const;
