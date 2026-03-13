import {
  useState,
  useEffect,
} from 'react'
import { Input } from '@/components/ui'
import { useDebounce } from '@/hooks'
import type { AirtableBaseNameEnum } from '@/types'
import { useAppDispatch } from '@/hooks/reduxHook'
import { setSearchInGivenFilter } from '@/redux/filtersSlice'
import { Spinner } from '@/components/Spinner/Spinner'
import { Search as SearchIcon } from 'lucide-react'
interface FilterSearchProps {
  placeholderContent?: string
  airtableBaseName: AirtableBaseNameEnum
}
export const FilterSearch = ({
  placeholderContent = '',
  airtableBaseName,
}: FilterSearchProps) => {
  const [searchValue, setSearchValue] = useState('')

  const searchDebouceValue = useDebounce(searchValue, 500)

  const dispatch = useAppDispatch()
  const loading = searchValue !== searchDebouceValue
  const handleSearchChange = (value: string) => {
    setSearchValue(value)
  }
  useEffect(() => {
    dispatch(
      setSearchInGivenFilter({
        airtableBaseName,
        value: searchDebouceValue,
      }),
    )
  }, [searchDebouceValue, airtableBaseName, dispatch])
  return (
    <div className="filter-search relative">
      <Input
        value={searchValue}
        placeholder={placeholderContent.length > 0 ? placeholderContent : ''}
        onChange={event => handleSearchChange(event.target.value)}
        className="pr-7"
      />
      <div className="absolute top-[50%] right-2 h-4 w-4 translate-y-[-50%]">
        {!loading && (
          <SearchIcon className="text-muted-foreground h-full w-full" />
        )}
        {loading && (
          <Spinner className="h-full w-full" />
        )}
      </div>
    </div>
  )
}
