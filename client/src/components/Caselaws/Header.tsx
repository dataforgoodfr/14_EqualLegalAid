import elaLogo from '@/assets/ela.png'
import './Header.css'
import { useTranslation } from 'react-i18next'
import { LanguageSwitcher } from '@/components/LanguageSwitcher'

/**
 * Application header with logo, title, and actions
 */
export const Header = () => {
  const { t } = useTranslation()
  return (
    <header className="app-header">
      <div className="header-content">
        <div className="logo-section">
          <img src={elaLogo} alt="ELA Logo" className="logo" />
          <div className="header-text">
            <h1>{t('header.title')}</h1>
            <p>{t('header.subtitle')}</p>
          </div>
        </div>
        <div className="header-actions">
          <LanguageSwitcher />
        </div>
      </div>
    </header>
  )
}
