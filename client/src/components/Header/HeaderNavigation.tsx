import { useState, type Dispatch, type SetStateAction } from 'react'
import { cn } from '@/lib/utils'
import { useTranslation } from 'react-i18next'
import type { HeaderNavigationItemType } from '@/types'

interface HeaderNavigationProps {
  className?: string
  setActiveTab: Dispatch<SetStateAction<HeaderNavigationItemType>>
  onClick?: () => void
}
interface HeaderNavigationItemInterface {
  id: HeaderNavigationItemType
  label: string
}
export const HeaderNavigation = ({ className, setActiveTab, onClick = () => {} }: HeaderNavigationProps) => {
  const { t } = useTranslation()
  const [actifNavigationItem, setActifNavigationItem] = useState<HeaderNavigationItemType>('caselaw')

  const handleActiveTab = (id: HeaderNavigationItemType) => {
    setActifNavigationItem(id)
    setActiveTab(id)
    onClick()
  }
  const headerNavigationItems: HeaderNavigationItemInterface[] = [
    { id: 'caselaw', label: t('nav.caselaw') },
    { id: 'statistics', label: t('nav.statistics') },
  ]
  return (
    <nav
      className={cn(
        'xl:bg-background xl:sticky xl:top-0 z-10 flex xl:border-t xl:flex-row flex-col border-l xl:border-l-0 border-[#8080E7] xl:border-input',
        className,
      )}
    >
      {headerNavigationItems.map(tab => (
        <div
          key={tab.id}
          className="xl:not-last:mr-6"
        >
          <button
            onClick={() => handleActiveTab(tab.id)}
            className={cn(
              'hover:text-blue-france group transition-colors xl:px-3 xl:py-4  cursor-pointer xl:text-[14px] xl:text-gray-800 text-blue-france font-bold xl:font-normal text-[20px] relative text-center overflow-hidden pl-8.25 py-4',
              { 'text-blue-france': actifNavigationItem === tab.id },
            )}
          >
            {tab.label}
            <span className={cn(
              'bg-blue-france absolute xl:-bottom-1.5 -left-1.5 xl:left-0 block xl:h-0.75 xl:w-full bottom-0 top-0 xl:top-auto w-0.75 group-hover:bottom-0 transition-all',
              { 'xl:bottom-0 left-0': actifNavigationItem === tab.id },
            )}
            />
          </button>
        </div>
      ))}
    </nav>
  )
}
