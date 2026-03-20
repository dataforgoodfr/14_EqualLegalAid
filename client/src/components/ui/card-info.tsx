interface CardInfoProps {
  title: string
  info: string
}

export const CardInfo = ({ title, info }: CardInfoProps) => (
  <span className="flex flex-col gap-0.5">
    <span className="text-[0.7rem] font-normal tracking-[0.6px] text-[var(--text-light)] uppercase">{title}</span>
    <span className="text-[0.88rem] font-medium text-[var(--text-secondary)]">{info}</span>
  </span>
)
