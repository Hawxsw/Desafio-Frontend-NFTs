import { useId, useState, type FormEvent } from 'react'
import { FormField, SelectControl } from '@/components/shared/form-field'
import { CONTROL_CLASS, fieldA11y } from '@/utils/form.helper'
import { NETWORK_LABELS } from '@/constants/catalog'
import { WALLET_PROVIDER_LABELS } from '@/constants/wallet'
import { useSaveWalletMutation } from '@/hooks/useWallets'
import type { Network } from '@/types/common'
import type { Wallet, WalletProvider } from '@/types/wallet'
import { getErrorMessage, getFieldErrors } from '@/utils/api-error.helper'
import {
  draftNetworks,
  NETWORK_OPTIONS,
  PROVIDER_OPTIONS,
  shortAddress,
  toWalletDraft,
  type WalletDraft,
} from './wallet-fields'

interface SecondaryWalletSectionProps {
  primary?: Wallet
  secondary?: Wallet
}

export function SecondaryWalletSection({ primary, secondary }: SecondaryWalletSectionProps) {
  const id = useId()
  const fieldId = (name: string) => `${id}-${name}`
  const saveWallet = useSaveWalletMutation()
  const [editing, setEditing] = useState(false)
  const [sameAsPrimary, setSameAsPrimary] = useState(false)
  const [draft, setDraft] = useState<WalletDraft>(() => toWalletDraft(secondary))

  const errors = getFieldErrors(saveWallet.error)
  const formError = saveWallet.isError && Object.keys(errors).length === 0 ? getErrorMessage(saveWallet.error) : null

  function updateDraft(patch: Partial<WalletDraft>) {
    setDraft((current) => ({ ...current, ...patch }))
  }

  function handleSameAsPrimary(checked: boolean) {
    setSameAsPrimary(checked)
    if (checked && primary) {
      const copy = toWalletDraft(primary)
      setDraft({ ...copy, label: draft.label || `${primary.label} (secundária)` })
      setEditing(true)
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!event.currentTarget.reportValidity()) return
    saveWallet.mutate(
      {
        id: secondary?.id,
        input: {
          kind: 'secondary',
          provider: draft.provider as WalletProvider,
          label: draft.label,
          address: draft.address,
          ensName: draft.ensName,
          networks: draftNetworks(draft, secondary),
        },
      },
      { onSuccess: () => setEditing(false) },
    )
  }

  return (
    <section aria-labelledby={fieldId('title')} className="flex flex-col gap-3">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex flex-col gap-1.5">
          <h2 id={fieldId('title')} className="text-[17px] leading-4 font-bold">
            Carteira secundária
          </h2>
          {secondary ? (
            <p className="text-sm leading-[15px] text-text-secondary">
              {secondary.label} · {shortAddress(secondary.address)} · {WALLET_PROVIDER_LABELS[secondary.provider]} · Rede{' '}
              {secondary.networks.map((network) => NETWORK_LABELS[network]).join(', ')}
            </p>
          ) : (
            <p className="text-sm leading-[15px] text-text-secondary">Você ainda não adicionou uma carteira secundária.</p>
          )}
        </div>
        <div className="flex items-center gap-4">
          {primary && (
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={sameAsPrimary}
                onChange={(event) => handleSameAsPrimary(event.target.checked)}
                className="size-[15px] appearance-none rounded-full border-2 border-primary checked:bg-primary checked:shadow-[inset_0_0_0_2px_var(--color-ink)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
              />
              Igual à carteira principal
            </label>
          )}
          <button
            type="button"
            aria-expanded={editing}
            onClick={() => setEditing((value) => !value)}
            className="text-lg leading-4 font-medium text-text-accent hover:underline"
          >
            {editing ? 'Cancelar' : secondary ? 'Editar' : 'Adicionar'}
          </button>
        </div>
      </div>

      {editing && (
        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          <div className="grid gap-x-6 gap-y-3 md:grid-cols-2">
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
              >
                {NETWORK_OPTIONS.map((network) => (
                  <option key={network} value={network}>
                    {NETWORK_LABELS[network]}
                  </option>
                ))}
              </SelectControl>
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
            <FormField id={fieldId('provider')} label="Tipo de carteira" required error={errors.provider}>
              <SelectControl
                id={fieldId('provider')}
                required
                placeholder="Selecione uma carteira"
                value={draft.provider}
                onValueChange={(value) => updateDraft({ provider: value as WalletProvider })}
              >
                {PROVIDER_OPTIONS.map((provider) => (
                  <option key={provider} value={provider}>
                    {WALLET_PROVIDER_LABELS[provider]}
                  </option>
                ))}
              </SelectControl>
            </FormField>
          </div>
          <div className="flex flex-wrap items-center gap-4">
            <button
              type="submit"
              disabled={saveWallet.isPending}
              className="h-10 w-[131px] rounded-[3px] bg-primary text-sm font-bold text-ink disabled:cursor-wait disabled:opacity-70"
            >
              {saveWallet.isPending ? 'Salvando...' : 'Salvar carteira'}
            </button>
            {formError && (
              <p role="alert" className="text-sm text-destructive">
                {formError}
              </p>
            )}
          </div>
        </form>
      )}
    </section>
  )
}
