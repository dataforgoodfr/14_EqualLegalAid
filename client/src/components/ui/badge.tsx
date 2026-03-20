interface BadgeProps {
  label: string
  color?: string
  fontColor?: string
  uppercase?: boolean
}

export const Badge = ({ label, color = 'black', fontColor = 'white', uppercase = false }: BadgeProps) => (
  <span
    className={`rounded-[16px] px-[0.6rem] py-[0.25rem] text-[0.72rem] font-semibold tracking-[0.4px] whitespace-nowrap${uppercase ? ' uppercase' : ''}`}
    style={{ backgroundColor: color, color: fontColor }}
  >
    {label}
  </span>
)
