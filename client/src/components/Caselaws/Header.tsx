import elaLogo from '@/assets/ela.png'
import './Header.css'

/**
 * Application header with logo, title, and actions
 */
export const Header = () => {
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
        </div>
      </div>
    </header>
  )
}
