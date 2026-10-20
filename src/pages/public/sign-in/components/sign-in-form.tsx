import { isAxiosError } from 'axios'
import { Eye, EyeOff } from 'lucide-react'
import { useId, useState, type FormEvent } from 'react'
import { FaFacebook } from 'react-icons/fa6'
import { FcGoogle } from 'react-icons/fc'
import { useLoginMutation } from '@/hooks/useAuth'
import type { ApiError } from '@/types/error'
import { getErrorMessage } from '@/utils/api-error.helper'
import { cn } from '@/utils/shadcn.helper'

const INPUT_CLASS =
  'h-[50px] w-full rounded-lg border border-surface-border bg-transparent px-[18px] text-sm leading-4 placeholder:text-muted-foreground focus-visible:border-primary focus-visible:outline-none aria-invalid:border-destructive lg:h-10 lg:rounded-[5px]'

const SOCIAL_BUTTON_CLASS =
  'flex h-11 w-full items-center justify-center gap-3 rounded-lg border border-surface-border text-[13px] leading-4 font-medium text-text-secondary disabled:cursor-not-allowed lg:h-9 lg:rounded-[5px]'

interface SignInFormProps {
  onSuccess: () => void
}

export function SignInForm({ onSuccess }: SignInFormProps) {
  const id = useId()
  const login = useLoginMutation()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  const fieldErrors =
    isAxiosError<ApiError>(login.error) && login.error.response?.status === 422
      ? (login.error.response.data.fieldErrors ?? {})
      : {}
  const formError = login.isError && Object.keys(fieldErrors).length === 0 ? getErrorMessage(login.error) : null

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    login.mutate({ email, password }, { onSuccess })
  }

  return (
    <div className="flex flex-col">
      <form noValidate onSubmit={handleSubmit} className="flex flex-col gap-3 pt-6 lg:px-20">
        <div className="flex flex-col gap-1">
          <label htmlFor={`${id}-email`} className="sr-only">
            E-mail
          </label>
          <input
            id={`${id}-email`}
            type="email"
            autoComplete="email"
            placeholder="contato@email.com"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            aria-invalid={fieldErrors.email ? true : undefined}
            aria-describedby={fieldErrors.email ? `${id}-email-error` : undefined}
            className={INPUT_CLASS}
          />
          {fieldErrors.email && (
            <p id={`${id}-email-error`} className="text-xs leading-4 text-destructive">
              {fieldErrors.email}
            </p>
          )}
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor={`${id}-password`} className="sr-only">
            Senha
          </label>
          <div className="relative">
            <input
              id={`${id}-password`}
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              placeholder="Senha"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              aria-invalid={fieldErrors.password ? true : undefined}
              aria-describedby={fieldErrors.password ? `${id}-password-error` : undefined}
              className={cn(INPUT_CLASS, 'pr-12')}
            />
            <button
              type="button"
              onClick={() => setShowPassword((value) => !value)}
              aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
              aria-pressed={showPassword}
              className="absolute top-1/2 right-3 flex size-8 -translate-y-1/2 items-center justify-center text-muted-foreground hover:text-text-accent"
            >
              {showPassword ? <EyeOff className="size-[18px]" /> : <Eye className="size-[18px]" />}
            </button>
          </div>
          {fieldErrors.password && (
            <p id={`${id}-password-error`} className="text-xs leading-4 text-destructive">
              {fieldErrors.password}
            </p>
          )}
        </div>

        <button
          type="button"
          disabled
          title="Disponível em breve"
          className="self-end text-sm leading-4 text-text-accent disabled:cursor-not-allowed"
        >
          Esqueceu a senha?
        </button>

        {formError && (
          <p role="alert" className="text-sm leading-5 text-destructive">
            {formError}
          </p>
        )}

        <button
          type="submit"
          disabled={login.isPending}
          className="mt-6 h-14 rounded-lg bg-primary text-lg leading-4 font-bold text-ink disabled:cursor-wait disabled:opacity-70 lg:h-[45px] lg:rounded-[5px]"
        >
          {login.isPending ? 'Entrando...' : 'Entrar'}
        </button>
      </form>

      <div className="mt-6 flex flex-col gap-3 pt-6 lg:border-t lg:border-surface-border lg:px-20">
        <p className="text-center text-[13px] leading-4">Ou continue com</p>
        <button type="button" disabled title="Disponível em breve" className={SOCIAL_BUTTON_CLASS}>
          <FcGoogle aria-hidden className="size-5" />
          Continuar com Google
        </button>
        <button type="button" disabled title="Disponível em breve" className={SOCIAL_BUTTON_CLASS}>
          <FaFacebook aria-hidden className="size-5 text-[#1877F2]" />
          Continuar com Facebook
        </button>
      </div>
    </div>
  )
}
