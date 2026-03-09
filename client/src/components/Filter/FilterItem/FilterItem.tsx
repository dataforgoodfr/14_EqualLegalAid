import {
  Field,
  FieldGroup,
  Checkbox,
  Label,
} from '@/components/ui'
import { FilterSearch } from '@/components/Filter'

interface BasicItems {
  id: string
  fields: {
    Name_EN: string
    Name_GR: string
    Count_Caselaws: number
    Caselaws: string[]
  }
}

interface BasicFilterItemProps {
  enabledSearch?: boolean
  searchPlaceholder?: string
  items: BasicItems[]
  onFilterChange: (caselaws: string[], action: boolean) => void
}

export const BasicFilterItem = ({
  enabledSearch = false,
  searchPlaceholder = '',
  items,
  onFilterChange,
}: BasicFilterItemProps) => {

  const handleCheckboxChange = (id: string, checked: boolean) => {
    const selectedItem: BasicItems = items.find(item => item.id === id)!
    const caselawsRelatedToClickedFilter = selectedItem.fields.Caselaws as string[]  
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
                  onCheckedChange={(checked) => {handleCheckboxChange(item.id, checked as boolean)}}
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
