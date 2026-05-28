import {
  useState,
} from 'react'
import { NavLink } from 'react-router-dom'
import elaLogo from '@/assets/ela.png'
import { useTranslation } from 'react-i18next'
import { LanguageSwitcher } from '@/components/LanguageSwitcher'
import { HeaderBurgerButton, HeaderNavigation, HeaderMobile } from '@/components/Header'
/**
 * Application header with logo, title, and actions
 */
export const HeaderComponent = () => {
  const { t } = useTranslation()
  const [showHeaderMobile, setShowHeaderMobile] = useState<boolean>(false)
  return (
    <>
      <header className="flex w-full justify-between px-4 py-5 xl:px-0">
        <div className="flex items-center">
          <NavLink to="/">
            <img
              src={elaLogo}
              alt="ELA Logo"
              className="mr-6 block h-auto w-17.5 xl:mr-10"
            />
          </NavLink>
          <h1 className="text-logo text-[16px] font-bold xl:text-[20px]">{t('header.title')}</h1>
        </div>
        <div
          className="flex items-center"
        >
          <LanguageSwitcher
            className="hidden xl:flex"
          />
          <HeaderBurgerButton
            className="relative xl:hidden"
            onClick={() => setShowHeaderMobile(true)}
          />
        </div>
      </header>
      <HeaderMobile
        className="xl:hidden"
        showMobileMenu={showHeaderMobile}
        setShowMobileMenu={setShowHeaderMobile}
      />
      <HeaderNavigation
        className="hidden xl:flex"
      />
    </>

  )
}
