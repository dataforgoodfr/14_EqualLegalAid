import './CaselawCard.css'
import type { AirtableRecord } from '@/types'
import { CaselawCard } from '@/components/CaselawCard'
import { sortPerDate } from '@/utils/sortPerDate'

interface CaselawListProps {
  records: AirtableRecord[]
  sortDesc?: boolean
}

export const CaselawList = ({ records, sortDesc = true }: CaselawListProps) => {
  const caselaws = sortPerDate(records, sortDesc)

  if (caselaws.length === 0) {
    return <p className="caselaw-empty">No records found</p>
  }

  return (
    <div className="caselaw-grid">
      {caselaws.map((caselaw, index) => (
        <CaselawCard key={index} caselaw={caselaw} />
      ))}
    </div>
  )
}
