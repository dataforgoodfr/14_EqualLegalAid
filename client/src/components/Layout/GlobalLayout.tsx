import { useState } from 'react'
import type { HeaderNavigationItemType } from '@/types'
import { HeaderComponent } from '@/components/Header'
import { Outlet } from 'react-router-dom'

export const GlobalLayout = () => {
  const [activeTab, setActiveTab] = useState<HeaderNavigationItemType>('caselaw')
  return (
    <div className="app mx-auto my-0 w-full xl:max-w-315">
      <HeaderComponent setActiveTab={setActiveTab} />
      <main className="main-content px-4 xl:px-0">
        <Outlet />
      </main>
    </div>
  )
}
