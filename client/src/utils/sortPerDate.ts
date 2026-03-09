import type { AirtableRecord, Caselaw } from '../types';
import { toCaselaw } from './formatters';

export const sortPerDate = (records: AirtableRecord[], sortDesc: boolean): Caselaw[] => {
  return records.map(toCaselaw).sort((a, b) => {
    const timeA = a.publishedAt.getTime();
    const timeB = b.publishedAt.getTime();
    return sortDesc ? timeB - timeA : timeA - timeB;
  });
};
