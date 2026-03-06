import {
  Field,
  FieldGroup,
  Checkbox,
  Label,
} from '@/components/ui'
import { FilterSearch } from '@/components/Filter'
import type { AirtableRecord } from '@/types/index'

interface FilterItemProps {
  enabledSearch?: boolean
  searchPlaceholder?: string
  items: AirtableRecord[]
  onFilterChange: (caselaws: string, action: boolean) => void
}

export const FilterItem = ({
  enabledSearch = false,
  searchPlaceholder = '',
  items,
  onFilterChange,
}: FilterItemProps) => {
  const filteredItems = items.filter(
    item =>
      item.fields?.Count_Caselaws
      && item.fields.Count_Caselaws !== '0',
  ).sort(
    (a, b) =>
      Number(b.fields?.Count_Caselaws ?? 0)
      - Number(a.fields?.Count_Caselaws ?? 0),
  )

  const handleCheckboxChange = (id: string, checked: boolean) => {
    const selectedItem = filteredItems.find(item => item.id === id)
    const caselawsRelatedToClickedFilter = selectedItem?.fields?.Caselaws as string
    onFilterChange(caselawsRelatedToClickedFilter, checked)
  }

  return (
    <div className="filter-item p-2">
      {enabledSearch && (
        <div className="filter-item__search my-4">
          <FilterSearch placeholderContent={searchPlaceholder} />
        </div>
      )}

      <div className="filter-item__content py-2">
        <FieldGroup>
          {filteredItems.map(item => (
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
                  onCheckedChange={checked => handleCheckboxChange(item.id, checked)}
                />
                <Label htmlFor={item.id}>
                  {item.fields?.Name_EN}
                </Label>
              </div>

              <p>{item.fields?.Count_Caselaws}</p>
            </Field>
          ))}
        </FieldGroup>
      </div>
    </div>
  )
}
