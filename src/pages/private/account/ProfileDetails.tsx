import { Image } from 'lucide-react'
import { useId, useState, type FormEvent } from 'react'
import { EnsSuffixSelect, FormField, PasswordInput } from '@/components/shared/form-field'
import { CONTROL_CLASS, fieldA11y } from '@/utils/form.helper'
import { useChangePasswordMutation, useSessionQuery, useUpdateProfileMutation } from '@/hooks/useAuth'
import { useSaveWalletMutation, useWalletsQuery } from '@/hooks/useWallets'
import type { User } from '@/types/user'
import type { Wallet } from '@/types/wallet'
import { getErrorMessage, getFieldErrors } from '@/utils/api-error.helper'
import { MIN_PASSWORD_LENGTH } from '@/utils/validation.helper'
import { stripEnsSuffix, withEnsSuffix } from '@/utils/ens.helper'
import { AccountLoadError, AccountLoading } from './components/account-status'

export function ProfileDetails() {
  const session = useSessionQuery()
  const wallets = useWalletsQuery()

  if (session.isPending || wallets.isPending) return <AccountLoading />
  if (session.isError || wallets.isError || !session.data) {
    return (
      <AccountLoadError
        error={session.error ?? wallets.error}
        onRetry={() => Promise.all([session.refetch(), wallets.refetch()])}
      />
    )
  }

  const primaryWallet = wallets.data.find((wallet) => wallet.kind === 'primary')
  return <ProfileForm user={session.data} primaryWallet={primaryWallet} />
}

interface ProfileFormProps {
  user: User
  primaryWallet?: Wallet
}

