import { useId, useState, type FormEvent } from 'react'
import { PasswordInput } from '@/components/shared/form-field'
import { CONTROL_CLASS, fieldA11y } from '@/utils/form.helper'
import { useLoginMutation } from '@/hooks/useAuth'
import { getErrorMessage, getFieldErrors } from '@/utils/api-error.helper'
import { cn } from '@/utils/shadcn.helper'
import { AUTH_INPUT_CLASS, AUTH_SUBMIT_CLASS, SocialSignIn } from './auth-controls'

interface SignInFormProps {
  onSuccess: () => void
}

export function SignInForm({ onSuccess }: SignInFormProps) {
  const id = useId()
  const login = useLoginMutation()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const fieldErrors = getFieldErrors(login.error)
  const formError = login.isError && Object.keys(fieldErrors).length === 0 ? getErrorMessage(login.error) : null

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    login.mutate({ email, password }, { onSuccess })
  }

  return (
    <div className="flex flex-col">
      <form noValidate onSubmit={handleSubmit} className="flex flex-col gap-3 lg:px-20 lg:pt-6">
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
            {...fieldA11y(`${id}-email`, fieldErrors.email)}
            className={cn(CONTROL_CLASS, AUTH_INPUT_CLASS)}
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
          <PasswordInput
            id={`${id}-password`}
            autoComplete="current-password"
            placeholder="Senha"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            {...fieldA11y(`${id}-password`, fieldErrors.password)}
            className={AUTH_INPUT_CLASS}
          />
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

        <button type="submit" disabled={login.isPending} className={cn('mt-6', AUTH_SUBMIT_CLASS)}>
          {login.isPending ? 'Entrando...' : 'Entrar'}
        </button>
      </form>

      <SocialSignIn />
    </div>
  )
}
