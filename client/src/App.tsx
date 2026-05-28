import { lazy, Suspense, useState } from 'react'
import { Loading } from '@/components'
import { HeaderComponent } from '@/components/Header'

const StatisticPage = lazy(() => import('@/components/Pages/StatisticPage'))
const DecisionPage = lazy(() => import('@/components/Pages/DecisionPage'))

import type { HeaderNavigationItemType } from '@/types'

function App() {
  const [activeTab, setActiveTab] = useState<HeaderNavigationItemType>('caselaw')

  return (
    <div className="app mx-auto my-0 w-full xl:max-w-315">
      <HeaderComponent setActiveTab={setActiveTab} />
      <main className="main-content px-4 xl:px-0">

        <Suspense fallback={<Loading />}>
          {activeTab === 'caselaw' && <DecisionPage />}
          {activeTab === 'statistics' && <StatisticPage />}
        </Suspense>
      </main>
    </div>
  )
}

export default App
