import type { IndicatorCustomText } from '@/hooks/useIndicatorCustomTexts'
import { useCourtAsylumProcedures } from '@/hooks/useCourtAsylumProcedures'
import { CourtAsylumProceduresDetails } from './CourtAsylumProceduresDetails'

export function CourtAsylumProcedures({ customText }: { customText?: IndicatorCustomText | null }) {
  const { annulments, interimMeasures, legalAid, loading, error } = useCourtAsylumProcedures()
  return (
    <CourtAsylumProceduresDetails
      annulments={annulments}
      interimMeasures={interimMeasures}
      legalAid={legalAid}
      loading={loading}
      error={error}
      customText={customText}
    />
  )
}
