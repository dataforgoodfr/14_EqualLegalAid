import { useMemo } from 'react';
import type { AirtableRecord } from '../types';
import { toCaselaw } from '../utils/formatters';
import { CaselawCard } from './CaselawCard';
import './CaselawCard.css';

interface CaselawListProps {
  records: AirtableRecord[];
}

export const CaselawList = ({ records }: CaselawListProps) => {
  const caselaws = useMemo(() => records.map(toCaselaw), [records]);

  if (caselaws.length === 0) {
    return <p className="caselaw-empty">No records found</p>;
  }

  return (
    <div className="caselaw-grid">
      {caselaws.map((caselaw, index) => (
        <CaselawCard key={index} caselaw={caselaw} />
      ))}
    </div>
  );
};
