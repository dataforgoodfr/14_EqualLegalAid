import {
  Field,
  FieldGroup,
  Checkbox,
  Label,
} from '@/components/ui'
import { FilterSearch } from '@/components/Filter'
import type { BasicValuesInterface, AirtableBaseNameEnum } from '@/types'
import { useAppDispatch } from '@/hooks/reduxHook'
import { setFilterTag } from '@/redux/filtersSlice'
interface BasicFilterItemProps {
  enabledSearch?: boolean
  searchPlaceholder?: string
  airtableBaseName: AirtableBaseNameEnum
  items: BasicValuesInterface[]
  selectedIds: string[]
  onFilterChange: (id: string, checked: boolean) => void
}

export const BasicFilterItem = ({
  enabledSearch = false,
  searchPlaceholder = '',
  items,
  airtableBaseName,
  selectedIds = [],
  onFilterChange,
}: BasicFilterItemProps) => {
  const dispatch = useAppDispatch()
  const handleFilterChange = (id: string, name: string, checked: boolean) => {
    onFilterChange(id, checked as boolean)
    dispatch(setFilterTag({
      item: {
        filterStateName: airtableBaseName,
        id: id,
        name,
      },
      itemChecked: checked,
    }))
  }
  return (
    <div className="filter-item p-2">
      {enabledSearch && (
        <div className="filter-item__search my-4">
          <FilterSearch
            placeholderContent={searchPlaceholder}
            airtableBaseName={airtableBaseName}
          />
        </div>
      )}

      <div className="filter-item__content py-2">
        <FieldGroup>
          {items.map(item => (
            <Field
              key={item.id}
              className="flex items-center justify-between py-3.5"
              orientation="horizontal"
            >
              <div className="flex items-center">
                <Checkbox
                  id={item.id}
                  name={item.id}
                  className="mr-3"
                  checked={selectedIds.includes(item.id)}
                  onCheckedChange={checked => handleFilterChange(item.id, item.fields.Name_EN, checked as boolean)}
                />
                <Label htmlFor={item.id}>
                  {item.fields.Name_EN}
                </Label>
              </div>

              <p>{String(item.fields.Count_Caselaws)}</p>
            </Field>
          ))}
        </FieldGroup>
      </div>
    </div>
  )
}
