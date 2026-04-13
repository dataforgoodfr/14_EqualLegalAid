import './Loading.css'
import { useTranslation } from 'react-i18next'

/**
 * Loading spinner component
 */
export const Loading = () => {
  const { t } = useTranslation()
  return (
    <div className="loading">
      <div className="loading-spinner"></div>
      <div className="loading-text">{t('loading')}</div>
    </div>
  )
}
