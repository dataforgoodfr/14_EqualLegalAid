import { useOutletContext } from 'react-router'
import { ProtectionDecisions } from '@/components/Indicators/ProtectionDecisions'
import type { StatisticOutletContext } from '@/types'

export default function(){
    const { getCustomText } = useOutletContext<StatisticOutletContext>()
    return (
        <ProtectionDecisions customText={getCustomText('ProtectionGrantedVsRejected')} />
    )
}
