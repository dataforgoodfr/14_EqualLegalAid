import type { Caselaw } from '../types';
import { downloadPdf } from '../utils/pdfHelpers';
import './CaselawCard.css';

interface CaselawCardProps {
  caselaw: Caselaw;
}

const OUTCOME_COLORS: Record<string, string> = {
  'Refugee Status granted': 'outcome-granted',
  'Subsidiary Protection granted': 'outcome-granted',
  'Application accepted': 'outcome-granted',
  'Accepted: Remittal for new examination': 'outcome-partial',
  'Application partially accepted': 'outcome-partial',
  'Admissible': 'outcome-partial',
  'Examination on the merits - Hearing of the applicant': 'outcome-neutral',
  'Application rejected': 'outcome-rejected',
  'Inadmissible': 'outcome-rejected',
};

const getOutcomeClass = (outcome: string): string => {
  return OUTCOME_COLORS[outcome] ?? 'outcome-neutral';
};

export const CaselawCard = ({ caselaw }: CaselawCardProps) => {
  const formattedDate = caselaw.publishedAt.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  return (
    <article className="caselaw-card">
      <div className={`card-outcome-stripe ${getOutcomeClass(caselaw.caselawOutcome)}`} />

      <div className="card-body">
        <div className="card-header">
          <h3 className="card-title">{caselaw.title || 'Untitled Case'}</h3>
          <span className={`outcome-badge ${getOutcomeClass(caselaw.caselawOutcome)}`}>
            {caselaw.caselawOutcome || 'Unknown Status'}
          </span>
        </div>

        <div className="card-meta">
          <span className="meta-item">
            <span className="meta-label">Published</span>
            <span className="meta-value">{formattedDate}</span>
          </span>
          {caselaw.countryOfOrigin && (
            <span className="meta-item">
              <span className="meta-label">Country</span>
              <span className="meta-value">{caselaw.countryOfOrigin}</span>
            </span>
          )}
          {caselaw.competentCourtOrAuthority && (
            <span className="meta-item">
              <span className="meta-label">Court</span>
              <span className="meta-value">{caselaw.competentCourtOrAuthority}</span>
            </span>
          )}
        </div>

        <div className="card-details">
          {caselaw.applicationType && (
            <div className="detail-row">
              <span className="detail-label">Application</span>
              <span className="detail-value">{caselaw.applicationType}</span>
            </div>
          )}
          {caselaw.legalProcedureType && (
            <div className="detail-row">
              <span className="detail-label">Procedure</span>
              <span className="detail-value">{caselaw.legalProcedureType}</span>
            </div>
          )}
          {caselaw.asylumProcedure && (
            <div className="detail-row">
              <span className="detail-label">Asylum Procedure</span>
              <span className="detail-value">{caselaw.asylumProcedure}</span>
            </div>
          )}
        </div>

        {caselaw.keywords.length > 0 && (
          <div className="card-keywords">
            {caselaw.keywords.map((keyword) => (
              <span key={keyword} className="keyword-chip">
                {keyword}
              </span>
            ))}
          </div>
        )}

        {(caselaw.englishPdfLink || caselaw.greekPdfLink) && (
          <div className="card-actions">
            {caselaw.englishPdfLink && (
              <button
                className="btn-pdf btn-pdf-en"
                onClick={() => downloadPdf(caselaw.englishPdfLink)}
                title="Download English PDF"
              >
                EN PDF
              </button>
            )}
            {caselaw.greekPdfLink && (
              <button
                className="btn-pdf btn-pdf-el"
                onClick={() => downloadPdf(caselaw.greekPdfLink)}
                title="Download Greek PDF"
              >
                EL PDF
              </button>
            )}
          </div>
        )}
      </div>
    </article>
  );
};
