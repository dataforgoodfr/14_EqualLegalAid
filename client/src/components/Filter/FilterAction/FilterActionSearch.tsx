import { useState, useEffect } from 'react'
import { Input } from '@/components/ui'
import { Search as SearchIcon } from 'lucide-react'
import { useDebounce } from '@/hooks'
export const FilterActionSearch = () => {
  const [searchValue, setSearchValue] = useState('')
  const [prevValue, setPrevValue] = useState('')
  const searchDebouceValue = useDebounce(searchValue, 500)

  const handleSearchChange = (value: string) => {
    if (prevValue !== value) {
      console.log('ici')
      setPrevValue(value)
      setSearchValue(value)
      console.log('value', value)
    }
  }
  useEffect(() => {
    console.log('searchDebouceValue', searchDebouceValue)
  }, [searchDebouceValue])
  return (
    <>
      <div className="border-input flex rounded-md border px-4">
        <label
          htmlFor="filterActionSearch"
          className="flex items-center font-medium"
        >
          <SearchIcon
            className="mr-4"
            width="24"
          />
          <span className="inline-block whitespace-nowrap">Search by case number :</span>
        </label>
        <Input
          className="border-0"
          id="filterActionSearch"
          placeholder="n° 2014R00363"
          value={searchValue}
          onChange={event => handleSearchChange(event.target.value)}
        />
      </div>
    </>
  )
}
