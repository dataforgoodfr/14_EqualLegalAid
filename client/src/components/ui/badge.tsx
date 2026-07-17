import { CircleCheck, CircleX } from 'lucide-react'
import { Tooltip as TooltipPrimitive } from 'radix-ui'
import { cn } from '@/lib/utils'

interface BadgeProps {
  label: string
  color?: string
  fontColor?: string
  uppercase?: boolean
  className?: string
  displayPicto?: boolean
  truncate?: boolean
}

export const Badge = ({
  label,
  color = 'black',
  fontColor = 'white',
  uppercase = false,
  className,
  displayPicto = false,
  truncate = false,
}: BadgeProps) => {
  const isAccepted = !color.includes('rejected')

  const badge = (
    <span
      className={cn(
        `overflow-hidden flex w-fit max-w-full items-center rounded-3xl px-2.5 py-1 text-[0.72rem] whitespace-nowrap font-medium tracking-[0.4px] ${uppercase ? ' uppercase' : ''}`,
        className,
      )}
      style={{ backgroundColor: color, color: fontColor }}
    >
      {displayPicto && (
        <span className="mr-1 block shrink-0">
          {isAccepted ? (<CircleCheck fill="white" color={color} size={12} />) : (<CircleX fill="white" color={color} size={12} />)}
        </span>
      )}
      <span className={cn('overflow-hidden', truncate && 'truncate')}>
        {label}
      </span>
    </span>
  )

  if (!truncate) return badge

  return (
    <TooltipPrimitive.Root delayDuration={0}>
      <TooltipPrimitive.Trigger asChild>
        {badge}
      </TooltipPrimitive.Trigger>
      <TooltipPrimitive.Portal>
        <TooltipPrimitive.Content
          sideOffset={5}
          collisionPadding={8}
          className="z-50 max-w-[220px] break-words rounded-lg bg-gray-900 px-3 py-2 text-xs leading-relaxed text-white shadow-lg animate-in fade-in-0 zoom-in-95"
        >
          {label}
          <TooltipPrimitive.Arrow className="fill-gray-900" />
        </TooltipPrimitive.Content>
      </TooltipPrimitive.Portal>
    </TooltipPrimitive.Root>
  )
}
