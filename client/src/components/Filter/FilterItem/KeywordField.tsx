import { Checkbox, Field, Label } from '@/components/ui'
import type { AirtableRecord } from '@/types'
import { getKeywordName } from './utils'

interface KeywordFieldProps {
  keyword: AirtableRecord
  isGreek: boolean
  isChecked: boolean
  onCheckedChange: (keyword: AirtableRecord, checked: boolean) => void
}

export const KeywordField = ({
  keyword,
  isGreek,
  isChecked,
  onCheckedChange,
}: KeywordFieldProps) => (
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
        checked={isChecked}
        onCheckedChange={checked => onCheckedChange(keyword, checked === true)}
      />
      <Label htmlFor={keyword.id}>
        {getKeywordName(keyword, isGreek)}
      </Label>
    </div>
  </Field>
)
