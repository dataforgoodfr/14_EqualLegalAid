import { cn } from '@/lib/utils'
interface CardInfoProps {
  label: string
  value: string
  className?: string
}

export const CardInfo = ({
  label,
  value,
  className,
}: CardInfoProps) => (
  <p
    className={cn('text-sm font-medium text-black leading-none', className)}
  >
    <span className="mr-2 inline-block font-normal tracking-[0.6px] text-gray-600">
      { label }
    </span>
    <span className="text-[0.88rem] font-semibold">
      {value}
    </span>
  </p>
)
