import { cn } from '@/lib/utils'
import { useTranslation } from 'react-i18next'
import type { HeaderNavigationItemType } from '@/types'
import { NavLink } from 'react-router-dom'
interface HeaderNavigationProps {
  className?: string
}
interface HeaderNavigationItemInterface {
  id: HeaderNavigationItemType
  label: string
  path: string
}
export const HeaderNavigation = ({ className }: HeaderNavigationProps) => {
  const { t } = useTranslation()

  const headerNavigationItems: HeaderNavigationItemInterface[] = [
    { id: 'caselaw', label: t('nav.caselaw'), path: '/' },
    { id: 'statistics', label: t('nav.statistics'), path: '/advocacy' },
  ]
  return (
    <nav
      className={cn(
        'xl:bg-white xl:sticky xl:top-0 z-10 flex xl:border-t xl:flex-row flex-col border-l xl:border-l-0 border-[#8080E7] xl:border-input',
        className,
      )}
    >
      <div className="absolute -right-2.5 h-full w-3 bg-white" />
      {headerNavigationItems.map(tab => (
        <div
          key={tab.id}
          className="xl:not-last:mr-6"
        >
          <NavLink
            to={tab.path}
            className={({ isActive }: { isActive: boolean }) => cn(
              'block hover:text-blue-france group transition-colors xl:px-3 xl:py-4  cursor-pointer xl:text-[14px] xl:text-gray-800 text-blue-france font-bold xl:font-normal text-[20px] relative text-center overflow-hidden pl-8.25 py-4',
              { 'xl:text-blue-france': isActive },
            )}
          >
            {({ isActive }: { isActive: boolean }) => (
              <>
                {tab.label}

                <span
                  className={cn(
                    'bg-blue-france absolute xl:-bottom-1.5 -left-1.5 xl:left-0 block xl:h-0.75 xl:w-full bottom-0 top-0 xl:top-auto w-0.75 group-hover:bottom-0 transition-all',
                    { 'xl:bottom-0 left-0': isActive },
                  )}
                />
              </>
            )}
          </NavLink>
        </div>
      ))}
    </nav>
  )
}
