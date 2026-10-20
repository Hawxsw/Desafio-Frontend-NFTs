import { useId, useState, type FormEvent } from 'react'
import { EnsSuffixSelect, FormField, SelectControl } from '@/components/shared/form-field'
import { CONTROL_CLASS, fieldA11y } from '@/utils/form.helper'
import { NETWORK_LABELS } from '@/constants/catalog'
import { WALLET_PROVIDER_LABELS } from '@/constants/wallet'
import { useUpdateProfileMutation } from '@/hooks/useAuth'
import { useSaveWalletMutation } from '@/hooks/useWallets'
import type { Network } from '@/types/common'
import type { User } from '@/types/user'
import type { Wallet, WalletProvider } from '@/types/wallet'
import { getErrorMessage, getFieldErrors } from '@/utils/api-error.helper'
import { stripEnsSuffix, withEnsSuffix } from '@/utils/ens.helper'
import { draftNetworks, NETWORK_OPTIONS, PROVIDER_OPTIONS, toWalletDraft, type WalletDraft } from './wallet-fields'

interface PrimaryWalletFormProps {
  user: User
  wallet?: Wallet
}

export function PrimaryWalletForm({ user, wallet }: PrimaryWalletFormProps) {
  const id = useId()
  const fieldId = (name: string) => `${id}-${name}`
  const updateProfile = useUpdateProfileMutation()
  const saveWallet = useSaveWalletMutation()

  const [profile, setProfile] = useState({
    name: user.name,
    username: user.username,
    email: user.email,
    referralCode: user.referralCode ?? '',
    ensName: stripEnsSuffix(user.ensName),
  })
  const [draft, setDraft] = useState<WalletDraft>(() => toWalletDraft(wallet))
  const [saved, setSaved] = useState(false)

  const pending = updateProfile.isPending || saveWallet.isPending
  const errors = { ...getFieldErrors(updateProfile.error), ...getFieldErrors(saveWallet.error) }
  const failed = [updateProfile, saveWallet].find(
    (mutation) => mutation.isError && Object.keys(getFieldErrors(mutation.error)).length === 0,
  )

  function updateDraft(patch: Partial<WalletDraft>) {
    setDraft((current) => ({ ...current, ...patch }))
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!event.currentTarget.reportValidity()) return
    setSaved(false)
    try {
      await updateProfile.mutateAsync({
        name: profile.name,
        username: profile.username,
        email: profile.email,
        ensName: withEnsSuffix(profile.ensName),
        referralCode: profile.referralCode,
      })
      await saveWallet.mutateAsync({
        id: wallet?.id,
        input: {
          kind: 'primary',
          provider: draft.provider as WalletProvider,
          label: draft.label,
          address: draft.address,
          ensName: draft.ensName,
          networks: draftNetworks(draft, wallet),
        },
      })
      setSaved(true)
    } catch {
      setSaved(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      <div className="grid gap-x-6 gap-y-3 md:grid-cols-2">
        <FormField id={fieldId('name')} label="Nome de exibição" required error={errors.name}>
          <input
            id={fieldId('name')}
            required
            autoComplete="name"
            value={profile.name}
            onChange={(event) => setProfile({ ...profile, name: event.target.value })}
            {...fieldA11y(fieldId('name'), errors.name)}
            className={CONTROL_CLASS}
          />
        </FormField>
        <FormField id={fieldId('label')} label="Apelido da carteira" required error={errors.label}>
          <input
            id={fieldId('label')}
            required
            value={draft.label}
            onChange={(event) => updateDraft({ label: event.target.value })}
            {...fieldA11y(fieldId('label'), errors.label)}
            className={CONTROL_CLASS}
          />
        </FormField>

        <FormField id={fieldId('network')} label="Rede" required error={errors.networks}>
          <SelectControl
            id={fieldId('network')}
            required
            placeholder="Selecione uma rede"
            value={draft.network}
            onValueChange={(value) => updateDraft({ network: value as Network })}
            {...fieldA11y(fieldId('network'), errors.networks)}
          >
            {NETWORK_OPTIONS.map((network) => (
              <option key={network} value={network}>
                {NETWORK_LABELS[network]}
              </option>
            ))}
          </SelectControl>
        </FormField>
        <FormField id={fieldId('username')} label="Nome do perfil" required error={errors.username}>
          <input
            id={fieldId('username')}
            required
            autoComplete="username"
            value={profile.username}
            onChange={(event) => setProfile({ ...profile, username: event.target.value })}
            {...fieldA11y(fieldId('username'), errors.username)}
            className={CONTROL_CLASS}
          />
        </FormField>

        <FormField id={fieldId('address')} label="Endereço da carteira" required error={errors.address}>
          <input
            id={fieldId('address')}
            required
            spellCheck={false}
            placeholder="Endereço 0x da carteira"
            value={draft.address}
            onChange={(event) => updateDraft({ address: event.target.value })}
            {...fieldA11y(fieldId('address'), errors.address)}
            className={CONTROL_CLASS}
          />
        </FormField>
        <FormField id={fieldId('wallet-ens')} label="ENS ou carteira secundária" hideLabel>
          <input
            id={fieldId('wallet-ens')}
            spellCheck={false}
            placeholder="ENS ou carteira secundária (opcional)"
            value={draft.ensName}
            onChange={(event) => updateDraft({ ensName: event.target.value })}
            className={CONTROL_CLASS}
          />
        </FormField>

        <FormField id={fieldId('provider')} label="Tipo de carteira" required error={errors.provider}>
          <SelectControl
            id={fieldId('provider')}
            required
            placeholder="Selecione uma carteira"
            value={draft.provider}
            onValueChange={(value) => updateDraft({ provider: value as WalletProvider })}
            {...fieldA11y(fieldId('provider'), errors.provider)}
          >
            {PROVIDER_OPTIONS.map((provider) => (
              <option key={provider} value={provider}>
                {WALLET_PROVIDER_LABELS[provider]}
              </option>
            ))}
          </SelectControl>
        </FormField>
        <FormField id={fieldId('referral')} label="Código de indicação" required>
          <input
            id={fieldId('referral')}
            required
            value={profile.referralCode}
            onChange={(event) => setProfile({ ...profile, referralCode: event.target.value })}
            className={CONTROL_CLASS}
          />
        </FormField>

        <FormField id={fieldId('email')} label="E-mail" required error={errors.email}>
          <input
            id={fieldId('email')}
            type="email"
            required
            autoComplete="email"
            value={profile.email}
            onChange={(event) => setProfile({ ...profile, email: event.target.value })}
            {...fieldA11y(fieldId('email'), errors.email)}
            className={CONTROL_CLASS}
          />
        </FormField>
        <FormField id={fieldId('ens')} label="Nome ENS" required>
          <div className="flex gap-2">
            <EnsSuffixSelect id={fieldId('ens-suffix')} />
            <input
              id={fieldId('ens')}
              required
              value={profile.ensName}
              onChange={(event) => setProfile({ ...profile, ensName: event.target.value })}
              className={CONTROL_CLASS}
            />
          </div>
        </FormField>
      </div>

      <div className="flex flex-wrap items-center gap-4">
        <button
          type="submit"
          disabled={pending}
          className="h-10 w-[131px] rounded-[3px] bg-primary text-sm font-bold text-ink disabled:cursor-wait disabled:opacity-70"
        >
          {pending ? 'Salvando...' : 'Salvar carteira'}
        </button>
        {saved && (
          <p role="status" className="text-sm text-text-accent">
            Carteira salva.
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
