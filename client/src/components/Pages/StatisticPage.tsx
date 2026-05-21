import { useState } from 'react'
import { AsylumApplications } from '@/components/Indicators/AsylumApplications'
import { EuropeRegionMap } from '@/components/Indicators/EuropeRegionMap'
import { AsylumApplicationsEvolutionInGreece } from '@/components/Indicators/AsylumApplicationsEvolutionInGreece'
import { ArrivalsGreece } from '@/components/Indicators/ArrivalsGreece'
import { AsylumSeekersCamps } from '@/components/Indicators/AsylumSeekersCamps'
import { ApplicationsEvolutionGreece } from '@/components/Indicators/ApplicationsEvolutionGreece'
import { ProtectionDecisions } from '@/components/Indicators/ProtectionDecisions'
import { RecognitionRates } from '@/components/Indicators/RecognitionRates'
import { KeyFiguresHeader } from '@/components/Indicators/KeyFiguresHeader'
import { useIndicatorCustomTexts } from '@/hooks/useIndicatorCustomTexts'
import { useKeyFigures } from '@/hooks/useKeyFigures'
import { useTranslation } from 'react-i18next'

export default function StatisticPage() {
  const { records: customTexts } = useIndicatorCustomTexts()
  const keyFigures = useKeyFigures()
  const { t, i18n } = useTranslation()
  const isGr = i18n.language === 'el'
  const [activeTab, setActiveTab] = useState(0)

  const asylumApplicationsInEurope = customTexts.filter(ct => ct.name === 'AsylumApplicationsInEurope')[0] ?? null
  const asylumApplicationsInEuropeanUnion = customTexts.filter(ct => ct.name === 'AsylumApplicationsInEuropeanUnion')[0] ?? null
  const arrivalsInGreece = customTexts.filter(ct => ct.name === 'ArrivalsInGreece')[0] ?? null
  const asylumApplicationsEvolutionInGreece = customTexts.filter(ct => ct.name === 'AsylumApplicationsEvolutionInGreece')[0] ?? null
  const asylumSeekersCamps = customTexts.filter(ct => ct.name === 'AsylumSeekersCamps')[0] ?? null
  const applicationsEvolutionGreece = customTexts.filter(ct => ct.name === 'ApplicationsEvolutionGreece')[0] ?? null
  const protectionGrantedVsRejected = customTexts.filter(ct => ct.name === 'ProtectionGrantedVsRejected')[0] ?? null
  const recognitionRates = customTexts.filter(ct => ct.name === 'RecognitionRates')[0] ?? null

  const tabLabels = [
    (isGr ? asylumApplicationsInEurope?.title_gr : asylumApplicationsInEurope?.title_en) || t('statistics.euAsylumApplications'),
    (isGr ? asylumApplicationsInEuropeanUnion?.title_gr : asylumApplicationsInEuropeanUnion?.title_en) || t('statistics.euAsylumApplications'),
    (isGr ? arrivalsInGreece?.title_gr : arrivalsInGreece?.title_en) || t('statistics.arrivalsGreece'),
    (isGr ? asylumApplicationsEvolutionInGreece?.title_gr : asylumApplicationsEvolutionInGreece?.title_en) || t('statistics.asylumEvolutionGreece'),
    (isGr ? protectionGrantedVsRejected?.title_gr : protectionGrantedVsRejected?.title_en) || t('statistics.protectionDecisions'),
    // (isGr ? asylumSeekersCamps?.title_gr : asylumSeekersCamps?.title_en) || t('statistics.asylumSeekersCamps'),
    // (isGr ? applicationsEvolutionGreece?.title_gr : applicationsEvolutionGreece?.title_en) || t('statistics.applicationsEvolutionGreece'),
    // (isGr ? recognitionRates?.title_gr : recognitionRates?.title_en) || t('statistics.recognitionRates'),
  ]

  return (
    <>
      <KeyFiguresHeader data={keyFigures} />

      <div className="flex flex-wrap gap-2 border-b border-gray-200 px-1 py-3">
        {tabLabels.map((label, i) => (
          <button
            key={i}
            onClick={() => setActiveTab(i)}
            className={`rounded-full px-4 py-1.5 text-sm font-medium whitespace-nowrap transition-colors ${
              activeTab === i
                ? 'bg-[#04356C] text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-900'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {activeTab === 0 && (
        <EuropeRegionMap customText={asylumApplicationsInEurope} />
      )}
      {activeTab === 1 && (
        <AsylumApplications customText={asylumApplicationsInEuropeanUnion} />
      )}
      {activeTab === 2 && (
        <ArrivalsGreece customText={arrivalsInGreece} />
      )}
      {activeTab === 3 && (
        <AsylumApplicationsEvolutionInGreece customText={asylumApplicationsEvolutionInGreece} />
      )}
      {activeTab === 4 && (
        <ProtectionDecisions customText={protectionGrantedVsRejected} />
      )}
      {activeTab === 5 && (
        <AsylumSeekersCamps customText={asylumSeekersCamps} />
      )}
      {activeTab === 6 && (
        <ApplicationsEvolutionGreece customText={applicationsEvolutionGreece} />
      )}
      {activeTab === 7 && (
        <ProtectionDecisions customText={protectionGrantedVsRejected} />
      )}
      {activeTab === 8 && (
        <RecognitionRates customText={recognitionRates} />
      )}
    </>
  )
}
