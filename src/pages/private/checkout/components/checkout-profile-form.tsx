import { useId, type Ref } from 'react'
import { EnsSuffixSelect, FormField, SelectControl } from '@/components/shared/form-field'
import { CONTROL_CLASS } from '@/utils/form.helper'
import { NETWORK_LABELS } from '@/constants/catalog'
import type { Network } from '@/types/common'
import type { Wallet } from '@/types/wallet'
import { cn } from '@/utils/shadcn.helper'

export interface CheckoutBuyerFields {
  name: string
  email: string
}

interface CheckoutProfileFormProps {
  formRef: Ref<HTMLFormElement>
  wallets: Wallet[]
  walletId: string
  onWalletChange: (walletId: string) => void
  network: Network | ''
  onNetworkChange: (network: Network) => void
  buyer: CheckoutBuyerFields
  onBuyerChange: (buyer: CheckoutBuyerFields) => void
}

export function CheckoutProfileForm({
  formRef,
  wallets,
  walletId,
  onWalletChange,
  network,
  onNetworkChange,
  buyer,
  onBuyerChange,
}: CheckoutProfileFormProps) {
  const id = useId()
  const fieldId = (name: string) => `${id}-${name}`
  const wallet = wallets.find((item) => item.id === walletId)

  return (
    <section aria-labelledby={fieldId('title')} className="hidden min-w-0 flex-1 flex-col gap-3 lg:flex xl:max-w-[763px]">
      <h2 id={fieldId('title')} className="text-[17px] leading-4 font-bold">
        Perfil do colecionador
      </h2>

      <form ref={formRef} onSubmit={(event) => event.preventDefault()} className="flex flex-col gap-6">
        <div className="grid grid-cols-2 gap-x-6 gap-y-3">
          <FormField id={fieldId('display-name')} label="Nome de exibição" required>
            <input
              id={fieldId('display-name')}
              name="displayName"
              required
              autoComplete="name"
              value={buyer.name}
              onChange={(event) => onBuyerChange({ ...buyer, name: event.target.value })}
              className={CONTROL_CLASS}
            />
          </FormField>
          <FormField id={fieldId('username')} label="Nome de usuário" required>
            <input id={fieldId('username')} name="username" required autoComplete="username" className={CONTROL_CLASS} />
          </FormField>

          <FormField id={fieldId('network')} label="Rede" required>
            <SelectControl
              id={fieldId('network')}
              placeholder="Selecione uma rede"
              required
              value={network}
              onValueChange={(value) => onNetworkChange(value as Network)}
            >
              {wallet?.networks.map((item) => (
                <option key={item} value={item}>
                  {NETWORK_LABELS[item]}
                </option>
              ))}
            </SelectControl>
          </FormField>
          <FormField id={fieldId('profile-name')} label="Nome do perfil" required>
            <input id={fieldId('profile-name')} name="profileName" required className={CONTROL_CLASS} />
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
          <FormField id={fieldId('secondary-wallet')} label="ENS ou carteira secundária" hideLabel>
            <input
              id={fieldId('secondary-wallet')}
              name="secondaryWallet"
              spellCheck={false}
              placeholder="ENS ou carteira secundária (opcional)"
              className={CONTROL_CLASS}
            />
          </FormField>

          <FormField id={fieldId('wallet')} label="Tipo de carteira" required>
            <SelectControl
              id={fieldId('wallet')}
              placeholder="Selecione uma carteira"
              required
              value={walletId}
              onValueChange={onWalletChange}
            >
              {wallets.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </SelectControl>
          </FormField>
          <FormField id={fieldId('referral')} label="Código de indicação" required>
            <input id={fieldId('referral')} name="referralCode" required className={CONTROL_CLASS} />
          </FormField>

          <FormField id={fieldId('email')} label="E-mail" required>
            <input
              id={fieldId('email')}
              type="email"
              required
              autoComplete="email"
              value={buyer.email}
              onChange={(event) => onBuyerChange({ ...buyer, email: event.target.value })}
              className={CONTROL_CLASS}
            />
          </FormField>
          <FormField id={fieldId('ens')} label="Nome ENS" required>
            <EnsSuffixSelect id={fieldId('ens')} />
          </FormField>
        </div>

        <label className="flex items-center gap-2 text-body leading-none">
          <input
            type="checkbox"
            name="useOtherWallet"
            className="size-[15px] appearance-none rounded-full border-2 border-primary checked:bg-primary checked:shadow-[inset_0_0_0_2px_var(--color-ink)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          />
          Usar outra carteira?
        </label>

        <FormField id={fieldId('note')} label="Observação do colecionador (opcional)">
          <textarea
            id={fieldId('note')}
            name="note"
            className="h-[150px] w-full max-w-[342px] resize-none rounded-[3px] border border-surface-border bg-transparent p-4 text-sm leading-5 focus-visible:border-primary focus-visible:outline-none"
          />
        </FormField>
      </form>
    </section>
  )
}

