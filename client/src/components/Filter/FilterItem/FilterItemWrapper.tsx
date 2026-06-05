import { cn } from '@/lib/utils'

import { ChevronLeft } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui'
import { useAppDispatch, useAppSelector } from '@/hooks/reduxHook'
import { resetAllSelected } from '@/redux/filtersSlice'
interface FilterItemWrapperProps {
  count: number
  FilterItemWrapperBackButtonLabel: string
  children: React.ReactNode
  showFilterItemWrapper: boolean
  setClosePanel: () => void
  setCloseAllPanel: () => void
}

export const FilterItemWrapper = ({
  FilterItemWrapperBackButtonLabel,
  children,
  count,
  setClosePanel,
  setCloseAllPanel,
  showFilterItemWrapper = false,
}: FilterItemWrapperProps) => {
  const { t } = useTranslation()
  const dispatch = useAppDispatch()
  const filterTags = useAppSelector(state => state.filters.filterTags)
  const handleCloseAllPanel = () => {
    setClosePanel()
    setCloseAllPanel()
  }
  const handleResetFilter = () => {
    dispatch(resetAllSelected())
    setClosePanel()
    setCloseAllPanel()
  }
  return (
    <div
      className={cn(
        'rounded-xl xl:relative xl:translate-y-0 fixed top-0 left-0 xl:z-1 z-100 xl:h-auto h-screen w-full bg-white px-4 xl:px-0 xl:py-0 translate-y-full transition-transform',
        { 'translate-y-0': showFilterItemWrapper },
      )}
    >
      <button
        className="flex w-full cursor-pointer items-center pt-6 pb-8 text-[20px] font-semibold text-[rgba(26,26,26,0.7)] xl:hidden"
        onClick={() => setClosePanel()}
      >
        <span className="border-input flex h-9 w-9 items-center justify-center rounded-[10px] border bg-gray-100">
          <ChevronLeft
            size={16}
          />
        </span>
        <span className="ml-4 inline-block">{FilterItemWrapperBackButtonLabel}</span>
      </button>

      <div className="h-[calc(100%-92px)] overflow-y-auto pb-44 xl:h-auto xl:pb-0">
        {children}
      </div>
      <div className="absolute bottom-0 left-0 w-full bg-white px-5 py-8 xl:hidden">
        <Button
          onClick={() => handleCloseAllPanel()}
          className="mb-4 w-full"
          size="lg"
        >
          {t('filter.controls.show', { count: count > 90 ? `+${count}` : count })}
        </Button>
        <Button
          onClick={handleResetFilter}
          className="mb-4 w-full"
          size="lg"
          variant="outline"
          disabled={filterTags.length === 0}
        >
          {t('filter.controls.clear')}
        </Button>
      </div>
    </div>
  )
}