function ProfileForm({ user, primaryWallet }: ProfileFormProps) {
  const id = useId()
  const fieldId = (name: string) => `${id}-${name}`
  const updateProfile = useUpdateProfileMutation()
  const changePassword = useChangePasswordMutation()
  const saveWallet = useSaveWalletMutation()

  const [name, setName] = useState(user.name)
  const [username, setUsername] = useState(user.username)
  const [email, setEmail] = useState(user.email)
  const [ensName, setEnsName] = useState(stripEnsSuffix(user.ensName))
  const [walletLabel, setWalletLabel] = useState(primaryWallet?.label ?? '')
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmation, setConfirmation] = useState('')
  const [localErrors, setLocalErrors] = useState<Record<string, string>>({})
  const [saved, setSaved] = useState(false)

  const pending = updateProfile.isPending || changePassword.isPending || saveWallet.isPending
  const errors = {
    ...getFieldErrors(updateProfile.error),
    ...getFieldErrors(changePassword.error),
    ...getFieldErrors(saveWallet.error),
    ...localErrors,
  }
  const failed = [updateProfile, changePassword, saveWallet].find(
    (mutation) => mutation.isError && Object.keys(getFieldErrors(mutation.error)).length === 0,
  )

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSaved(false)
    const wantsPasswordChange = Boolean(currentPassword || newPassword || confirmation)
    const nextErrors: Record<string, string> = {}
    if (wantsPasswordChange && newPassword !== confirmation) nextErrors.confirmation = 'As senhas não conferem.'
    if (primaryWallet && !walletLabel.trim()) nextErrors.walletLabel = 'Informe um apelido para a carteira.'
    setLocalErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) return

    try {
      await updateProfile.mutateAsync({ name, username, email, ensName: withEnsSuffix(ensName), referralCode: user.referralCode })
      if (primaryWallet && walletLabel.trim() !== primaryWallet.label) {
        await saveWallet.mutateAsync({
          id: primaryWallet.id,
          input: {
            kind: primaryWallet.kind,
            provider: primaryWallet.provider,
            label: walletLabel,
            address: primaryWallet.address,
            ensName: primaryWallet.ensName,
            networks: primaryWallet.networks,
          },
        })
      }
      if (wantsPasswordChange) {
        await changePassword.mutateAsync({ currentPassword, newPassword })
        setCurrentPassword('')
        setNewPassword('')
        setConfirmation('')
      }
      setSaved(true)
    } catch {
      setSaved(false)
    }
  }

  return (
    <form noValidate onSubmit={handleSubmit} className="flex flex-col gap-8">
      <h1 className="text-[17px] leading-4 font-bold">Perfil do colecionador</h1>

      <div className="grid gap-6 md:grid-cols-2">
        <FormField id={fieldId('name')} label="Nome de exibição" required error={errors.name}>
          <input
            id={fieldId('name')}
            autoComplete="name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            {...fieldA11y(fieldId('name'), errors.name)}
            className={CONTROL_CLASS}
          />
        </FormField>
        <FormField id={fieldId('username')} label="Nome de usuário" required error={errors.username}>
          <input
            id={fieldId('username')}
            autoComplete="username"
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            {...fieldA11y(fieldId('username'), errors.username)}
            className={CONTROL_CLASS}
          />
        </FormField>

        <FormField id={fieldId('email')} label="E-mail" required error={errors.email}>
          <input
            id={fieldId('email')}
            type="email"
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            {...fieldA11y(fieldId('email'), errors.email)}
            className={CONTROL_CLASS}
          />
        </FormField>
        <FormField id={fieldId('ens')} label="Nome ENS" required>
          <div className="flex gap-2">
            <EnsSuffixSelect id={fieldId('ens-suffix')} />
            <input
              id={fieldId('ens')}
              value={ensName}
              onChange={(event) => setEnsName(event.target.value)}
              className={CONTROL_CLASS}
            />
          </div>
        </FormField>

        <FormField id={fieldId('wallet-label')} label="Apelido da carteira" required error={errors.walletLabel ?? errors.label}>
          <input
            id={fieldId('wallet-label')}
            value={walletLabel}
            disabled={!primaryWallet}
            placeholder={primaryWallet ? undefined : 'Cadastre uma carteira em Carteiras'}
            onChange={(event) => setWalletLabel(event.target.value)}
            {...fieldA11y(fieldId('wallet-label'), errors.walletLabel ?? errors.label)}
            className={`${CONTROL_CLASS} disabled:cursor-not-allowed`}
          />
        </FormField>
        <div className="flex flex-col">
          <span className="flex h-[29px] items-center text-body leading-[15px]">Avatar</span>
          <div className="flex h-10 items-center gap-5">
            <span aria-hidden className="flex size-[50px] items-center justify-center rounded-full bg-surface-raised text-primary">
              <Image className="size-[18px]" strokeWidth={1.5} />
            </span>
            <button
              type="button"
              disabled
              title="Disponível em breve"
              className="h-10 rounded-[3px] bg-primary px-5 text-body font-bold text-ink disabled:cursor-not-allowed disabled:opacity-70"
            >
              Alterar
            </button>
            <button type="button" disabled title="Disponível em breve" className="text-sm disabled:cursor-not-allowed">
              Remover
            </button>
          </div>
        </div>
      </div>

      <fieldset className="flex flex-col gap-6 md:max-w-[calc(50%-12px)]">
        <legend className="mb-6 text-[17px] leading-4 font-bold">Alterar senha</legend>
        <FormField id={fieldId('current-password')} label="Senha atual" error={errors.currentPassword}>
          <PasswordInput
            id={fieldId('current-password')}
            autoComplete="current-password"
            value={currentPassword}
            onChange={(event) => setCurrentPassword(event.target.value)}
            {...fieldA11y(fieldId('current-password'), errors.currentPassword)}
          />
        </FormField>
        <FormField id={fieldId('new-password')} label="Nova senha" error={errors.newPassword}>
          <PasswordInput
            id={fieldId('new-password')}
            autoComplete="new-password"
            minLength={MIN_PASSWORD_LENGTH}
            value={newPassword}
            onChange={(event) => setNewPassword(event.target.value)}
            {...fieldA11y(fieldId('new-password'), errors.newPassword)}
          />
        </FormField>
        <FormField id={fieldId('confirmation')} label="Confirmar nova senha" error={errors.confirmation}>
          <PasswordInput
            id={fieldId('confirmation')}
            autoComplete="new-password"
            value={confirmation}
            onChange={(event) => setConfirmation(event.target.value)}
            {...fieldA11y(fieldId('confirmation'), errors.confirmation)}
          />
        </FormField>
      </fieldset>

      <div className="flex flex-wrap items-center gap-4">
        <button
          type="submit"
          disabled={pending}
          className="h-10 w-[131px] rounded-[3px] bg-primary text-body font-bold text-ink disabled:cursor-wait disabled:opacity-70"
        >
          {pending ? 'Salvando...' : 'Salvar'}
        </button>
        {saved && (
          <p role="status" className="text-sm text-text-accent">
            Perfil atualizado.
          </p>
        )}
        {failed && (
          <p role="alert" className="text-sm text-destructive">
            {getErrorMessage(failed.error)}
          </p>
        )}
      </div>
    </form>
  )
}
