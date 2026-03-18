import { useState, type Dispatch, type SetStateAction } from 'react'
import { Button } from '@/components/ui'
import { ArrowDownWideNarrow, ArrowUpNarrowWide } from 'lucide-react'
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
      </div>
    </div>
  )
}
