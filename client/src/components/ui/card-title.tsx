interface CardTitleProps {
  title: string
}

export const CardTitle = ({ title }: CardTitleProps) => (
  <h3 className="m-0 text-base leading-[1.35] font-semibold text-[var(--primary-color)]">
    {title}
  </h3>
)
