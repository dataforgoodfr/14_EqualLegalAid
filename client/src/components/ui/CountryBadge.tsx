import { cn } from '@/lib/utils'
import { CircleFlag } from 'react-circle-flags'
interface BadgeProps {
  label: string
  color?: string
  countryOfOrigin: string
  fontColor?: string
  className?: string
}
const MAPPED_COUNTRY: Record<string, string> = {
  'DR of Congo': 'cd',
  'China': 'cn',
  'Afghanistan': 'af',
  'Eritrea': 'er',
  'Ivory Cost': 'ci',
  'Algeria': 'dz',
  'Burkina Faso': 'bf',
  'Cameroon': 'cm',
  'Ethiopia': 'et',
  'Gambia': 'gm',
  'Ghana': 'gh',
  'Haiti': 'ht',
  'Iran': 'ir',
  'Iraq': 'iq',
  'Mali': 'ml',
  'Morocco': 'ma',
  'Pakistan': 'pk',
  'Sierra Leone': 'sl',
  'Somalia': 'so',
  'Stateless': '',
  'Kuwait': 'kw',
  'Sudan': 'sd',
  'Syria': 'sy',
  'Uganda': 'ug',
}

export const CountryBadge = ({
  label,
  countryOfOrigin,
  color = '#F5F5F5',
  fontColor = '#111113',
  className,
}: BadgeProps) => {
  const countryOfOriginArray = countryOfOrigin.split(', ')
  const splittedLabel = label.split(', ')

  return (
    <span
      className={cn(
        'max-w-full overflow-hidden flex w-fit items-center rounded-3xl px-2.5 py-1 text-[0.72rem] whitespace-nowrap font-medium tracking-[0.4px] ',
        className,
      )}
      style={{ backgroundColor: color, color: fontColor }}
    >
      {countryOfOriginArray.map((country, index) => {
        const countryCode = MAPPED_COUNTRY[country]
        return (
          <span className="flex overflow-hidden not-last:mr-2" key={index}>
            <span className="mr-2 inline-block">
              <CircleFlag countryCode={countryCode} width={14} height={14} />
            </span>
            {splittedLabel[index]}
          </span>
        )
      })}

    </span>
  )
}
