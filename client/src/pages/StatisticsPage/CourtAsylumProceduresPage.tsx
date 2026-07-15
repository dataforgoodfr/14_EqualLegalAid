import { useOutletContext } from 'react-router-dom'
import { CourtAsylumProcedures } from '@/components/Indicators/CourtAsylumProcedures'
import type { StatisticOutletContext } from '@/types'

export const CourtAsylumProceduresPage = () => {
  const { getCustomText } = useOutletContext<StatisticOutletContext>()
  return (
    <CourtAsylumProcedures customText={getCustomText('CourtAsylumProcedures')} />
  )
}
