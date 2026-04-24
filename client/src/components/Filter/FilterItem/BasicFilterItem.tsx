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
import { useTranslation } from 'react-i18next'
import { cn } from '@/lib/utils'
interface BasicFilterItemProps {
  enabledSearch?: boolean
  searchPlaceholder?: string
  airtableBaseName: AirtableBaseNameEnum
  items: BasicValuesInterface[]
  selectedIds: string[]
  onFilterChange: (id: string, checked: boolean) => void
  displayResultNumber?: boolean
}

export const BasicFilterItem = ({
  enabledSearch = false,
  searchPlaceholder = '',
  items,
  airtableBaseName,
  selectedIds = [],
  displayResultNumber = false,
  onFilterChange,
}: BasicFilterItemProps) => {
  const dispatch = useAppDispatch()
  const { i18n } = useTranslation()
  const isGreek = i18n.language === 'el'
  const getItemName = (item: BasicValuesInterface) =>
    isGreek ? (item.fields.Name_GR || item.fields.Name_EN) : item.fields.Name_EN

  const handleFilterChange = (id: string, name: string, checked: boolean) => {
    onFilterChange(id, checked)
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
    <div className="filter-item rounded-md border-gray-200 bg-white xl:p-2">
      {enabledSearch && (
        <div>
          <FilterSearch
            placeholderContent={searchPlaceholder}
            airtableBaseName={airtableBaseName}
          />
        </div>
      )}

      <div className="filter-item__content borde rounded-md">
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
                  className="rounded-0 mr-3"
                  checked={selectedIds.includes(item.id)}
                  onCheckedChange={checked => handleFilterChange(item.id, getItemName(item), checked as boolean)}
                />
                <Label htmlFor={item.id}>
                  {getItemName(item)}
                </Label>
              </div>

              <p className={cn(
                { hidden: !displayResultNumber },
              )}
              >
                {String(item.fields.Count_Caselaws)}
              </p>
            </Field>
          ))}
        </FieldGroup>
      </div>
    </div>
  )
}
