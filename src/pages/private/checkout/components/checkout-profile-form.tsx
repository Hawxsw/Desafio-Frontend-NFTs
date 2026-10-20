import { useId } from 'react'
import { EnsSuffixSelect, FormField, SelectControl } from '@/components/shared/form-field'
import { NETWORK_LABELS } from '@/constants/catalog'
import type { Network } from '@/types/common'
import type { Wallet } from '@/types/wallet'
import { CONTROL_CLASS, fieldA11y } from '@/utils/form.helper'
import { cn } from '@/utils/shadcn.helper'
import type { CheckoutErrors, CheckoutFields } from '@/utils/checkout-validation.helper'

interface CheckoutProfileFormProps {
  wallets: Wallet[]
  walletId: string
  onWalletChange: (walletId: string) => void
  network: Network | ''
  onNetworkChange: (network: Network) => void
  fields: CheckoutFields
  onFieldsChange: (fields: CheckoutFields) => void
  errors: CheckoutErrors
}

export function CheckoutProfileForm({
  wallets,
  walletId,
  onWalletChange,
  network,
  onNetworkChange,
  fields,
  onFieldsChange,
  errors,
}: CheckoutProfileFormProps) {
  const id = useId()
  const fieldId = (name: string) => `${id}-${name}`
  const wallet = wallets.find((item) => item.id === walletId)
  const otherWallet = wallets.find((item) => item.id !== walletId)

  function bind(name: keyof CheckoutFields) {
    return {
      id: fieldId(name),
      name,
      value: fields[name],
      onChange: (event: { target: { value: string } }) => onFieldsChange({ ...fields, [name]: event.target.value }),
      ...fieldA11y(fieldId(name), errors[name]),
    }
  }

  return (
    <section aria-labelledby={fieldId('title')} className="hidden min-w-0 flex-1 flex-col gap-3 lg:flex xl:max-w-[763px]">
      <h2 id={fieldId('title')} className="text-[17px] leading-4 font-bold">
        Perfil do colecionador
      </h2>

      <form noValidate onSubmit={(event) => event.preventDefault()} className="flex flex-col gap-6">
        <div className="grid grid-cols-2 gap-x-6 gap-y-3">
          <FormField id={fieldId('name')} label="Nome de exibição" required error={errors.name}>
            <input {...bind('name')} required autoComplete="name" className={CONTROL_CLASS} />
          </FormField>
          <FormField id={fieldId('username')} label="Nome de usuário" required error={errors.username}>
            <input {...bind('username')} required autoComplete="username" className={CONTROL_CLASS} />
          </FormField>

          <FormField id={fieldId('network')} label="Rede" required error={errors.network}>
            <SelectControl
              id={fieldId('network')}
              placeholder="Selecione uma rede"
              required
              value={network}
              onValueChange={(value) => onNetworkChange(value as Network)}
              {...fieldA11y(fieldId('network'), errors.network)}
            >
              {wallet?.networks.map((item) => (
                <option key={item} value={item}>
                  {NETWORK_LABELS[item]}
                </option>
              ))}
            </SelectControl>
          </FormField>
          <FormField id={fieldId('profileName')} label="Nome do perfil" required error={errors.profileName}>
            <input {...bind('profileName')} required className={CONTROL_CLASS} />
          </FormField>

          <FormField id={fieldId('wallet-address')} label="Endereço da carteira" required>
            <input
              id={fieldId('wallet-address')}
              readOnly
              value={wallet?.address ?? ''}
              placeholder="Endereço 0x da carteira"
              className={cn(CONTROL_CLASS, 'truncate')}
            />
          </FormField>
          <FormField id={fieldId('secondaryWallet')} label="ENS ou carteira secundária" hideLabel>
            <input
              {...bind('secondaryWallet')}
              spellCheck={false}
              placeholder="ENS ou carteira secundária (opcional)"
              className={CONTROL_CLASS}
            />
          </FormField>

          <FormField id={fieldId('wallet')} label="Tipo de carteira" required error={errors.wallet}>
            <SelectControl
              id={fieldId('wallet')}
              placeholder="Selecione uma carteira"
              required
              value={walletId}
              onValueChange={onWalletChange}
              {...fieldA11y(fieldId('wallet'), errors.wallet)}
            >
              {wallets.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </SelectControl>
          </FormField>
          <FormField id={fieldId('referralCode')} label="Código de indicação" required error={errors.referralCode}>
            <input {...bind('referralCode')} required className={CONTROL_CLASS} />
          </FormField>

          <FormField id={fieldId('email')} label="E-mail" required error={errors.email}>
            <input {...bind('email')} type="email" required autoComplete="email" className={CONTROL_CLASS} />
          </FormField>
          <FormField id={fieldId('ens')} label="Nome ENS" required>
            <EnsSuffixSelect id={fieldId('ens')} />
          </FormField>
        </div>

        <label className="flex items-center gap-2 text-body leading-none">
          <input
            type="checkbox"
            name="useOtherWallet"
            checked={wallet?.kind === 'secondary'}
            disabled={!otherWallet}
            onChange={() => otherWallet && onWalletChange(otherWallet.id)}
            className="size-[15px] appearance-none rounded-full border-2 border-primary checked:bg-primary checked:shadow-[inset_0_0_0_2px_var(--color-ink)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          />
          Usar outra carteira?
        </label>

        <FormField id={fieldId('note')} label="Observação do colecionador (opcional)">
          <textarea
            {...bind('note')}
            className="h-[150px] w-full max-w-[342px] resize-none rounded-[3px] border border-surface-border bg-transparent p-4 text-sm leading-5 focus-visible:border-primary focus-visible:outline-none"
          />
        </FormField>
      </form>
    </section>
  )
}
