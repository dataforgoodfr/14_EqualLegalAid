import { cn } from '@/lib/utils'
import type { HTMLAttributes } from 'react'
import './spinner.css'

type SpinnerProps = HTMLAttributes<HTMLSpanElement>

export const Spinner = ({
  className,
  ...props
}: SpinnerProps) => {
  return (
    <span
      className={cn(
        'spinner block w-6 h-6 relative  rounded-[50%] before:text-muted-foreground',
        className,
      )}
      {...props}
    >
    </span>
  )
}
