import { HeaderComponent } from '@/components/Header'
import { Outlet } from 'react-router-dom'
import { useEmbedMode } from '@/hooks/useEmbedMode'

export const GlobalLayout = () => {
  const isEmbed = useEmbedMode()
  return (
    <div className="app mx-auto my-0 w-full xl:max-w-315">
      {!isEmbed && <HeaderComponent />}
      <main className="main-content px-4 xl:px-0">
        <Outlet />
      </main>
    </div>
  )
}
