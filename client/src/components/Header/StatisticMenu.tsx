import { NavLink } from "react-router"
import { useTranslation } from 'react-i18next'
import type { IndicatorCustomText } from "@/hooks/useIndicatorCustomTexts"
import { cn } from '@/lib/utils'

interface NavLinkItem {
  label: string
  to: string
}

export default function ({customTexts}:{customTexts:IndicatorCustomText[]}) {

    const { t, i18n } = useTranslation()
    const isGr = i18n.language === 'el'

    const asylumApplicationsInEurope = customTexts.filter(ct => ct.name === 'AsylumApplicationsInEurope')[0] ?? null
    const asylumApplicationsInEuropeanUnion = customTexts.filter(ct => ct.name === 'AsylumApplicationsInEuropeanUnion')[0] ?? null
    const arrivalsInGreece = customTexts.filter(ct => ct.name === 'ArrivalsInGreece')[0] ?? null
    const asylumApplicationsEvolutionInGreece = customTexts.filter(ct => ct.name === 'AsylumApplicationsEvolutionInGreece')[0] ?? null
    const protectionGrantedVsRejected = customTexts.filter(ct => ct.name === 'ProtectionGrantedVsRejected')[0] ?? null

    const tabItems: NavLinkItem[] = [
    { label: (isGr ? asylumApplicationsInEurope?.title_gr : asylumApplicationsInEurope?.title_en) || t('statistics.euAsylumApplications'), to: 'AsylumApplicationsInEurope' },
    { label: (isGr ? asylumApplicationsInEuropeanUnion?.title_gr : asylumApplicationsInEuropeanUnion?.title_en) || t('statistics.euAsylumApplications'), to: 'AsylumApplicationsInEuropeanUnion' },
    { label: (isGr ? arrivalsInGreece?.title_gr : arrivalsInGreece?.title_en) || t('statistics.arrivalsGreece'), to: 'ArrivalsInGreece' },
    { label: (isGr ? asylumApplicationsEvolutionInGreece?.title_gr : asylumApplicationsEvolutionInGreece?.title_en) || t('statistics.asylumEvolutionGreece'), to: 'AsylumApplicationsEvolutionInGreece' },
    { label: (isGr ? protectionGrantedVsRejected?.title_gr : protectionGrantedVsRejected?.title_en) || t('statistics.protectionDecisions'), to: 'ProtectionGrantedVsRejected' }
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