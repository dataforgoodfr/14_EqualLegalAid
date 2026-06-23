import type { AirtableRecord } from '@/types'
import { CaselawCard } from '@/components/Caselaws/CaselawCard'
import { useSortPerDate } from '@/utils/sortPerDate'
import { useTranslation } from 'react-i18next'

interface CaselawListProps {
  records: AirtableRecord[]
  sortDesc?: boolean
}

export const CaselawList = ({ records, sortDesc = true }: CaselawListProps) => {
  const { t } = useTranslation()
  const caselaws = useSortPerDate(records, sortDesc)
  if (caselaws.length === 0) {
    return <p className="py-12 text-center text-(--text-light)">{t('caselaw.noRecords')}</p>
  }

  return (
    <div className="my-6">
      {caselaws.map(caselaw => (
        <div
          className="w-full not-last:mb-6 xl:not-last:mb-4"
          key={caselaw.id}
        >
          <CaselawCard
            caselaw={caselaw}
          />
        </div>
      ))}
    </div>
  )
}
