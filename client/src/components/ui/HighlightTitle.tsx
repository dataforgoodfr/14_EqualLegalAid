import { cn } from '@/lib/utils'

interface HighlightTitleProps {
  title: string
  className?: string
}

export const HighlightTitle = ({ className, title }: HighlightTitleProps) => {
  const [firstPartTitle, secondPartTitle] = title.split('|')
  return (
    <p className={cn(
      'my-6 text-center text-[24px] font-bold xl:my-16 xl:text-[37px]',
      className,
    )}
    >
      {firstPartTitle}
      {secondPartTitle && secondPartTitle.length && (
        <span className="bg-blue-france ml-1 inline-block px-3.5 text-white xl:px-2.5">
          {secondPartTitle}
        </span>
      )}
    </p>
  )
}
