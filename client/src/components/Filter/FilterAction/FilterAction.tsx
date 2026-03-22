import { useState, useEffect, useRef, type Dispatch, type SetStateAction } from 'react'
import type { FilterTagInterface } from '@/types'
import { Button } from '@/components/ui'
import { ArrowDownWideNarrow, ArrowUpNarrowWide } from 'lucide-react'
import { useAppSelector, useAppDispatch } from '@/hooks/reduxHook'
import { X, SquareMousePointer } from 'lucide-react'
import { setFilterTag } from '@/redux/filtersSlice'
import { useDownloadCaselaw } from '@/context'
import {
  TOGGLE_ACTION_MAP,
  FilterActionSearch,
} from '@/components/Filter'
interface FilterActionProps {
  count: number
  setSort: Dispatch<SetStateAction<boolean>>
  setDownloadMode: Dispatch<SetStateAction<boolean>>
  setFindSpecificCaseLaw: (value: string) => void
}

export const FilterAction = ({
  count = 1,
  setSort,
  setFindSpecificCaseLaw,
  setDownloadMode,
}: FilterActionProps) => {
  const [recentFirst, setRecentFirst] = useState(true)
  const [searchCaseLaw, setSearchCaselaw] = useState('')
  const [enabledDownloadMode, setEnabledDownloadMode] = useState(false)
  const isFirstRender = useRef(true)
  const handleSort = () => {
    setRecentFirst(!recentFirst)
    setSort(!recentFirst)
  }
  const { selectedCaselaw, clearSelection, startDownloadPdf } = useDownloadCaselaw()
  const dispatch = useAppDispatch()
  const handleClick = (filterTag: FilterTagInterface) => {
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
  const handleDownloadMode = () => {
    setEnabledDownloadMode(!enabledDownloadMode)
    setDownloadMode(enabledDownloadMode)
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
        {count > 1 ? 'Decisions' : 'Decision'}
      </p>
      <div className="flex justify-between gap-4">
        <Button onClick={handleSort} variant="outline" className="font-bold">
          {recentFirst ? (<ArrowDownWideNarrow />) : (<ArrowUpNarrowWide />)}
          Sort by:
          {' '}
          {recentFirst ? 'Newest' : 'Oldest'}
        </Button>
        <FilterActionSearch
          setSearchCaselaw={setSearchCaselaw}
        />
        <div>
          <Button
            variant="outline"
            onClick={handleDownloadMode}
          >
            <SquareMousePointer className="mr-2" />
            Multi select
          </Button>
        </div>
      </div>
      {enabledDownloadMode && selectedCaselaw.length > 0 && (
        <div className="mt-4 flex gap-4">
          <Button
            onClick={startDownloadPdf}
            className="w-[50%]"
          >
            Download selected caselaw (
            {selectedCaselaw.length}
            )
          </Button>
          <Button
            className="w-[50%]"
            variant="secondary"
            onClick={clearSelection}
          >
            Clear selected caselaw
          </Button>
        </div>
      )}
      {filterTags.length > 0 && createFilterTags(filterTags)}
    </div>
  )
}
