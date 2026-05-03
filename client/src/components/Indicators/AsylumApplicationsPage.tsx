import { useState } from 'react'
import { AsylumApplicationsDetails } from '@/components/Indicators/AsylumApplicationsDetails'
import { EuropeRegionMap } from '@/components/Indicators/EuropeRegionMap'
import { AsylumApplicationsEvolutionInGreece } from '@/components/Indicators/AsylumApplicationsEvolutionInGreece'
import { ArrivalsGreece } from '@/components/Indicators/ArrivalsGreece'
import { AsylumSeekersCamps } from '@/components/Indicators/AsylumSeekersCamps'
import { ApplicationsEvolutionGreece } from '@/components/Indicators/ApplicationsEvolutionGreece'
import { ProtectionDecisions } from '@/components/Indicators/ProtectionDecisions'
import { RecognitionRates } from '@/components/Indicators/RecognitionRates'
import { KeyFiguresHeader } from '@/components/Indicators/KeyFiguresHeader'
import { useAsylumApplications } from '@/hooks/useAsylumApplications'
import { useIndicatorCustomTexts } from '@/hooks/useIndicatorCustomTexts'
import { useKeyFigures } from '@/hooks/useKeyFigures'
import { useTranslation } from 'react-i18next'

export function AsylumApplicationsPage() {
  const { records, loading, error } = useAsylumApplications()
  const { records: customTexts } = useIndicatorCustomTexts()
  const keyFigures = useKeyFigures()
  const { t, i18n } = useTranslation()
  const isGr = i18n.language === 'el'
  const [activeTab, setActiveTab] = useState(0)

  const asylumApplicationsInEurope = customTexts.filter(ct => ct.name === 'AsylumApplicationsInEurope')[0] ?? null
  const asylumApplicationsInEuropeanUnion = customTexts.filter(ct => ct.name === 'AsylumApplicationsInEuropeanUnion')[0] ?? null
  const arrivalsInGreece = customTexts.filter(ct => ct.name === 'ArrivalsInGreece')[0] ?? null
  const asylumApplicationsEvolutionInGreece = customTexts.filter(ct => ct.name === 'AsylumApplicationsEvolutionInGreece')[0] ?? null
  const text5 = customTexts[5] ?? null
  const text6 = customTexts[6] ?? null
  const text7 = customTexts[7] ?? null

  const tabLabels = [
    (isGr ? asylumApplicationsInEurope?.title_gr : asylumApplicationsInEurope?.title_en) || t('statistics.euAsylumApplications'),
    (isGr ? asylumApplicationsInEuropeanUnion?.title_gr : asylumApplicationsInEuropeanUnion?.title_en) || t('statistics.euAsylumApplications'),
    (isGr ? arrivalsInGreece?.title_gr : arrivalsInGreece?.title_en) || t('statistics.arrivalsGreece'),
    (isGr ? asylumApplicationsEvolutionInGreece?.title_gr : asylumApplicationsEvolutionInGreece?.title_en) || t('statistics.asylumEvolutionGreece'),
    // (isGr ? text4?.title_gr : text4?.title_en) || t('statistics.asylumSeekersCamps'),
    // (isGr ? text5?.title_gr : text5?.title_en) || t('statistics.applicationsEvolutionGreece'),
    // (isGr ? text6?.title_gr : text6?.title_en) || t('statistics.protectionDecisions'),
    // (isGr ? text7?.title_gr : text7?.title_en) || t('statistics.recognitionRates'),
  ]

  return (
    <>
      <KeyFiguresHeader data={keyFigures} />

      <div className="flex flex-wrap gap-2 border-b border-gray-200 py-3 px-1">
        {tabLabels.map((label, i) => (
          <button
            key={i}
            onClick={() => setActiveTab(i)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
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
        <AsylumApplicationsDetails records={records} loading={loading} error={error} customText={asylumApplicationsInEuropeanUnion} />
      )}
      {activeTab === 2 && (
        <ArrivalsGreece customText={arrivalsInGreece} />
      )}
      {activeTab === 3 && (
        <AsylumApplicationsEvolutionInGreece customText={asylumApplicationsEvolutionInGreece} />
      )}
      {activeTab === 4 && (
        <AsylumSeekersCamps customText={text5} />
      )}
      {activeTab === 5 && (
        <ApplicationsEvolutionGreece customText={text5} />
      )}
      {activeTab === 6 && (
        <ProtectionDecisions customText={text6} />
      )}
      {activeTab === 7 && (
        <RecognitionRates customText={text7} />
      )}
    </>
  )
}
