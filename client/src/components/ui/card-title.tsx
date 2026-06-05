import { cn } from '@/lib/utils'
interface CardTitleProps {
  title: string
  subtitle?: string
  className?: string
}

export const CardTitle = ({ title, subtitle = '', className }: CardTitleProps) => (
  <h3 className={cn(
    'm-0 text-base leading-[1.35] font-semibold text-(--primary-color)',
    className,
  )}
  >
    {title}
    {subtitle.length && (
      <span className="block">{subtitle}</span>
    )}
  </h3>
)
