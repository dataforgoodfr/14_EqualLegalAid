import { Info } from 'lucide-react'
import { Popover as PopoverPrimitive } from 'radix-ui'
import ReactMarkdown from 'react-markdown';

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
          collisionPadding={16}
          className="z-50 max-w-sm rounded-lg border border-gray-200 bg-white p-4 shadow-lg text-xs text-gray-700 leading-relaxed max-h-[var(--radix-popover-content-available-height)] overflow-y-auto"
        >
          <div className="whitespace-pre-wrap">
            <ReactMarkdown>{text}</ReactMarkdown>
          </div>
          <PopoverPrimitive.Arrow className="fill-white stroke-gray-200" />
        </PopoverPrimitive.Content>
      </PopoverPrimitive.Portal>
    </PopoverPrimitive.Root>
  )
}
