import { useMemo } from 'react';
import type { AirtablePaginationState, AirtableRecord } from '../types';
import { CaselawCard } from './CaselawCard';
import { PaginationControls } from './PaginationControls';
import './CaselawCard.css';
import { toCaselaw } from '../utils/formatters';

interface CaselawListProps {
  records: AirtableRecord[];
  pagination: AirtablePaginationState;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
}

export const CaselawList = ({
  records,
  pagination,
  onPageChange,
  onPageSizeChange,
}: CaselawListProps) => {
  const caselaws = useMemo(() => records.map(toCaselaw), [records]);

  if (caselaws.length === 0) {
    return <p className="caselaw-empty">No records found</p>;
  }

  return (
    <section>
      <div className="caselaw-grid">
        {caselaws.map((caselaw, index) => (
          <CaselawCard key={records[index].id} caselaw={caselaw} />
        ))}
      </div>

      <PaginationControls
        currentPage={pagination.currentPage}
        knownPageCount={pagination.knownPageCount}
        hasNextPage={pagination.hasNextPage}
        isLastPageKnown={pagination.isLastPageKnown}
        onPageChange={onPageChange}
        pageSize={pagination.pageSize}
        pageSizeOptions={pagination.pageSizeOptions}
        onPageSizeChange={onPageSizeChange}
      />
    </section>
  );
};
