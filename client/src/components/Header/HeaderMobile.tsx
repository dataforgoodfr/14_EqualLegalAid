import type { Dispatch, SetStateAction } from 'react'
import type { HeaderNavigationItemType } from '@/types'
import { cn } from '@/lib/utils'
import { X } from 'lucide-react'
import { HeaderNavigation } from '@/components/Header'
import { LanguageSwitcher } from '@/components/LanguageSwitcher'
interface HeaderBurgerButtonProps {
  className?: string
  showMobileMenu: boolean
  setShowMobileMenu: Dispatch<SetStateAction<boolean>>
  setActiveTab: Dispatch<SetStateAction<HeaderNavigationItemType>>
}
export const HeaderMobile = ({ className, showMobileMenu, setShowMobileMenu, setActiveTab }: HeaderBurgerButtonProps) => {
  return (
    <div className={cn(
      'fixed top-0 left-0 z-800 h-screen w-full bg-white translate-y-full transition-transform px-4 py-6',
      { 'translate-y-0': showMobileMenu },
      className,
    )}
    >
      <div className="mb-8 flex justify-end">
        <button
          className="border-input flex h-9 w-9 items-center justify-center rounded-[10px] border bg-gray-100"
          onClick={() => setShowMobileMenu(false)}
        >
          <X
            size={16}
          />
        </button>
      </div>
      <div className="pb-24">
        <HeaderNavigation
          setActiveTab={setActiveTab}
          onClick={() => setShowMobileMenu(false)}
        />
      </div>
      <div className="absolute right-4 bottom-6 left-4 flex flex-col items-center">
        <LanguageSwitcher />
      </div>
    </div>
  )
}
