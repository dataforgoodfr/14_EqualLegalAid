import type { AirtableRecord } from '@/types'
import { CaselawCard } from '@/components/Caselaws/CaselawCard'
import { sortPerDate } from '@/utils/sortPerDate'

interface CaselawListProps {
  records: AirtableRecord[]
  sortDesc?: boolean
  downloadMode: boolean
}

export const CaselawList = ({ records, sortDesc = true, downloadMode = false }: CaselawListProps) => {
  const caselaws = sortPerDate(records, sortDesc)
  if (caselaws.length === 0) {
    return <p className="py-12 text-center text-[var(--text-light)]">No records found</p>
  }

  return (
    <div className="my-6 flex flex-col gap-5">
      {caselaws.map((caselaw, index) => (
        <CaselawCard
          key={index}
          caselaw={caselaw}
          downloadMode={downloadMode}
        />
      ))}
    </div>
  )
}
