import { ChevronDown, Eye, EyeOff } from 'lucide-react'
import { useState, type ComponentProps, type ReactNode } from 'react'
import { CONTROL_CLASS } from '@/utils/form.helper'
import { cn } from '@/utils/shadcn.helper'

interface FormFieldProps {
  id: string
  label: string
  required?: boolean
  hideLabel?: boolean
  error?: string
  className?: string
  children: ReactNode
}

export function FormField({ id, label, required = false, hideLabel = false, error, className, children }: FormFieldProps) {
  return (
    <div className={cn('flex flex-col', className)}>
      <label htmlFor={id} className="flex h-[29px] items-center text-body leading-[15px]">
        <span className={cn(hideLabel && 'sr-only')}>{label}</span>
        {required && (
          <span aria-hidden className="text-[22px] leading-[29px] text-text-coral">
            *
          </span>
        )}
      </label>
      {children}
      {error && (
        <p id={`${id}-error`} className="mt-1 text-xs leading-4 text-destructive">
          {error}
        </p>
      )}
    </div>
  )
}

interface SelectControlProps extends Omit<ComponentProps<'select'>, 'onChange'> {
  placeholder: string
  onValueChange: (value: string) => void
}

export function SelectControl({ placeholder, onValueChange, className, children, ...props }: SelectControlProps) {
  return (
    <div className="relative">
      <select
        {...props}
        onChange={(event) => onValueChange(event.target.value)}
        className={cn(CONTROL_CLASS, 'appearance-none pr-10 invalid:text-muted-foreground', className)}
      >
        <option value="" disabled>
          {placeholder}
        </option>
        {children}
      </select>
      <ChevronDown
        aria-hidden
        className="pointer-events-none absolute top-1/2 right-4 size-4 -translate-y-1/2 text-muted-foreground"
      />
    </div>
  )
}

export function PasswordInput({ className, ...props }: Omit<ComponentProps<'input'>, 'type'>) {
  const [visible, setVisible] = useState(false)

  return (
    <div className="relative">
      <input {...props} type={visible ? 'text' : 'password'} className={cn(CONTROL_CLASS, 'pr-12', className)} />
      <button
        type="button"
        onClick={() => setVisible((value) => !value)}
        aria-label={visible ? 'Ocultar senha' : 'Mostrar senha'}
        aria-pressed={visible}
        className="absolute top-1/2 right-3 flex size-8 -translate-y-1/2 items-center justify-center text-muted-foreground hover:text-text-accent"
      >
        {visible ? <EyeOff className="size-[18px]" /> : <Eye className="size-[18px]" />}
      </button>
    </div>
  )
}

export function EnsSuffixSelect({ id }: { id: string }) {
  return (
    <div className="relative w-[78px] shrink-0">
      <select id={id} aria-label="Domínio ENS" className={cn(CONTROL_CLASS, 'appearance-none pr-7 pl-2.5')}>
        <option value=".eth">.eth</option>
      </select>
      <ChevronDown
        aria-hidden
        className="pointer-events-none absolute top-1/2 right-2 size-4 -translate-y-1/2 text-text-primary"
      />
    </div>
  )
}
