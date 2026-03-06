import type {
  AirtableAttachment,
  AirtableUser,
  AirtableFieldValue,
  AirtableRecord,
  Caselaw,
} from '../types';

/**
 * Checks if a value is a PDF URL
 */
export const isPdfUrl = (value: AirtableFieldValue): value is string => {
  if (typeof value === 'string') {
    return (
      value.toLowerCase().endsWith('.pdf') ||
      value.toLowerCase().includes('.pdf?') ||
      value.toLowerCase().includes('drive_link')
    );
  }
  return false;
};

/**
 * Formats a field value for display in the table
 */
export const formatFieldValue = (value: AirtableFieldValue): string => {
  if (value === null || value === undefined) {
    return '';
  }

  // Handle arrays
  if (Array.isArray(value)) {
    // Array of attachments
    if (value.length > 0 && value[0]?.filename) {
      return value.map((att: AirtableAttachment) => att.filename).join(', ');
    }
    // Array of user objects
    if (value.length > 0 && value[0]?.name) {
      return value.map((user: AirtableUser) => user.name || user.email || 'Unknown').join(', ');
    }
    // Other arrays
    return value.map((v) => String(v)).join(', ');
  }

  // Handle objects
  if (typeof value === 'object') {
    // User object with name
    if (value.name) {
      return value.name;
    }
    // User object with email
    if (value.email) {
      return value.email;
    }
    // Stringify other objects
    return JSON.stringify(value);
  }

  // Handle primitive values
  return String(value);
};

/**
 * Formats a field name for display as a column header.
 * Converts PascalCase/camelCase to space-separated words and replaces underscores.
 * e.g. CountryOfOrigin => Country Of Origin
 */
export const formatColumnHeader = (field: string): string => {
  return field
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/([A-Z]+)([A-Z][a-z])/g, '$1 $2')
    .replace(/_/g, ' ')
    .trim();
};

/**
 * Extracts all unique field names from a collection of records
 */
export const getAllFieldNames = (
  records: Array<{ fields: Record<string, AirtableFieldValue> }>
): string[] => {
  if (records.length === 0) return [];

  const fieldNamesSet = new Set<string>();
  records.forEach((record) => {
    Object.keys(record.fields).forEach((field) => {
      fieldNamesSet.add(field);
    });
  });

  return Array.from(fieldNamesSet);
};

/**
 * Converts an AirtableRecord into a strongly-typed Caselaw object.
 * Field names are matched case-insensitively against common Airtable column names.
 */
export const toCaselaw = (record: AirtableRecord): Caselaw => {
  const f = record.fields;

  const str = (key: string): string => {
    const val = f[key];
    return typeof val === 'string' ? val : '';
  };

  const keywords = str('Keywords')
    .split(',')
    .map((k) => k.trim())
    .filter(Boolean);

  return {
    title: str('Title'),
    publishedAt: str('PublishedAt') ? new Date(str('PublishedAt')) : new Date(),
    applicationType: str('ApplicationType'),
    legalProcedureType: str('LegalProcedureType'),
    asylumProcedure: str('AsylumProcedure'),
    countryOfOrigin: str('CountryOfOrigin'),
    competentCourtOrAuthority: str('CompetentCourtOrAuthority'),
    caselawOutcome: str('CaselawOutcome'),
    keywords,
    englishPdfLink: str('EnglishPdfLink'),
    greekPdfLink: str('GreekPdfLink'),
  };
};
