import { CircleCheck, CircleX } from 'lucide-react'
import { cn } from '@/lib/utils'
interface BadgeProps {
  label: string
  color?: string
  fontColor?: string
  uppercase?: boolean
  className?: string
  displayPicto?: boolean
}

export const Badge = ({
  label,
  color = 'black',
  fontColor = 'white',
  uppercase = false,
  className,
  displayPicto = false,
}: BadgeProps) => {
  const isAccepted = !color.includes('rejected')
  return (
    <span
      className={cn(
        `max-w-full overflow-hidden flex w-fit items-center rounded-3xl px-2.5 py-1 text-[0.72rem] whitespace-nowrap font-medium tracking-[0.4px] ${uppercase ? ' uppercase' : ''}`,
        className,
      )}
      style={{ backgroundColor: color, color: fontColor }}
    >
      {displayPicto && (
        <span className="mr-1 block">
          { isAccepted ? (<CircleCheck fill="white" color={color} size={12} />) : (<CircleX fill="white" color={color} size={12} />)}
        </span>
      )}
      <span className="overflow-hidden">
        {label}
      </span>
    </span>
  )
}
