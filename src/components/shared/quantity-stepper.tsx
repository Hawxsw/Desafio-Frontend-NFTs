import { Minus, Plus } from 'lucide-react'
import { cn } from '@/utils/shadcn.helper'

interface QuantityStepperProps {
  value: number
  max: number
  onChange: (value: number) => void
  disabled?: boolean
  size?: 'default' | 'lg' | 'xl' | 'circle'
  className?: string
}

const BUTTON_CLASS =
  'relative flex items-center justify-center bg-primary after:absolute after:-inset-2 disabled:cursor-not-allowed disabled:opacity-40'

const SIZE_CLASSES = {
  default: {
    group: 'gap-2.5',
    button: 'size-[18px] rounded-full text-ink',
    icon: 'size-3',
    iconStroke: 3,
    value: 'min-w-4 text-sm font-bold',
  },
  lg: {
    group: 'gap-3',
    button:
      'h-[30px] w-5 rounded-[20px] border border-ink text-black shadow-[0_4px_12px_-2px_rgba(20,13,10,0.149)]',
    icon: 'size-4',
    iconStroke: 2,
    value: 'min-w-[11px] text-lg leading-[25px] font-medium',
  },
  xl: {
    group: 'gap-3',
    button:
      'h-[49.5px] w-[33px] rounded-[33px] border border-ink text-black shadow-[0_6.6px_19.8px_-3.3px_rgba(20,13,10,0.149)]',
    icon: 'size-[26.4px]',
    iconStroke: 2,
    value: 'min-w-[13px] text-xl leading-7',
  },
  circle: {
    group: 'gap-3',
    button: 'size-6 rounded-full border border-surface-border bg-surface-raised text-text-primary',
    icon: 'size-3.5',
    iconStroke: 2,
    value: 'min-w-2.5 text-lg leading-[22px]',
  },
}

export function QuantityStepper({
  value,
  max,
  onChange,
  disabled = false,
  size = 'default',
  className,
}: QuantityStepperProps) {
  const sizeClasses = SIZE_CLASSES[size]

  return (
    <div role="group" aria-label="Quantidade" className={cn('flex items-center', sizeClasses.group, className)}>
      <button
        type="button"
        aria-label="Diminuir quantidade"
        disabled={disabled || value <= 1}
        onClick={() => onChange(value - 1)}
        className={cn(BUTTON_CLASS, sizeClasses.button)}
      >
        <Minus strokeWidth={sizeClasses.iconStroke} className={sizeClasses.icon} />
      </button>
      <output aria-live="polite" className={cn('text-center', sizeClasses.value)}>
        {value}
      </output>
      <button
        type="button"
        aria-label="Aumentar quantidade"
        disabled={disabled || value >= max}
        onClick={() => onChange(value + 1)}
        className={cn(BUTTON_CLASS, sizeClasses.button)}
      >
        <Plus strokeWidth={sizeClasses.iconStroke} className={sizeClasses.icon} />
      </button>
    </div>
  )
}
