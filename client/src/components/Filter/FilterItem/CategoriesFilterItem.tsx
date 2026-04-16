import { useMemo } from 'react'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
  Checkbox,
  Field,
  FieldGroup,
  Label,
} from '@/components/ui'
import { useAppDispatch } from '@/hooks/reduxHook'
import { setFilterTag, toggleKeywordsSelected } from '@/redux/filtersSlice'
import { AirtableBaseNameEnum } from '@/types'
import type { AirtableRecord } from '@/types'

interface CategoriesFilterItemProps {
  categories: AirtableRecord[]
  subCategories: AirtableRecord[]
  keywords: AirtableRecord[]
  selectedKeywordIds: string[]
}

const toIdArray = (value: unknown): string[] => {
  if (Array.isArray(value)) {
    return value.filter((item): item is string => typeof item === 'string')
  }

  if (typeof value === 'string') {
    return value.split(',').map(item => item.trim()).filter(Boolean)
  }

  return []
}

const getFieldValue = (record: AirtableRecord, key: string): unknown => {
  const fieldKey = Object.keys(record.fields).find((fieldName) => fieldName.toLowerCase() === key.toLowerCase())
  return fieldKey ? record.fields[fieldKey] : undefined
}

const getStringField = (record: AirtableRecord, key: string): string => {
  const value = getFieldValue(record, key)
  return typeof value === 'string' ? value : ''
}

const getCategoryName = (record: AirtableRecord): string => {
  return getStringField(record, 'Name_EN') || getStringField(record, 'Name_GR') || 'Unknown'
}

const getSubCategoryName = (record: AirtableRecord): string => {
  return getStringField(record, 'Name_EN') || getStringField(record, 'Name_GR') || 'Unknown'
}

const getKeywordName = (record: AirtableRecord): string => {
  return getStringField(record, 'Keyword_EN') || getStringField(record, 'Keyword_GR') || 'Unknown'
}

const getKeywordCount = (record: AirtableRecord): number => {
  const value = getFieldValue(record, 'Caselaws')
  if (Array.isArray(value)) {
    return value.length
  }
  if (typeof value === 'string') {
    return value.split(',').map(item => item.trim()).filter(Boolean).length
  }
  return 0
}

