import { cn } from '@/lib/utils'

interface HighlightTitleProps {
  title: string
  className?: string
}

export const HighlightTitle = ({ className, title }: HighlightTitleProps) => {
  return (
    <div className={cn('my-4 flex flex-col items-center xl:my-8', className)}>
      <p className="font-gotham text-logo text-center text-[25px] font-extrabold uppercase leading-none tracking-[0.3px]">
        {title}
      </p>
      <span className="mt-3 block h-[7px] w-[50px] bg-[#D15F36]" aria-hidden="true" />
    </div>
  )
}
