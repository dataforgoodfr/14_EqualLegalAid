import type {
  AirtableAttachment,
  AirtableUser,
  AirtableFieldValue,
  AirtableRecord,
  Caselaw,
  PdfObjectInterface,
} from '@/types'

/**
 * Checks if a value is a PDF URL
 */
export const isPdfUrl = (value: AirtableFieldValue): value is string => {
  if (typeof value === 'string') {
    return (
      value.toLowerCase().endsWith('.pdf')
      || value.toLowerCase().includes('.pdf?')
      || value.toLowerCase().includes('drive_link')
    )
  }
  return false
}

/**
 * Formats a field value for display in the table
 */
export const formatFieldValue = (value: AirtableFieldValue): string => {
  if (value === null || value === undefined) {
    return ''
  }

  // Handle arrays
  if (Array.isArray(value)) {
    // Array of attachments
    if (value.length > 0 && typeof value[0] === 'object' && value[0] !== null && 'filename' in value[0]) {
      return (value as AirtableAttachment[]).map(att => att.filename).join(', ')
    }
    // Array of user objects
    if (value.length > 0 && typeof value[0] === 'object' && value[0] !== null && 'name' in value[0]) {
      return (value as AirtableUser[]).map(user => user.name || user.email || 'Unknown').join(', ')
    }
    // Other arrays
    return value.map(v => String(v)).join(', ')
  }

  // Handle objects
  if (typeof value === 'object') {
    // User object with name
    if (typeof value.name === 'string') {
      return value.name
    }
    // User object with email
    if (typeof value.email === 'string') {
      return value.email
    }
    // Stringify other objects
    return JSON.stringify(value)
  }

  // Handle primitive values
  return String(value)
}

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
    .trim()
}

/**
 * Extracts all unique field names from a collection of records
 */
export const getAllFieldNames = (
  records: Array<{ fields: Record<string, AirtableFieldValue> }>,
): string[] => {
  if (records.length === 0) return []

  const fieldNamesSet = new Set<string>()
  records.forEach((record) => {
    Object.keys(record.fields).forEach((field) => {
      fieldNamesSet.add(field)
    })
  })

  return Array.from(fieldNamesSet)
}

/**
 * Converts an AirtableRecord into a strongly-typed Caselaw object.
 * Field names are matched case-insensitively against common Airtable column names.
 */
export const toCaselaw = (record: AirtableRecord): Caselaw => {
  const f = record.fields

  const str = (key: string): string => {
    const val = f[key]
    return typeof val === 'string' ? val : ''
  }

  const keywords = str('Keywords')
    .split(',')
    .map(k => k.trim())
    .filter(Boolean)

  const getPdfObject = (pdflink: string): PdfObjectInterface => {
    const parts = pdflink.split(' (')

    if (parts.length !== 2) {
      return {
        pdfFileName: '',
        pdfURL: '',
      }
    }

    const pdfFileName = parts[0].trim()
    const pdfURL = parts[1].replace(')', '').trim()

    return {
      pdfFileName,
      pdfURL,
    }
  }
  const grStr = (grKey: string, enFallback: string): string =>
    str(grKey) || enFallback

  const keywords_GR = (str('Keywords_GR') || str('Keywords'))
    .split(',')
    .map(k => k.trim())
    .filter(Boolean)

  return {
    title: str('Title'),
    publishedAt: str('PublishedAt') ? new Date(str('PublishedAt')) : new Date(),
    applicationTypes: str('ApplicationType'),
    applicationTypes_GR: grStr('ApplicationType_GR', str('ApplicationType')),
    legalProcedureTypes: str('LegalProcedureType'),
    legalProcedureTypes_GR: grStr('LegalProcedureType_GR', str('LegalProcedureType')),
    asylumProcedure: str('AsylumProcedure'),
    asylumProcedure_GR: grStr('AsylumProcedure_GR', str('AsylumProcedure')),
    countryOfOrigin: str('CountryOfOrigin'),
    countryOfOrigin_GR: grStr('CountryOfOrigin_GR', str('CountryOfOrigin')),
    competentCourtOrAuthority: str('CompetentCourtOrAuthority'),
    competentCourtOrAuthority_GR: grStr('CompetentCourtOrAuthority_GR', str('CompetentCourtOrAuthority')),
    caselawOutcome: str('CaselawOutcome'),
    caselawOutcome_GR: grStr('CaselawOutcome_GR', str('CaselawOutcome')),
    keywords,
    keywords_GR,
    englishPdfLink: getPdfObject(str('English_Pdf')),
    greekPdfLink: getPdfObject(str('Greek_Pdf')),
  }
}
