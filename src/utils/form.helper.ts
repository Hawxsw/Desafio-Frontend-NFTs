export const CONTROL_CLASS =
  'h-10 w-full rounded-[3px] border border-surface-border bg-transparent px-4 text-sm leading-[15px] placeholder:text-muted-foreground focus-visible:border-primary focus-visible:outline-none read-only:text-muted-foreground aria-invalid:border-destructive'

export function fieldA11y(id: string, error?: string) {
  return error ? { 'aria-invalid': true, 'aria-describedby': `${id}-error` } : {}
}
