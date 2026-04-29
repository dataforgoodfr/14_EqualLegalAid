import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
  Checkbox,
  FieldGroup,
  Label,
} from '@/components/ui'
import type { AirtableRecord } from '@/types'
import type { SubCategoryItem } from './types'
import { KeywordField } from './KeywordField'

interface SubCategoryAccordionProps {
  subCategories: SubCategoryItem[]
  isGreek: boolean
  getKeywordSelectionState: (keyword: AirtableRecord) => boolean
  getGroupSelectionState: (keywords: AirtableRecord[]) => boolean | 'indeterminate'
  onKeywordChange: (keyword: AirtableRecord, checked: boolean) => void
  onGroupChange: (keywords: AirtableRecord[], checked: boolean) => void
}

export const SubCategoryAccordion = ({
  subCategories,
  isGreek,
  getKeywordSelectionState,
  getGroupSelectionState,
  onKeywordChange,
  onGroupChange,
}: SubCategoryAccordionProps) => (
  <Accordion type="multiple">
    {subCategories.map((subCategory) => {
      const subCategoryChecked = getGroupSelectionState(subCategory.keywords)

      return (
        <AccordionItem
          value={subCategory.id}
          key={subCategory.id}
          className="border-none bg-transparent not-last:mb-0"
        >
          <AccordionTrigger className="border-0 bg-transparent p-0 pl-4 !justify-start">
            <div className="flex w-full gap-2">
              <div className="flex items-center gap-2">
                <Checkbox
                  id={`subcategory-${subCategory.id}`}
                  name={`subcategory-${subCategory.id}`}
                  className="mr-2"
                  checked={subCategoryChecked}
                  onCheckedChange={checked =>
                    onGroupChange(subCategory.keywords, checked === true)
                  }
                />
                <Label 
                  htmlFor={`subcategory-${subCategory.id}`}
                  className="text-left"
                >
                  {subCategory.name}
                </Label>
              </div>
            </div>
          </AccordionTrigger>

          <AccordionContent className="pl-8">
            <FieldGroup>
              {subCategory.keywords.map(keyword => (
                <KeywordField
                  key={keyword.id}
                  keyword={keyword}
                  isGreek={isGreek}
                  isChecked={getKeywordSelectionState(keyword)}
                  onCheckedChange={onKeywordChange}
                />
              ))}
            </FieldGroup>
          </AccordionContent>
        </AccordionItem>
      )
    })}
  </Accordion>
)
