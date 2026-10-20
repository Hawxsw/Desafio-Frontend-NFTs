import { useId, useState, type FormEvent } from 'react'
import { PasswordInput } from '@/components/shared/form-field'
import { CONTROL_CLASS, fieldA11y } from '@/utils/form.helper'
import { useRegisterMutation } from '@/hooks/useAuth'
import { getErrorMessage, getFieldErrors } from '@/utils/api-error.helper'
import { cn } from '@/utils/shadcn.helper'
import { MIN_PASSWORD_LENGTH } from '@/utils/validation.helper'
import { AUTH_INPUT_CLASS, AUTH_SUBMIT_CLASS, SocialSignIn } from './auth-controls'

interface SignUpFormProps {
  onSuccess: () => void
}

export function SignUpForm({ onSuccess }: SignUpFormProps) {
  const id = useId()
  const register = useRegisterMutation()
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmation, setConfirmation] = useState('')
  const [confirmationError, setConfirmationError] = useState<string>()

  const fieldErrors: Record<string, string> = { ...getFieldErrors(register.error), ...(confirmationError ? { confirmation: confirmationError } : {}) }
  const formError =
    register.isError && Object.keys(getFieldErrors(register.error)).length === 0 ? getErrorMessage(register.error) : null

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (password !== confirmation) {
      setConfirmationError('As senhas não conferem.')
      return
    }
    setConfirmationError(undefined)
    register.mutate({ username, email, password }, { onSuccess })
  }

  const fields = [
    { name: 'username', label: 'Nome de usuário', type: 'text', autoComplete: 'username', value: username, onChange: setUsername },
    { name: 'email', label: 'Digite seu e-mail', type: 'email', autoComplete: 'email', value: email, onChange: setEmail },
  ]

  return (
    <div className="flex flex-col">
      <form noValidate onSubmit={handleSubmit} className="flex flex-col gap-3 lg:px-20 lg:pt-6">
        {fields.map((field) => (
          <div key={field.name} className="flex flex-col gap-1">
            <label htmlFor={`${id}-${field.name}`} className="sr-only">
              {field.label}
            </label>
            <input
              id={`${id}-${field.name}`}
              type={field.type}
              autoComplete={field.autoComplete}
              placeholder={field.label}
              value={field.value}
              onChange={(event) => field.onChange(event.target.value)}
              {...fieldA11y(`${id}-${field.name}`, fieldErrors[field.name])}
              className={cn(CONTROL_CLASS, AUTH_INPUT_CLASS)}
            />
            {fieldErrors[field.name] && (
              <p id={`${id}-${field.name}-error`} className="text-xs leading-4 text-destructive">
                {fieldErrors[field.name]}
              </p>
            )}
          </div>
        ))}

        <div className="flex flex-col gap-1">
          <label htmlFor={`${id}-password`} className="sr-only">
            Senha
          </label>
          <PasswordInput
            id={`${id}-password`}
            autoComplete="new-password"
            placeholder="Senha"
            minLength={MIN_PASSWORD_LENGTH}
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

        <div className="flex flex-col gap-1">
          <label htmlFor={`${id}-confirmation`} className="sr-only">
            Confirmar senha
          </label>
          <PasswordInput
            id={`${id}-confirmation`}
            autoComplete="new-password"
            placeholder="Confirmar senha"
            value={confirmation}
            onChange={(event) => setConfirmation(event.target.value)}
            {...fieldA11y(`${id}-confirmation`, fieldErrors.confirmation)}
            className={AUTH_INPUT_CLASS}
          />
          {fieldErrors.confirmation && (
            <p id={`${id}-confirmation-error`} className="text-xs leading-4 text-destructive">
              {fieldErrors.confirmation}
            </p>
          )}
        </div>

        {formError && (
          <p role="alert" className="text-sm leading-5 text-destructive">
            {formError}
          </p>
        )}

        <button type="submit" disabled={register.isPending} className={cn('mt-6 lg:mt-3', AUTH_SUBMIT_CLASS)}>
          {register.isPending ? 'Criando...' : (
            <>
              <span className="lg:hidden">Criar perfil</span>
              <span className="hidden lg:inline">Criar conta</span>
            </>
          )}
        </button>
      </form>

      <SocialSignIn />
    </div>
  )
}
