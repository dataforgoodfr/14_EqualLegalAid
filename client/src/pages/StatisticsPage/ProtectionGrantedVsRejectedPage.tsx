import { useOutletContext } from 'react-router-dom'
import { ProtectionDecisions } from '@/components/Indicators/ProtectionDecisions'
import type { StatisticOutletContext } from '@/types'

export const ProtectionGrantedVsRejectedPage = () => {
  const { getCustomText } = useOutletContext<StatisticOutletContext>()
  return (
    <ProtectionDecisions customText={getCustomText('ProtectionGrantedVsRejected')} />
  )
}
