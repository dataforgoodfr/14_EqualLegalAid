import { lazy, Suspense, useState } from 'react'
import { Loading } from '@/components'
import { HeaderComponent } from '@/components/Header'

const StatisticPage = lazy(() =>
  import('@/components/Pages/StatisticPage').then(m => ({ default: m.StatisticPage })),
)
const DecisionPage = lazy(() =>
  import('@/components/Pages/DecisionPage').then(m => ({ default: m.DecisionPage })),
)

import type { HeaderNavigationItemType } from '@/types'

function App() {
  const [activeTab, setActiveTab] = useState<HeaderNavigationItemType>('statistics')

  return (
    <div className="app mx-auto my-0 w-full xl:max-w-315">
      <HeaderComponent setActiveTab={setActiveTab} />
      <main className="main-content px-4 xl:px-0">

        {activeTab === 'caselaw' && (
          <Suspense fallback={<Loading />}>
            <DecisionPage />
          </Suspense>
        )}

        {activeTab === 'statistics' && (
          <Suspense fallback={<Loading />}>
            <StatisticPage />
          </Suspense>
        )}
      </main>
    </div>
  )
}

export default App
