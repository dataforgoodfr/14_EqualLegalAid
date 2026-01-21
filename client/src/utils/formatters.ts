import type { AirtableAttachment, AirtableUser, AirtableFieldValue } from '../types';

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
