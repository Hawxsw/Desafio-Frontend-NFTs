import { Button } from '@/components/shadcn/ui/button'
import { getErrorMessage } from '@/utils/api-error.helper'

export function AccountLoading() {
  return (
    <p aria-busy="true" className="text-sm text-text-secondary">
      Carregando...
    </p>
  )
}

interface AccountLoadErrorProps {
  error: unknown
  onRetry: () => void
}

export function AccountLoadError({ error, onRetry }: AccountLoadErrorProps) {
  return (
    <div role="alert" className="flex flex-col items-start gap-4">
      <p className="text-sm leading-6 text-text-secondary">{getErrorMessage(error)}</p>
      <Button type="button" onClick={onRetry} className="h-10 rounded-md px-4 text-base font-bold">
        Tentar novamente
      </Button>
    </div>
  )
}
