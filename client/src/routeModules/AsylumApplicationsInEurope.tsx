import { useOutletContext } from 'react-router'
import { EuropeRegionMap } from '@/components/Indicators/EuropeRegionMap'
import type { StatisticOutletContext } from '@/types'

export default function()
{
    const { getCustomText } = useOutletContext<StatisticOutletContext>()
    return <EuropeRegionMap customText={getCustomText('AsylumApplicationsInEurope')} />
}