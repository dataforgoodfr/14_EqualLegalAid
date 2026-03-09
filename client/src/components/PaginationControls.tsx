import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react'
import type { ReactNode } from 'react'
import './PaginationControls.css'

export interface PaginationControlsProps {
  currentPage: number
  knownPageCount: number
  hasNextPage: boolean
  isLastPageKnown: boolean
  onPageChange: (page: number) => void
  onNextPage: () => void
  onPreviousPage: () => void
  pageSize: number
  pageSizeOptions: readonly number[]
  onPageSizeChange: (pageSize: number) => void
}

interface PaginationItemProps {
  'children': ReactNode
  'active'?: boolean
  'disabled'?: boolean
  'edge'?: boolean
  'onClick'?: () => void
  'aria-label'?: string
  'aria-current'?: 'page'
}

const PaginationItem = ({
  children,
  active = false,
  disabled = false,
  edge = false,
  onClick,
  ...props
}: PaginationItemProps) => {
  const className = [
    'pagination-btn',
    active && 'active',
    edge && 'pagination-btn-edge',
  ].filter(Boolean).join(' ')

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={className}
      {...props}
    >
      {children}
    </button>
  )
}

const PaginationEllipsis = () => (
  <span className="pagination-ellipsis" aria-hidden="true">...</span>
)

const generatePageNumbers = (currentPage: number, totalPages: number, siblingCount: number) => {
  const pages: Array<number | 'left-ellipsis' | 'right-ellipsis'> = []
  const leftSiblingIndex = Math.max(currentPage - siblingCount, 1)
  const rightSiblingIndex = Math.min(currentPage + siblingCount, totalPages)
  const showLeftEllipsis = leftSiblingIndex > 2
  const showRightEllipsis = rightSiblingIndex < totalPages - 1

  if (leftSiblingIndex > 1) {
    pages.push(1)
  }

  if (showLeftEllipsis) {
    pages.push('left-ellipsis')
  }

  for (let page = leftSiblingIndex; page <= rightSiblingIndex; page += 1) {
    pages.push(page)
  }

  if (showRightEllipsis) {
    pages.push('right-ellipsis')
  }

  if (rightSiblingIndex < totalPages) {
    pages.push(totalPages)
  }

  return pages
}

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
}: PaginationControlsProps) => {
  const isFirstPage = currentPage <= 1
  const canGoNext = currentPage < knownPageCount || hasNextPage
  const pageNumbers = generatePageNumbers(currentPage, Math.max(knownPageCount, 1), 1)
  const pageSummary = isLastPageKnown
    ? `Page ${currentPage} of ${knownPageCount}`
    : `Page ${currentPage} of ${knownPageCount}+`

  return (
    <div className="pagination-container">
      <div className="pagination-info">
        <span className="pagination-summary">{pageSummary}</span>
        {!isLastPageKnown && <span className="pagination-hint">More pages will appear as you navigate.</span>}
      </div>

      <div className="pagination-controls">
        <div className="pagination-page-size">
          <label className="pagination-page-size-label" htmlFor="page-size-select">
            Items per page
          </label>
          <select
            id="page-size-select"
            value={pageSize}
            onChange={event => onPageSizeChange(Number(event.target.value))}
            className="pagination-page-size-select"
          >
            {pageSizeOptions.map(size => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
        </div>

        <nav className="pagination-nav" aria-label="Pagination">
          <PaginationItem
            disabled={isFirstPage}
            onClick={() => onPageChange(1)}
            aria-label="Go to first page"
            edge
          >
            <ChevronsLeft />
          </PaginationItem>

          <PaginationItem
            disabled={isFirstPage}
            onClick={onPreviousPage}
            aria-label="Go to previous page"
          >
            <ChevronLeft />
          </PaginationItem>

          {pageNumbers.map((page) => {
            if (page === 'left-ellipsis' || page === 'right-ellipsis') {
              return <PaginationEllipsis key={page} />
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
            )
          })}

          {!isLastPageKnown && <PaginationEllipsis />}

          <PaginationItem
            disabled={!canGoNext}
            onClick={onNextPage}
            aria-label="Go to next page"
          >
            <ChevronRight />
          </PaginationItem>

          {isLastPageKnown && (
            <PaginationItem
              disabled={currentPage >= knownPageCount}
              onClick={() => onPageChange(knownPageCount)}
              aria-label="Go to last page"
              edge
            >
              <ChevronsRight />
            </PaginationItem>
          )}
        </nav>
      </div>
    </div>
  )
}
