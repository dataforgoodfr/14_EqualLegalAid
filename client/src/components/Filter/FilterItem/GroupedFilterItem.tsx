import { useMemo } from 'react'
import {
  Field,
  FieldGroup,
  Checkbox,
  Label,
} from '@/components/ui'

import type { BasicValuesInterface, AirtableBaseNameEnum } from '@/types'
import { useAppDispatch } from '@/hooks/reduxHook'
import { setFilterTag } from '@/redux/filtersSlice'
import { useTranslation } from 'react-i18next'

interface GroupedFilterItemProps {
  airtableBaseName: AirtableBaseNameEnum
  items: BasicValuesInterface[]
  selectedIds: string[]
  displayResultNumber?: boolean
  onFilterChange: (id: string, checked: boolean) => void
}

interface GroupedItem {
  category: string
  items: BasicValuesInterface[]
}

const NAME_DELIMITER = ' - '

const splitItemName = (name: string) => {
  const [category, ...rest] = name.split(NAME_DELIMITER)
  const subcategory = rest.join(NAME_DELIMITER).trim()

  return {
    category: category.trim(),
    subcategory: subcategory || null,
  }
}

const groupItemsByCategory = (items: BasicValuesInterface[], getDisplayName: (item: BasicValuesInterface) => string): GroupedItem[] => {
  const groups = new Map<string, GroupedItem>()

  items.forEach((item) => {
    const { category } = splitItemName(getDisplayName(item))
    const existingGroup = groups.get(category)

    if (existingGroup) {
      existingGroup.items.push(item)
      return
    }

    groups.set(category, {
      category,
      items: [item],
    })
  })

  return Array.from(groups.values())
}

export const GroupedFilterItem = ({
  items,
  airtableBaseName,
  selectedIds = [],
  onFilterChange,
  displayResultNumber = false,
}: GroupedFilterItemProps) => {
  const dispatch = useAppDispatch()
  const { i18n } = useTranslation()
  const isGreek = i18n.language === 'el'

  const getItemDisplayName = (item: BasicValuesInterface) => {
    if (isGreek) {
      return item.fields.Name_Long_GR ?? item.fields.Name_GR ?? item.fields.Name_Long_EN ?? item.fields.Name_EN
    }
    return item.fields.Name_Long_EN ?? item.fields.Name_EN
  }

  const groupedItems = useMemo(() => groupItemsByCategory(items, getItemDisplayName), [items, isGreek])

  const handleFilterChange = (id: string, name: string, checked: boolean) => {
    onFilterChange(id, checked)
    dispatch(setFilterTag({
      item: {
        filterStateName: airtableBaseName,
        id,
        name,
      },
      itemChecked: checked,
    }))
  }

  const handleGroupChange = (group: GroupedItem, checked: boolean) => {
    group.items.forEach((item) => {
      handleFilterChange(item.id, getItemDisplayName(item), checked)
    })
  }

  return (
    <div className="filter-item xl:p-2">
      <div className="filter-item__content">
        <FieldGroup>
          {groupedItems.map((group) => {
            const selectedChildrenCount = group.items.filter(item => selectedIds.includes(item.id)).length
            const allChildrenSelected = group.items.length > 0 && selectedChildrenCount === group.items.length
            const someChildrenSelected = selectedChildrenCount > 0 && !allChildrenSelected
            const groupCount = group.items.reduce((total, item) => total + item.fields.Count_Caselaws, 0)
            const isSingleUnsplitItem = group.items.length === 1 && splitItemName(getItemDisplayName(group.items[0])).subcategory === null

            if (isSingleUnsplitItem) {
              const item = group.items[0]

              return (
                <Field
                  key={item.id}
                  className="flex items-center justify-between"
                  orientation="horizontal"
                >
                  <div className="flex items-center">
                    <Checkbox
                      id={item.id}
                      name={item.id}
                      className="mr-3"
                      checked={selectedIds.includes(item.id)}
                      onCheckedChange={checked => handleFilterChange(item.id, getItemDisplayName(item), checked === true)}
                    />
                    <Label htmlFor={item.id}>
                      {getItemDisplayName(item)}
                    </Label>
                  </div>

                  {displayResultNumber && (
                    <p>{String(item.fields.Count_Caselaws)}</p>
                  )}
                </Field>
              )
            }

            return (
              <div key={group.category} className="not-last:mb-3">
                <Field
                  className="flex items-center justify-between"
                  orientation="horizontal"
                >
                  <div className="flex items-center">
                    <Checkbox
                      id={`group-${group.category}`}
                      name={`group-${group.category}`}
                      className="mr-3"
                      checked={allChildrenSelected ? true : someChildrenSelected ? 'indeterminate' : false}
                      onCheckedChange={checked => handleGroupChange(group, checked === true)}
                    />
                    <Label htmlFor={`group-${group.category}`}>
                      {group.category}
                    </Label>
                  </div>
                  {displayResultNumber && (<p>{String(groupCount)}</p>)}
                </Field>
                <FieldGroup className="mt-3 ml-8">
                  {group.items.map((item) => {
                    const displayName = getItemDisplayName(item)
                    const { subcategory } = splitItemName(displayName)

                    return (
                      <Field
                        key={item.id}
                        className="flex items-center justify-between not-last:mb-2"
                        orientation="horizontal"
                      >
                        <div className="flex items-center">
                          <Checkbox
                            id={item.id}
                            name={item.id}
                            className="mr-3"
                            checked={selectedIds.includes(item.id)}
                            onCheckedChange={checked => handleFilterChange(item.id, displayName, checked === true)}
                          />
                          <Label htmlFor={item.id}>
                            {subcategory ?? displayName}
                          </Label>
                        </div>

                        {displayResultNumber && (
                          <p>{String(item.fields.Count_Caselaws)}</p>
                        )}
                      </Field>
                    )
                  })}
                </FieldGroup>
              </div>
            )
          })}
        </FieldGroup>
      </div>
    </div>
  )
}
