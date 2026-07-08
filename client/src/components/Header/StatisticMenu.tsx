import { NavLink } from "react-router"
import { useTranslation } from 'react-i18next'
import type { IndicatorCustomText } from "@/hooks/useIndicatorCustomTexts"
import { cn } from '@/lib/utils'

interface NavLinkItem {
  label: string
  to: string
}

function remoteLabel(customTexts:IndicatorCustomText[], isGr:boolean, nameForFiltering:string){
    const labelDict = customTexts.filter(ct => ct.name === nameForFiltering)[0] ?? null
    return isGr ? labelDict?.title_gr : labelDict?.title_en
}

export default function ({customTexts}:{customTexts:IndicatorCustomText[]}) {

    const { t, i18n } = useTranslation()
    const isGr = i18n.language === 'el'

    const tabItems: NavLinkItem[] = [
        { label: remoteLabel(customTexts, isGr, "AsylumApplicationsInEurope") || t('statistics.euAsylumApplications'), to: 'AsylumApplicationsInEurope' },
        { label: remoteLabel(customTexts, isGr, "AsylumApplicationsInEuropeanUnion") || t('statistics.euAsylumApplications'), to: 'AsylumApplicationsInEuropeanUnion' },
        { label: remoteLabel(customTexts, isGr, "ArrivalsInGreece") || t('statistics.arrivalsGreece'), to: 'ArrivalsInGreece' },
        { label: remoteLabel(customTexts, isGr, "AsylumApplicationsEvolutionInGreece") || t('statistics.asylumEvolutionGreece'), to: 'AsylumApplicationsEvolutionInGreece' },
        { label: remoteLabel(customTexts, isGr, "ProtectionGrantedVsRejected") || t('statistics.protectionDecisions'), to: 'ProtectionGrantedVsRejected' },
        { label: remoteLabel(customTexts, isGr, "AsylumSeekersLivingInCamps") || t('statistics.asylumSeekersCamps'), to: 'AsylumSeekersCamps' },
    ]

    return (
        <div className="flex flex-wrap gap-2 border-b border-gray-200 px-1 py-3">
            {tabItems.map(tabItem => (
                <NavLink
                    to={tabItem.to}
                    key={tabItem.to}
                    className={({ isActive }: { isActive: boolean }) => cn(
                        'bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-900 rounded-full px-4 py-1.5 text-sm font-medium whitespace-nowrap transition-colors',
                        { 'bg-[#04356C] text-white': isActive },
                    )}
                >
                    {tabItem.label}
                </NavLink>
            ))}
        </div>
    )
            
}