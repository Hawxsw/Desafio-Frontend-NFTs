import type { ComponentProps } from 'react'
import { cn } from '@/utils/shadcn.helper'

export function Container({ className, ...props }: ComponentProps<'div'>) {
  return <div className={cn('mx-auto w-full max-w-page px-6 md:px-10 xl:px-0', className)} {...props} />
}
