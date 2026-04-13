import {
  type Dispatch,
  type SetStateAction,
  useState,
  useEffect,
} from 'react'
import { Input } from '@/components/ui'
import { Search as SearchIcon } from 'lucide-react'
import { useDebounce } from '@/hooks'
interface FilterActionSearchProps {
  setSearchCaselaw: Dispatch<SetStateAction<string>>
}
export const FilterActionSearch = ({
  setSearchCaselaw,
}: FilterActionSearchProps) => {
  const [searchValue, setSearchValue] = useState('')
  const [prevValue, setPrevValue] = useState('')
  const searchDebouceValue = useDebounce(searchValue, 500)

  const handleSearchChange = (value: string) => {
    if (prevValue !== value) {
      setPrevValue(value)
      setSearchValue(value)
    }
  }
  useEffect(() => {
    setSearchCaselaw(searchDebouceValue)
  }, [searchDebouceValue, setSearchCaselaw])
  return (
    <>
      <div
        className="border-input flex w-full rounded-md border px-4"
      >
        <label
          htmlFor="filterActionSearch"
          className="flex items-center font-medium"
        >
          <SearchIcon
            className="mr-4"
            width="24"
          />
          <span className="inline-block whitespace-nowrap">Decision's title :</span>
        </label>
        <Input
          className="border-0"
          id="filterActionSearch"
          placeholder="Thessaloniki - ΑΔ406/2025"
          value={searchValue}
          onChange={event => handleSearchChange(event.target.value)}
        />
      </div>
    </>
  )
}
