import { Input } from '@/components/ui'
interface FilterSearchProps {
  placeholderContent?: string
}
export const FilterSearch = ({
  placeholderContent = '',
}: FilterSearchProps) => {
  return (
    <div className="filter-search">
      <Input
        placeholder={placeholderContent.length > 0 ? placeholderContent : ''}
      />
    </div>
  )
}
