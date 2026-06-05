import { cn } from '@/lib/utils'
interface HeaderBurgerButtonProps {
  className?: string
  onClick: () => void
}
export const HeaderBurgerButton = ({ className, onClick }: HeaderBurgerButtonProps) => {
  return (
    <button
      className={cn(
        'w-6 h-6 flex justify-center items-center cursor-pointer',
        className,
      )}
      onClick={onClick}
    >
      <div>
        {[...Array(3)].map((_, index) => (
          <span
            key={index}
            className="bg-logo block h-0.5 w-4.5 not-last:mb-0.75"
          />
        ))}
      </div>
    </button>
  )
}
