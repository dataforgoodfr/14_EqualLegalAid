import { cva } from 'class-variance-authority';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import type { ReactNode } from 'react';
import { twMerge } from 'tailwind-merge';

const paginationItemVariants = cva(
  'inline-flex h-9 min-w-9 items-center justify-center rounded-lg border text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#003d7a]/30',
  {
    variants: {
      active: {
        true: 'border-[#002e5d] bg-[#002e5d] text-white shadow-sm',
        false: 'border-slate-200 bg-white text-slate-700 hover:border-[#003d7a] hover:text-[#003d7a]',
      },
      disabled: {
        true: 'cursor-not-allowed border-slate-200 bg-slate-100 text-slate-400 hover:border-slate-200 hover:text-slate-400',
        false: '',
      },
    },
    defaultVariants: {
      active: false,
      disabled: false,
    },
  }
);

export interface PaginationControlsProps {
  currentPage: number;
  knownPageCount: number;
  hasNextPage: boolean;
  isLastPageKnown: boolean;
  onPageChange: (page: number) => void;
  onNextPage: () => void;
  onPreviousPage: () => void;
  pageSize: number;
  pageSizeOptions: readonly number[];
  onPageSizeChange: (pageSize: number) => void;
  className?: string;
}

interface PaginationItemProps {
  children: ReactNode;
  active?: boolean;
  disabled?: boolean;
  onClick?: () => void;
  'aria-label'?: string;
  'aria-current'?: 'page';
  className?: string;
}

const PaginationItem = ({
  children,
  active = false,
  disabled = false,
  onClick,
  className,
  ...props
}: PaginationItemProps) => {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={twMerge(paginationItemVariants({ active, disabled }), className)}
      {...props}
    >
      {children}
    </button>
  );
};

const PaginationEllipsis = ({ className }: { className?: string }) => {
  return (
    <span
      className={twMerge(
        'inline-flex h-9 min-w-9 items-center justify-center text-sm font-medium text-slate-400',
        className
      )}
      aria-hidden="true"
    >
      ...
    </span>
  );
};

const generatePageNumbers = (currentPage: number, totalPages: number, siblingCount: number) => {
  const pages: Array<number | 'left-ellipsis' | 'right-ellipsis'> = [];
  const leftSiblingIndex = Math.max(currentPage - siblingCount, 1);
  const rightSiblingIndex = Math.min(currentPage + siblingCount, totalPages);
  const showLeftEllipsis = leftSiblingIndex > 2;
  const showRightEllipsis = rightSiblingIndex < totalPages - 1;

  if (leftSiblingIndex > 1) {
    pages.push(1);
  }

  if (showLeftEllipsis) {
    pages.push('left-ellipsis');
  }

  for (let page = leftSiblingIndex; page <= rightSiblingIndex; page += 1) {
    pages.push(page);
  }

  if (showRightEllipsis) {
    pages.push('right-ellipsis');
  }

  if (rightSiblingIndex < totalPages) {
    pages.push(totalPages);
  }

  return pages;
};

export const PaginationControls = ({
  currentPage,
  knownPageCount,
  hasNextPage,
  isLastPageKnown,
  onPageChange,
  onNextPage,
  onPreviousPage,
  pageSize,
  pageSizeOptions,
  onPageSizeChange,
  className,
}: PaginationControlsProps) => {
  const isFirstPage = currentPage <= 1;
  const canGoNext = currentPage < knownPageCount || hasNextPage;
  const pageNumbers = generatePageNumbers(currentPage, Math.max(knownPageCount, 1), 1);
  const pageSummary = isLastPageKnown
    ? `Page ${currentPage} of ${knownPageCount}`
    : `Page ${currentPage} of ${knownPageCount}+`;

  return (
    <div
      className={twMerge(
        'mt-6 flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white/85 p-4 shadow-sm backdrop-blur sm:flex-row sm:items-center sm:justify-between',
        className
      )}
    >
      <div className="flex flex-wrap items-center gap-3 text-sm text-slate-600">
        <span className="font-medium text-slate-800">{pageSummary}</span>
        {!isLastPageKnown && <span className="text-slate-500">More pages will appear as you navigate.</span>}
      </div>

      <div className="flex flex-col gap-3 sm:items-end">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-medium text-slate-600">Items per page</span>
          <label className="sr-only" htmlFor="page-size-select">
            Items per page
          </label>
          <select
            id="page-size-select"
            value={pageSize}
            onChange={(event) => onPageSizeChange(Number(event.target.value))}
            className="h-9 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 shadow-sm outline-none transition-colors focus:border-[#003d7a] focus:ring-2 focus:ring-[#003d7a]/20"
          >
            {pageSizeOptions.map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
        </div>

        <nav className="flex flex-wrap items-center gap-1" aria-label="Pagination">
          <PaginationItem
            disabled={isFirstPage}
            onClick={() => onPageChange(1)}
            aria-label="Go to first page"
            className="hidden sm:inline-flex"
          >
            <ChevronsLeft className="size-4" />
          </PaginationItem>

          <PaginationItem
            disabled={isFirstPage}
            onClick={onPreviousPage}
            aria-label="Go to previous page"
          >
            <ChevronLeft className="size-4" />
          </PaginationItem>

          {pageNumbers.map((page) => {
            if (page === 'left-ellipsis' || page === 'right-ellipsis') {
              return <PaginationEllipsis key={page} />;
            }

            return (
              <PaginationItem
                key={page}
                active={page === currentPage}
                onClick={() => onPageChange(page)}
                aria-label={`Go to page ${page}`}
                aria-current={page === currentPage ? 'page' : undefined}
              >
                {page}
              </PaginationItem>
            );
          })}

          {!isLastPageKnown && <PaginationEllipsis />}

          <PaginationItem
            disabled={!canGoNext}
            onClick={onNextPage}
            aria-label="Go to next page"
          >
            <ChevronRight className="size-4" />
          </PaginationItem>

          {isLastPageKnown && (
            <PaginationItem
              disabled={currentPage >= knownPageCount}
              onClick={() => onPageChange(knownPageCount)}
              aria-label="Go to last page"
              className="hidden sm:inline-flex"
            >
              <ChevronsRight className="size-4" />
            </PaginationItem>
          )}
        </nav>
      </div>
    </div>
  );
};