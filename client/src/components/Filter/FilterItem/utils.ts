import type { AirtableRecord } from '@/types'

export const toIdArray = (value: unknown): string[] => {
  if (Array.isArray(value)) {
    return value.filter((item): item is string => typeof item === 'string')
  }
  if (typeof value === 'string') {
    return value.split(',').map(item => item.trim()).filter(Boolean)
  }
  return []
}

export const getFieldValue = (record: AirtableRecord, key: string): unknown => {
  const fieldKey = Object.keys(record.fields).find(
    fieldName => fieldName.toLowerCase() === key.toLowerCase(),
  )
  return fieldKey ? record.fields[fieldKey] : undefined
}

export const getStringField = (record: AirtableRecord, key: string): string => {
  const value = getFieldValue(record, key)
  return typeof value === 'string' ? value : ''
}

export const getName = (record: AirtableRecord, isGreek: boolean): string =>
  isGreek
    ? getStringField(record, 'Name_GR') || getStringField(record, 'Name_EN')
    : getStringField(record, 'Name_EN') || getStringField(record, 'Name_GR')

export const getKeywordName = (record: AirtableRecord, isGreek: boolean): string =>
  isGreek
    ? getStringField(record, 'Keyword_GR') || getStringField(record, 'Keyword_EN')
    : getStringField(record, 'Keyword_EN') || getStringField(record, 'Keyword_GR')
 