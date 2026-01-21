/**
 * Type definitions for the ELA application
 */

/**
 * Represents possible field value types from Airtable
 */
export type AirtableFieldValue =
  | string
  | number
  | boolean
  | null
  | undefined
  | AirtableAttachment[]
  | AirtableUser[]
  | string[]
  | number[]
  | Record<string, unknown>;

/**
 * Represents a record from Airtable
 */
export interface AirtableRecord {
  id: string;
  fields: Record<string, AirtableFieldValue>;
}

/**
 * Represents an attachment from Airtable (e.g., PDFs)
 */
export interface AirtableAttachment {
  id: string;
  url: string;
  filename: string;
  size: number;
  type: string;
}

/**
 * Represents a user object from Airtable
 */
export interface AirtableUser {
  id?: string;
  name?: string;
  email?: string;
}

/**
 * Configuration for Airtable connection
 */
export interface AirtableConfig {
  apiKey: string;
  baseId: string;
  tableName: string;
}
