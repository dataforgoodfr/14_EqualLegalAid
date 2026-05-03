import { Info } from 'lucide-react'
import { Popover as PopoverPrimitive } from 'radix-ui'

export function IndicatorInfoButton({ text }: { text?: string }) {
  if (!text) return null
  return (
    <PopoverPrimitive.Root>
      <PopoverPrimitive.Trigger asChild>
        <button className="text-gray-400 hover:text-gray-600 transition-colors flex-shrink-0" aria-label="More information">
          <Info size={16} />
        </button>
      </PopoverPrimitive.Trigger>
      <PopoverPrimitive.Portal>
        <PopoverPrimitive.Content
          sideOffset={8}
          className="z-50 max-w-sm rounded-lg border border-gray-200 bg-white p-4 shadow-lg text-sm text-gray-700 leading-relaxed"
        >
          {text}
          <PopoverPrimitive.Arrow className="fill-white stroke-gray-200" />
        </PopoverPrimitive.Content>
      </PopoverPrimitive.Portal>
    </PopoverPrimitive.Root>
  )
}
