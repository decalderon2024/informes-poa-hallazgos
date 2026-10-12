'use client'

import { Slider as SliderPrimitive } from '@base-ui/react/slider'
import { cn } from '@/lib/utils'

type SliderProps = SliderPrimitive.Root.Props<number> & {
  label: string
}

export function Slider({ className, label, ...props }: SliderProps) {
  return (
    <SliderPrimitive.Root
      data-slot="slider"
      className={cn('w-full data-disabled:opacity-50', className)}
      thumbAlignment="edge"
      {...props}
    >
      <SliderPrimitive.Control className="relative flex h-7 w-full touch-none items-center select-none">
        <SliderPrimitive.Track data-slot="slider-track" className="relative h-2 w-full grow rounded-full bg-muted">
          <SliderPrimitive.Indicator data-slot="slider-range" className="h-full rounded-full bg-gradient-to-r from-blue-700 to-teal-500" />
          <SliderPrimitive.Thumb
            data-slot="slider-thumb"
            aria-label={label}
            className="block size-5 shrink-0 rounded-full border-2 border-teal-600 bg-card shadow-sm outline-none ring-offset-background transition-shadow focus-visible:ring-4 focus-visible:ring-teal-500/30 data-dragging:ring-4 data-dragging:ring-teal-500/20"
          />
        </SliderPrimitive.Track>
      </SliderPrimitive.Control>
    </SliderPrimitive.Root>
  )
}
