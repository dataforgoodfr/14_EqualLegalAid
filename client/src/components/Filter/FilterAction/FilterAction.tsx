import { useState, useEffect, useRef, type Dispatch, type SetStateAction } from 'react'
import { DATE_FILTER_STATE_NAME, type FilterTagInterface } from '@/types'
import { Button } from '@/components/ui'
import { ArrowDownWideNarrow, ArrowUpNarrowWide, Ghost } from 'lucide-react'
import { useAppSelector, useAppDispatch } from '@/hooks/reduxHook'
import { X, SquareMousePointer } from 'lucide-react'
import { resetDateEnd, resetDateStart, setFilterTag } from '@/redux/filtersSlice'
import { useDownloadCaselaw } from '@/context'
import {
  TOGGLE_ACTION_MAP,
  FilterActionSearch,
} from '@/components/Filter'
import { useTranslation } from 'react-i18next'
import { cn } from '@/lib/utils'
interface FilterActionProps {
  count: number
  setSort: Dispatch<SetStateAction<boolean>>
  setFindSpecificCaseLaw: (value: string) => void
}

export const FilterAction = ({
  count = 1,
  setSort,
  setFindSpecificCaseLaw,
}: FilterActionProps) => {
  const [recentFirst, setRecentFirst] = useState(true)
  const [searchCaseLaw, setSearchCaselaw] = useState('')
  const isFirstRender = useRef(true)
  const [displayAllSelectedFilters, setDisplayAllSelectedFilters] = useState(false)
  const handleSort = () => {
    setRecentFirst(!recentFirst)
    setSort(!recentFirst)
  }
  const { selectedCaselaw, clearSelection, startDownloadPdf, handleDownloadMode, isDownloadMode } = useDownloadCaselaw()
  const dispatch = useAppDispatch()
  const { t } = useTranslation()
  const handleClick = (filterTag: FilterTagInterface) => {
    if (filterTag.filterStateName === DATE_FILTER_STATE_NAME) {
      if (filterTag.id === 'date-start') {
        dispatch(resetDateStart())
      }

      if (filterTag.id === 'date-end') {
        dispatch(resetDateEnd())
      }

      dispatch(setFilterTag({
        item: filterTag,
        itemChecked: false,
      }))
      return
    }

    const action = TOGGLE_ACTION_MAP[filterTag.filterStateName]
    if (action) {
      dispatch(action({
        checked: false,
        id: filterTag.id,
      }))
    }
    dispatch(setFilterTag({
      item: filterTag,
      itemChecked: false,
    }))
  }

  const createFilterTags = (filterTags: FilterTagInterface[]) => {
    return (
      filterTags.map(filtertag => (
        <Button
          className="my-1.5 not-last:mr-2.5 hover:cursor-pointer"
          variant="secondary"
          onClick={() => handleClick(filtertag as FilterTagInterface)}
          key={filtertag.id}
        >
          {filtertag.name}
          <X />
        </Button>
      ))
    )
  }
  const filterTags = useAppSelector(state => state.filters.filterTags)
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false
      return
    }
    setFindSpecificCaseLaw(searchCaseLaw)
  }, [searchCaseLaw, setFindSpecificCaseLaw])
  return (
    <div className="filter-action">
      <p className="text-gray-count mb-6 hidden text-xl font-semibold xl:block">
        <span className="mr-2 font-bold text-black">{count}</span>
        {t('filter.decisions', { count })}
      </p>
      <div className="flex gap-3.5 xl:justify-between xl:gap-4">
        <Button
          onClick={handleSort}
          variant="outline"
          className="w-1/2 font-bold xl:w-auto"
        >
          {recentFirst ? (<ArrowDownWideNarrow />) : (<ArrowUpNarrowWide />)}
          {t('filter.sortBy')}
          {' '}
          {recentFirst ? t('filter.newest') : t('filter.oldest')}
        </Button>
        <FilterActionSearch
          className="hidden xl:flex"
          setSearchCaselaw={setSearchCaselaw}
        />
        <div className="w-1/2 cursor-pointer xl:w-auto">
          <Button
            variant={isDownloadMode ? 'default' : 'outline'}
            className="w-full cursor-pointer"
            onClick={handleDownloadMode}
          >
            <SquareMousePointer className="mr-2" />
            {t('filter.multiSelect')}
          </Button>
        </div>
      </div>
      {isDownloadMode && (
        <div className="mt-4 flex gap-4">
          <Button
            onClick={startDownloadPdf}
            className="w-[50%]"
            disabled={selectedCaselaw.length === 0}
          >
            {t('filter.downloadSelected', { count: selectedCaselaw.length })}
          </Button>
          <Button
            className="w-[50%]"
            variant="secondary"
            onClick={clearSelection}
            disabled={selectedCaselaw.length === 0}
          >
            {t('filter.clearSelected')}
          </Button>
        </div>
      )}
      <div className="mt-4 flex w-full flex-wrap">
        {filterTags.length > 0 && createFilterTags(displayAllSelectedFilters ? filterTags : filterTags.slice(0, 3))}
        {filterTags.length > 3 && (
          <Button
            className="align-self my-1.5 justify-self-end"
            variant="ghost"
            onClick={() => setDisplayAllSelectedFilters(!displayAllSelectedFilters)}
          >
            {displayAllSelectedFilters ? t('filter.controls.hiddeFilterTags') : t('filter.controls.showFilterTags')}
          </Button>
        )}
      </div>
    </div>
  )
}
