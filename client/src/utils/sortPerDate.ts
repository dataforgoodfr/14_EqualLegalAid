import { useMemo } from 'react';
import { toCaselaw } from './formatters';

export const sortPerDate = (records: any[], sortDesc: boolean) => {
  return useMemo(() => {
    const converted = records.map(toCaselaw);
    return converted.sort((a, b) => {
      const timeA = a.publishedAt.getTime();
      const timeB = b.publishedAt.getTime();
      return sortDesc ? timeB - timeA : timeA - timeB;
    });
  }, [records, sortDesc]);
};
