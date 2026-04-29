import { useMemo } from 'react'
import { Accordion, FieldGroup } from '@/components/ui'
import { useTranslation } from 'react-i18next'
import { useAppDispatch } from '@/hooks/reduxHook'
import { setFilterTag } from '@/redux/filtersSlice'
import type { AirtableRecord } from '@/types'
import { TOGGLE_ACTION_MAP } from '../filtersConfig/config'
import type { CategoriesFilterItemProps } from './types'
import { KeywordField } from './KeywordField'
import { SubCategoryAccordion } from './SubCategoryAccordion'
import {
  toIdArray,
  getFieldValue,
  getName,
  getKeywordName
} from './utils'

export const CategoriesFilterItem = ({
  categories,
  subCategories,
  keywords,
  airtableBaseName,
  selectedIds,
}: CategoriesFilterItemProps) => {
  const { i18n } = useTranslation()
  const isGreek = i18n.language === 'el'
  const dispatch = useAppDispatch()

  const keywordMap = useMemo(
    () => new Map(keywords.map(keyword => [keyword.id, keyword])),
    [keywords],
  )

  const subCategoryMap = useMemo(
    () => new Map(subCategories.map(subCategory => [subCategory.id, subCategory])),
    [subCategories],
  )

  const getKeywordsBySubCategoryId = (subCategoryId: string) =>
    keywords.filter(kw => {
      const kwSubCategories = toIdArray(getFieldValue(kw, 'SubCategory'))
      return kwSubCategories.includes(subCategoryId)
    })

  const categoriesWithChildren = useMemo(
    () =>
      categories.map(category => {
        const subCategoryIds = toIdArray(getFieldValue(category, 'SubCategories'))
        const subCategoryItems = subCategoryIds
          .map(id => subCategoryMap.get(id))
          .filter((sub): sub is AirtableRecord => Boolean(sub))
          .map(subCategory => ({
            id: subCategory.id,
            name: getName(subCategory, isGreek),
            keywords: getKeywordsBySubCategoryId(subCategory.id),
          }))

        return {
          id: category.id,
          name: getName(category, isGreek),
          keywords: [] as AirtableRecord[],
          subCategories: subCategoryItems,
        }
      }),
    [categories, keywordMap, subCategoryMap, isGreek, keywords],
  )

  const handleKeywordChange = (keyword: AirtableRecord, checked: boolean) => {
    const name = getKeywordName(keyword, isGreek)
    const toggleAction = TOGGLE_ACTION_MAP[airtableBaseName]
    if (toggleAction) {
      dispatch(toggleAction({ id: keyword.id, checked }))
    }
    dispatch(
      setFilterTag({
        item: { filterStateName: airtableBaseName, id: keyword.id, name },
        itemChecked: checked,
      }),
    )
  }

  const handleGroupChange = (keywordRecords: AirtableRecord[], checked: boolean) => {
    const uniqueRecords = Array.from(
      new Map(keywordRecords.map(record => [record.id, record])).values(),
    )
    uniqueRecords.forEach(keyword => handleKeywordChange(keyword, checked))
  }

  // ─── Selection state helpers ──────────────────────────────────────────────

  const getKeywordSelectionState = (keyword: AirtableRecord) =>
    selectedIds.includes(keyword.id)

  const getGroupSelectionState = (keywordRecords: AirtableRecord[]) => {
    const uniqueRecords = Array.from(
      new Map(keywordRecords.map(record => [record.id, record])).values(),
    )
    const total = uniqueRecords.length
    const selectedCount = uniqueRecords.filter(kw => selectedIds.includes(kw.id)).length

    if (total === 0) return false
    if (selectedCount === total) return true
    if (selectedCount > 0) return 'indeterminate' as const
    return false
  }


  return (
    <Accordion type="multiple">
      {categoriesWithChildren.map(category => {
        const sameNameSubcategories = category.subCategories.filter(
          sub => sub.name === category.name,
        )
        const otherSubcategories = category.subCategories.filter(
          sub => sub.name !== category.name,
        )
        const categorySameNameKeywords = sameNameSubcategories.flatMap(sub => sub.keywords)
        const categoryChildKeywords = [...category.keywords, ...categorySameNameKeywords]

        // Special case: single sub-category sharing the category name
        // → render keywords directly without an accordion level
        const isSingleSameNameSubcategory =
          category.subCategories.length === 1 && sameNameSubcategories.length === 1

        if (isSingleSameNameSubcategory) {
          return (
            <div key={category.id} className="border-none bg-transparent not-last:mb-0">
              <div className="pl-6">
                {categoryChildKeywords.length > 0 && (
                  <FieldGroup>
                    {categoryChildKeywords.map(keyword => (
                      <KeywordField
                        key={keyword.id}
                        keyword={keyword}
                        isGreek={isGreek}
                        isChecked={getKeywordSelectionState(keyword)}
                        onCheckedChange={handleKeywordChange}
                      />
                    ))}
                  </FieldGroup>
                )}
              </div>
            </div>
          )
        }

        return (
          <div key={category.id}>
            {otherSubcategories.length > 0 && (
              <SubCategoryAccordion
                subCategories={otherSubcategories}
                isGreek={isGreek}
                getKeywordSelectionState={getKeywordSelectionState}
                getGroupSelectionState={getGroupSelectionState}
                onKeywordChange={handleKeywordChange}
                onGroupChange={handleGroupChange}
              />
            )}
          </div>
        )
      })}
    </Accordion>
  )
}
