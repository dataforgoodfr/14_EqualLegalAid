import { useState, type Dispatch, type SetStateAction } from 'react'
import type { FilterTagInterface } from '@/types'
import { Button, Input } from '@/components/ui'
import { ArrowDownWideNarrow, ArrowUpNarrowWide } from 'lucide-react'
import { useAppSelector, useAppDispatch } from '@/hooks/reduxHook'
import { X } from 'lucide-react'
import { setFilterTag } from '@/redux/filtersSlice'
import {
  TOGGLE_ACTION_MAP,
  FilterActionSearch,
} from '@/components/Filter'
interface FilterActionProps {
  count: number
  setSort: Dispatch<SetStateAction<boolean>>
}

export const FilterAction = ({
  count = 1,
  setSort,
}: FilterActionProps) => {
  const [recentFirst, setRecentFirst] = useState(true)
  const handleSort = () => {
    setRecentFirst(!recentFirst)
    setSort(!recentFirst)
  }
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
  return (
    <div className="filter-action">
      <p className="text-gray-count mb-6 text-xl font-semibold">
        <span className="mr-2 font-bold text-black">{count}</span>
        {count > 1 ? 'Decisions' : 'Decision'}
      </p>
      <div className="flex justify-between">
        <Button onClick={handleSort} variant="outline" className="font-bold">
          {recentFirst ? (<ArrowDownWideNarrow />) : (<ArrowUpNarrowWide />)}
          Sort by:
          {' '}
          {recentFirst ? 'Newest' : 'Oldest'}
        </Button>
        <FilterActionSearch />
      </div>
      {filterTags.length > 0 && createFilterTags(filterTags)}
    </div>
  )
}
