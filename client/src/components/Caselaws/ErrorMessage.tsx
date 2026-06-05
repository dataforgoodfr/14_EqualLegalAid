import './ErrorMessage.css'
import { useTranslation } from 'react-i18next'

interface ErrorMessageProps {
  message: string
  onRetry: () => void
}

/**
 * Error message component with retry button
 */
export const ErrorMessage = ({ message, onRetry }: ErrorMessageProps) => {
  const { t } = useTranslation()
  return (
    <div className="error">
      <p>
        {t('error.prefix')}
        {message}
      </p>
      <button onClick={onRetry}>{t('error.retry')}</button>
    </div>
  )
}
