import {
  Field,
  FieldGroup,
  Checkbox,
  Label,
} from '@/components/ui'
import { FilterSearch } from '@/components/Filter'
import type { BasicValuesInterface, AirtableBaseNameEnum } from '@/types'

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
                  onCheckedChange={checked => onFilterChange(item.id, checked as boolean)}
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
