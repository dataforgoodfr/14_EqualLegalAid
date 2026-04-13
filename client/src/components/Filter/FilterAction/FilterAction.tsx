import { useState, useEffect, useRef, type Dispatch, type SetStateAction } from 'react'
import { DATE_FILTER_STATE_NAME, type FilterTagInterface } from '@/types'
import { Button } from '@/components/ui'
import { ArrowDownWideNarrow, ArrowUpNarrowWide } from 'lucide-react'
import { useAppSelector, useAppDispatch } from '@/hooks/reduxHook'
import { X, SquareMousePointer } from 'lucide-react'
import { resetDateEnd, resetDateStart, setFilterTag } from '@/redux/filtersSlice'
import { useDownloadCaselaw } from '@/context'
import {
  TOGGLE_ACTION_MAP,
  FilterActionSearch,
} from '@/components/Filter'
import { useTranslation } from 'react-i18next'
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
      <div className="mt-4 flex flex-wrap">
        {filterTags.map(filtertag => (
          <Button
            className="my-1.5 not-last:mr-2.5 hover:cursor-pointer"
            variant="secondary"
            onClick={() => handleClick(filtertag as FilterTagInterface)}
            key={filtertag.id}
          >
            {filtertag.name}
            <X />
          </Button>
        ))}
      </div>
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
      <p className="text-gray-count mb-6 text-xl font-semibold">
        <span className="mr-2 font-bold text-black">{count}</span>
        {t('filter.decisions', { count })}
      </p>
      <div className="flex justify-between gap-4">
        <Button onClick={handleSort} variant="outline" className="font-bold">
          {recentFirst ? (<ArrowDownWideNarrow />) : (<ArrowUpNarrowWide />)}
          {t('filter.sortBy')}
          {' '}
          {recentFirst ? t('filter.newest') : t('filter.oldest')}
        </Button>
        <FilterActionSearch
          setSearchCaselaw={setSearchCaselaw}
        />
        <div>
          <Button
            variant={isDownloadMode ? 'default' : 'outline'}
            className="cursor-pointer"
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
      {filterTags.length > 0 && createFilterTags(filterTags)}
    </div>
  )
}
