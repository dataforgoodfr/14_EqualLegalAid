import {
  type Dispatch,
  type SetStateAction,
  useState,
  useEffect,
} from 'react'
import { Input } from '@/components/ui'
import { useDebounce } from '@/hooks'
interface FilterSearchProps {
  placeholderContent?: string
  onSearch: Dispatch<SetStateAction<string>>
}
export const FilterSearch = ({
  placeholderContent = '',
  onSearch,
}: FilterSearchProps) => {
  const [searchValue, setSearchValue] = useState('')
  const searchDebouceValue = useDebounce(searchValue, 1000)
  useEffect(() => {
    onSearch(searchDebouceValue)
  }, [searchDebouceValue, onSearch])
  return (
    <div className="filter-search">
      <Input
        placeholder={placeholderContent.length > 0 ? placeholderContent : ''}
        onChange={event => setSearchValue(event.target.value)}
      />
    </div>
  )
}
