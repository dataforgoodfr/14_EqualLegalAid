import type { Caselaw } from '@/types'
import { Badge, Button, CardInfo, CardTitle, Checkbox, Field, Label } from '@/components/ui'
import { Download } from 'lucide-react'
import { useDownloadCaselaw, type SelectedCaselawItem } from '@/context/'
import { isPdfUrl } from '@/utils'
interface CaselawCardProps {
  caselaw: Caselaw
  downloadMode: boolean
}

const OUTCOME_COLORS: Record<string, string> = {
  'Refugee Status granted': 'var(--color-outcome-accepted)',
  'Subsidiary Protection granted': 'var(--color-outcome-accepted)',
  'Application accepted': 'var(--color-outcome-accepted)',
  'Accepted: Remittal for new examination': 'var(--color-outcome-partial)',
  'Application partially accepted': 'var(--color-outcome-partial)',
  'Admissible': 'var(--color-outcome-partial)',
  'Examination on the merits - Hearing of the applicant': 'var(--color-outcome-neutral)',
  'Application rejected': 'var(--color-outcome-rejected)',
  'Inadmissible': 'var(--color-outcome-rejected)',
}

export const CaselawCard = ({ caselaw, downloadMode }: CaselawCardProps) => {
  const outcomeColor = OUTCOME_COLORS[caselaw.caselawOutcome] ?? 'var(--color-outcome-neutral)'
  const formattedDate = caselaw.publishedAt.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
  const { setCaselawSelection, isSelected } = useDownloadCaselaw()
  const handleSelecteItem = (checked: boolean) => {
    console.log('handleSelecteItem', checked, caselaw)
    const selectedObject: SelectedCaselawItem = {
      id: caselaw.title,
      pdf: {
        pdfFileName: caselaw.englishPdfLink.pdfFileName,
        pdfURL: caselaw.englishPdfLink.pdfURL,
      },
    }
    setCaselawSelection(selectedObject, checked)
  }
  return (
    <article className="overflow-hidden rounded-xl bg-white shadow-[0_2px_12px_rgba(0,46,93,0.08)]">

      {/* Body */}
      <div className="p-5 px-6">
        <div className="relative flex min-w-0 flex-col gap-3 ">
          {downloadMode && (
            <div className="absolute top-0 right-0">
              <Field orientation="horizontal">
                <Checkbox
                  id={`${caselaw.title}-download-caselaw`}
                  name={`${caselaw.title}-download-caselaw`}
                  onCheckedChange={checked => handleSelecteItem(checked)}
                  checked={isSelected(caselaw.title)}
                />
                <Label htmlFor={`${caselaw.title}-download-caselaw`}>Download</Label>
              </Field>
            </div>
          )}
          {/* Outcome badge */}
          <Badge
            label={caselaw.caselawOutcome || 'Unknown Status'}
            color={outcomeColor}
            uppercase
          />

          {/* Title */}
          <CardTitle title={caselaw.title || 'Untitled Case'} />

          {/* Published + Country — same line */}
          <div className="flex flex-wrap gap-5">
            <CardInfo title="Published" info={formattedDate} />
            {caselaw.countryOfOrigin && <CardInfo title="Country" info={caselaw.countryOfOrigin} />}
          </div>

          {/* Court */}
          {caselaw.competentCourtOrAuthority && <CardInfo title="Court" info={caselaw.competentCourtOrAuthority} />}

          {/* Application */}
          {caselaw.competentCourtOrAuthority && <CardInfo title="Application" info={caselaw.applicationTypes || ''} />}

          {/* Asylum Procedure */}
          {caselaw.asylumProcedure && <CardInfo title="Asylum Procedure" info={caselaw.asylumProcedure} />}

          {/* Keywords */}
          {caselaw.keywords.length > 0 && (
            <div className="flex flex-wrap gap-[0.4rem] pr-[25%]">
              {caselaw.keywords.map(keyword => (
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
                  Download English PDF
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
                  Download Greek PDF
                </a>
              </Button>
            )}
          </div>
        </div>

      </div>
    </article>
  )
}