export const CategoriesFilterItem = ({
  categories,
  subCategories,
  keywords,
  selectedKeywordIds,
}: CategoriesFilterItemProps) => {
  const dispatch = useAppDispatch()

  const keywordMap = useMemo(
    () => new Map(keywords.map(keyword => [keyword.id, keyword])),
    [keywords],
  )

  const subCategoryMap = useMemo(
    () => new Map(subCategories.map(subCategory => [subCategory.id, subCategory])),
    [subCategories],
  )

  const getKeywordsByIds = (ids: string[]) =>
    ids
      .map(id => keywordMap.get(id))
      .filter((keyword): keyword is AirtableRecord => Boolean(keyword))

  const categoriesWithChildren = useMemo(() => categories.map((category) => {
    const categoryKeywords = getKeywordsByIds(toIdArray(getFieldValue(category, 'Keywords')))
    const subCategoryIds = toIdArray(getFieldValue(category, 'SubCategories'))
    const subCategoryItems = subCategoryIds
      .map(id => subCategoryMap.get(id))
      .filter((subCategory): subCategory is AirtableRecord => Boolean(subCategory))
      .map((subCategory) => ({
        id: subCategory.id,
        name: getSubCategoryName(subCategory),
        keywords: getKeywordsByIds(toIdArray(getFieldValue(subCategory, 'Keywords'))),
      }))

    return {
      id: category.id,
      name: getCategoryName(category),
      keywords: categoryKeywords,
      subCategories: subCategoryItems,
    }
  }), [categories, keywordMap, subCategoryMap])

  const handleKeywordChange = (keyword: AirtableRecord, checked: boolean) => {
    const name = getKeywordName(keyword)
    dispatch(toggleKeywordsSelected({ id: keyword.id, checked }))
    dispatch(setFilterTag({
      item: {
        filterStateName: AirtableBaseNameEnum.Keywords,
        id: keyword.id,
        name,
      },
      itemChecked: checked,
    }))
  }

  const handleGroupChange = (keywordRecords: AirtableRecord[], checked: boolean) => {
    const uniqueRecords = Array.from(new Map(keywordRecords.map(record => [record.id, record])).values())
    uniqueRecords.forEach(keyword => {
      handleKeywordChange(keyword, checked)
    })
  }

  const getKeywordSelectionState = (keyword: AirtableRecord) => selectedKeywordIds.includes(keyword.id)

  const getGroupSelectionState = (keywordRecords: AirtableRecord[]) => {
    const uniqueRecords = Array.from(new Map(keywordRecords.map(record => [record.id, record])).values())
    const total = uniqueRecords.length
    const selectedCount = uniqueRecords.filter(keyword => selectedKeywordIds.includes(keyword.id)).length

    if (total === 0) {
      return false
    }

    if (selectedCount === total) {
      return true
    }

    if (selectedCount > 0) {
      return 'indeterminate'
    }

    return false
  }

  return (
    <div className="filter-item p-2">
      <div className="filter-item__content rounded-md border border-gray-200 bg-white px-4 py-3">
        <Accordion type="multiple">
          {categoriesWithChildren.map((category) => {
            const categoryKeywords = category.keywords
            const sameNameSubcategories = category.subCategories.filter(sub => sub.name === category.name)
            const otherSubcategories = category.subCategories.filter(sub => sub.name !== category.name)
            const categorySameNameKeywords = sameNameSubcategories.flatMap(sub => sub.keywords)
            const categoryChildKeywords = [...categoryKeywords, ...categorySameNameKeywords]
            const allKeywords = categoryChildKeywords.concat(...otherSubcategories.flatMap(sub => sub.keywords))
            const categoryChecked = getGroupSelectionState(allKeywords)
            const categoryCount = allKeywords.reduce((total, keyword) => total + getKeywordCount(keyword), 0)

            return (
              <AccordionItem value={category.id} key={category.id} className="bg-transparent">
                <AccordionTrigger className="items-center">
                  <div className="flex items-center justify-between w-full gap-2">
                    <div className="flex items-center gap-2">
                      <Checkbox
                        id={`category-${category.id}`}
                        name={`category-${category.id}`}
                        checked={categoryChecked}
                        onCheckedChange={checked => handleGroupChange(allKeywords, checked === true)}
                      />
                      <Label htmlFor={`category-${category.id}`} className="font-bold">
                        {category.name}
                      </Label>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {String(categoryCount)}
                    </span>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-4">
                    {categoryChildKeywords.length > 0 && (
                      <FieldGroup className="pl-6">
                        {categoryChildKeywords.map((keyword) => (
                          <Field
                            key={keyword.id}
                            className="flex items-center justify-between py-2.5"
                            orientation="horizontal"
                          >
                            <div className="flex items-center">
                              <Checkbox
                                id={keyword.id}
                                name={keyword.id}
                                className="mr-3"
                                checked={getKeywordSelectionState(keyword)}
                                onCheckedChange={checked => handleKeywordChange(keyword, checked === true)}
                              />
                              <Label htmlFor={keyword.id}>{getKeywordName(keyword)}</Label>
                            </div>
                            <p>{String(getKeywordCount(keyword))}</p>
                          </Field>
                        ))}
                      </FieldGroup>
                    )}

                    {otherSubcategories.length > 0 && (
                      <Accordion type="multiple">
                        {otherSubcategories.map((subCategory) => {
                          const subCategoryChecked = getGroupSelectionState(subCategory.keywords)
                          const subCategoryCount = subCategory.keywords.reduce(
                            (total, keyword) => total + getKeywordCount(keyword),
                            0,
                          )

                          return (
                            <AccordionItem value={subCategory.id} key={subCategory.id} className="bg-transparent">
                              <AccordionTrigger className="items-center">
                                <div className="flex items-center justify-between w-full gap-2">
                                  <div className="flex items-center gap-2">
                                    <Checkbox
                                      id={`subcategory-${subCategory.id}`}
                                      name={`subcategory-${subCategory.id}`}
                                      className="mr-2"
                                      checked={subCategoryChecked}
                                      onCheckedChange={checked => handleGroupChange(subCategory.keywords, checked === true)}
                                    />
                                    <Label htmlFor={`subcategory-${subCategory.id}`} className="italic">
                                      {subCategory.name}
                                    </Label>
                                  </div>
                                  <span className="text-sm text-muted-foreground">
                                    {String(subCategoryCount)}
                                  </span>
                                </div>
                              </AccordionTrigger>
                              <AccordionContent>
                                <div className="ml-10">
                                  <FieldGroup className="pl-4">
                                    {subCategory.keywords.map((keyword) => (
                                      <Field
                                        key={keyword.id}
                                        className="flex items-center justify-between py-2.5"
                                        orientation="horizontal"
                                      >
                                        <div className="flex items-center gap-2">
                                          <Checkbox
                                            id={keyword.id}
                                            name={keyword.id}
                                            className="mr-2"
                                            checked={getKeywordSelectionState(keyword)}
                                            onCheckedChange={checked => handleKeywordChange(keyword, checked === true)}
                                          />
                                          <Label htmlFor={keyword.id}>{getKeywordName(keyword)}</Label>
                                        </div>
                                        <p>{String(getKeywordCount(keyword))}</p>
                                      </Field>
                                    ))}
                                  </FieldGroup>
                                </div>
                              </AccordionContent>
                            </AccordionItem>
                          )
                        })}
                      </Accordion>
                    )}
                  </div>
                </AccordionContent>
              </AccordionItem>
            )
          })}
        </Accordion>
      </div>
    </div>
  )
}
