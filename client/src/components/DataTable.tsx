import {
  getAllFieldNames,
  formatFieldValue,
  formatColumnHeader,
  isPdfUrl,
} from '../utils/formatters';
import { downloadPdf } from '../utils/pdfHelpers';
import type { AirtableRecord, AirtableFieldValue } from '../types';
import './DataTable.css';

interface DataTableProps {
  records: AirtableRecord[];
}

/**
 * Table component for displaying Airtable records
 */
export const DataTable = ({ records }: DataTableProps) => {
  const fields = getAllFieldNames(records);

  const renderCellContent = (value: AirtableFieldValue) => {
    if (isPdfUrl(value)) {
      return (
        <div className="pdf-actions">
          <span className="pdf-link">{value}</span>
          <button className="btn-download" onClick={() => downloadPdf(value)} title="Download PDF">
            Download
          </button>
        </div>
      );
    }
    return formatFieldValue(value);
  };

  if (records.length === 0) {
    return (
      <div className="loading">
        <p>No records found</p>
      </div>
    );
  }

  return (
    <div className="table-container">
      <table>
        <thead>
          <tr>
            {fields.map((field) => (
              <th key={field}>{formatColumnHeader(field)}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {records.map((record) => (
            <tr key={record.id}>
              {fields.map((field) => (
                <td key={field}>{renderCellContent(record.fields[field])}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
