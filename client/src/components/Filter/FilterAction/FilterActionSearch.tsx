import {
  type Dispatch,
  type SetStateAction,
  useState,
  useEffect,
} from 'react'
import { Input } from '@/components/ui'
import { Search as SearchIcon } from 'lucide-react'
import { useDebounce } from '@/hooks'
import { useTranslation } from 'react-i18next'
import { cn } from '@/lib/utils'
interface FilterActionSearchProps {
  setSearchCaselaw: Dispatch<SetStateAction<string>>
  className?: string
}
export const FilterActionSearch = ({
  setSearchCaselaw,
  className,
}: FilterActionSearchProps) => {
  const [searchValue, setSearchValue] = useState('')
  const [prevValue, setPrevValue] = useState('')
  const searchDebouceValue = useDebounce(searchValue, 500)
  const { t } = useTranslation()

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
        className={cn(
          'border-input flex w-full rounded-md border px-4',
          className,
        )}
      >
        <label
          htmlFor="filterActionSearch"
          className="flex items-center font-medium"
        >
          <SearchIcon
            className="mr-4"
            width="24"
          />
          <span className="inline-block whitespace-nowrap">{t('filter.decisionTitle')}</span>
        </label>
        <Input
          className="border-0"
          id="filterActionSearch"
          placeholder={t('filter.titlePlaceholder')}
          value={searchValue}
          onChange={event => handleSearchChange(event.target.value)}
        />
      </div>
    </>
  )
}
