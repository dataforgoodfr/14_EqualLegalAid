import { useState } from 'react'
import type { Caselaw, SelectedCaselawItem } from '@/types'
import { Badge, Button, CardInfo, CardTitle } from '@/components/ui'
import { Download } from 'lucide-react'
import { useDownloadCaselaw } from '@/context/'
import { cn } from '@/lib/utils'
import { useTranslation } from 'react-i18next'
interface CaselawCardProps {
  caselaw: Caselaw
}

const OUTCOME_COLORS: Record<string, string> = {
  'Refugee Status granted': 'var(--color-outcome-accepted)',
  'Subsidiary Protection granted': 'var(--color-outcome-accepted)',
  'Application accepted': 'var(--color-outcome-accepted)',
  'Accepted: Remittal for new examination': 'var(--color-outcome-accepted)',
  'Application partially accepted': 'var(--color-outcome-accepted)',
  'Admissible': 'var(--color-outcome-accepted)',
  'Examination on the merits - Hearing of the applicant': 'var(--color-outcome-neutral)',
  'Application rejected': 'var(--color-outcome-rejected)',
  'Inadmissible': 'var(--color-outcome-rejected)',
}

export const CaselawCard = ({ caselaw }: CaselawCardProps) => {
  const { t, i18n } = useTranslation()
  const isGreek = i18n.language === 'el'
  const lang = <T,>(en: T, gr: T): T => (isGreek ? gr : en)

  // Colour map is keyed by English values regardless of display language
  const outcomeColor = OUTCOME_COLORS[caselaw.caselawOutcome] ?? 'var(--color-outcome-neutral)'
  const locale = isGreek ? 'el-GR' : 'en-GB'
  const formattedDate = caselaw.publishedAt.toLocaleDateString(locale, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
  const { setCaselawSelection, isSelected, isDownloadMode } = useDownloadCaselaw()
  const [isCardSelected, setIsCardSelected] = useState(isSelected(caselaw.title))

  const handleSelecteItem = () => {
    const selected = !isCardSelected
    if (!isDownloadMode) {
      return
    }
    setIsCardSelected(selected)
    const selectedObject: SelectedCaselawItem = {
      id: caselaw.title,
      pdf: {
        pdfFileName: caselaw.englishPdfLink.pdfFileName,
        pdfURL: caselaw.englishPdfLink.pdfURL,
      },
    }
    setCaselawSelection(selectedObject, selected)
  }
  return (
    <article
      className={cn(
        ' overflow-hidden rounded-xl  bg-white shadow-[0_2px_12px_rgba(0,46,93,0.08)] transition-all',
        isDownloadMode && 'cursor-pointer border-2 border-input',
        isDownloadMode && isSelected(caselaw.title) && 'scale-95 border-black bg-input',
      )}
      onClick={handleSelecteItem}
    >

      {/* Body */}
      <div className="p-5 px-6">
        <div className="relative flex min-w-0 flex-col gap-3">
          {/* Outcome badge */}
          <Badge
            label={lang(caselaw.caselawOutcome, caselaw.caselawOutcome_GR) || t('caselaw.unknownStatus')}
            color={outcomeColor}
            uppercase
          />

          {/* Title */}
          <CardTitle title={caselaw.title || t('caselaw.untitledCase')} />

          {/* Published + Country — same line */}
          <div className="flex flex-wrap gap-5">
            <CardInfo title={t('caselaw.published')} info={formattedDate} />
            {caselaw.countryOfOrigin && (
              <CardInfo title={t('caselaw.country')} info={lang(caselaw.countryOfOrigin, caselaw.countryOfOrigin_GR)} />
            )}
          </div>

          {/* Court */}
          {caselaw.competentCourtOrAuthority && (
            <CardInfo title={t('caselaw.court')} info={lang(caselaw.competentCourtOrAuthority, caselaw.competentCourtOrAuthority_GR)} />
          )}

          {/* Application */}
          {caselaw.applicationTypes && (
            <CardInfo title={t('caselaw.application')} info={lang(caselaw.applicationTypes, caselaw.applicationTypes_GR)} />
          )}

          {/* Asylum Procedure */}
          {caselaw.asylumProcedure && (
            <CardInfo title={t('caselaw.asylumProcedure')} info={lang(caselaw.asylumProcedure, caselaw.asylumProcedure_GR)} />
          )}

          {/* Keywords */}
          {caselaw.keywords.length > 0 && (
            <div className="flex flex-wrap gap-[0.4rem] pr-[25%]">
              {lang(caselaw.keywords, caselaw.keywords_GR).map(keyword => (
                <Badge key={keyword} label={keyword} />
              ))}
            </div>
          )}

          {/* PDF actions — always visible, disabled when no link */}
          <div className="flex justify-end gap-2 pt-1">
            {caselaw.englishPdfLink.pdfURL.length && (
              <Button
                size="xs"
                variant="outline"
                asChild
              >
                <a
                  href={caselaw.englishPdfLink.pdfURL}
                  target="_blank"
                >
                  <Download size={12} />
                  {t('caselaw.downloadEnglishPdf')}
                </a>
              </Button>
            )}
            {caselaw.greekPdfLink.pdfURL.length && (
              <Button
                size="xs"
                variant="outline"
                asChild
              >
                <a
                  href={caselaw.greekPdfLink.pdfURL}
                  target="_blank"
                >
                  <Download size={12} />
                  {t('caselaw.downloadGreekPdf')}
                </a>
              </Button>
            )}
          </div>
        </div>
      </div>
    </article>
  )
}
