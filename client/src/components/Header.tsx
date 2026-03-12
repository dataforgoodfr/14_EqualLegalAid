import elaLogo from '@/assets/ela.png'
import './Header.css'

interface HeaderProps {
  recordCount: number
  loading: boolean
  error: string | null
  onRefresh: () => void
}

/**
 * Application header with logo, title, and actions
 */
export const Header = ({ recordCount, loading, error, onRefresh }: HeaderProps) => {
  return (
    <header className="app-header">
      <div className="header-content">
        <div className="logo-section">
          <img src={elaLogo} alt="ELA Logo" className="logo" />
          <div className="header-text">
            <h1>EQUAL LEGAL AID</h1>
            <p>Case Law Management System</p>
          </div>
        </div>
        <div className="header-actions">
          {!loading && !error && recordCount > 0 && (
            <div className="record-count">
              {recordCount}
              {' '}
              {recordCount === 1 ? 'Record' : 'Records'}
            </div>
          )}
          {!loading && !error && recordCount > 0 && (
            <button onClick={onRefresh} className="refresh-btn">
              🔄 Refresh
            </button>
          )}
        </div>
      </div>
    </header>
  )
}
