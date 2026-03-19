import type { AirtableRecord } from '@/types'
import { CaselawCard } from '@/components/Caselaws/CaselawCard'
import { sortPerDate } from '@/utils/sortPerDate'

interface CaselawListProps {
  records: AirtableRecord[]
  sortDesc?: boolean
}

export const CaselawList = ({ records, sortDesc = true }: CaselawListProps) => {
  const caselaws = sortPerDate(records, sortDesc)

  if (caselaws.length === 0) {
    return <p className="text-center py-12 text-[var(--text-light)]">No records found</p>
  }

  return (
    <div className="flex flex-col gap-5 my-6">
      {caselaws.map((caselaw, index) => (
        <CaselawCard key={index} caselaw={caselaw} />
      ))}
    </div>
  )
}
