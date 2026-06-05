import { cn } from '@/lib/utils'

interface HighlightTitleProps {
  title: string
  className?: string
}

export const HighlightTitle = ({ className, title }: HighlightTitleProps) => {
  return (
    <p className={cn(
      'my-4 text-center text-[20px] font-bold xl:my-8 xl:text-[24px]',
      className,
    )}
    >
      {title}
    </p>
  )
}
