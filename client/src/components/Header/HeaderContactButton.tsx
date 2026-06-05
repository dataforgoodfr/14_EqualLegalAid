import { cn } from '@/lib/utils'
import { Mail } from 'lucide-react'
import { useTranslation } from 'react-i18next'

interface HeaderContactButtonProps {
  className?: string
}
export const HeaderContactButton = ({ className }: HeaderContactButtonProps) => {
  const { t } = useTranslation()
  return (
    <a
      className={cn(
        'text-blue-france flex items-center text-[18px] font-semibold',
        className,
      )}
      href="#_"
    >
      <Mail
        className="mr-2.5"
        size={20}
      />
      {t('header.contact')}
    </a>
  )
}
