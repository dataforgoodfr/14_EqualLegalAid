import './ColoredText.scss'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'
import type { ReactNode } from 'react'

const coloredTextVariants = cva('colored-text font-bold text-2xl lg:text-[2.687rem]', {
  variants: {
    variant: {
      default: 'text-black',
      ghost: 'text-white',
    },
  },
})

type ColoredTextProps = VariantProps<typeof coloredTextVariants> & {
  children: ReactNode
  upper: boolean
}

export const ColoredText = ({ variant = 'default', children, upper = false }: ColoredTextProps) => {
  return (
    <h2 className={cn(coloredTextVariants({ variant }), upper && 'uppercase')}>
      {children}
    </h2>
  )
}
