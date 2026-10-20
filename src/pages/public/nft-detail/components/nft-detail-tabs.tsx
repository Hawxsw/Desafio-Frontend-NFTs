import { useId, useState, type KeyboardEvent } from 'react'
import { CATEGORY_LABELS, NETWORK_LABELS } from '@/constants/catalog'
import type { Nft } from '@/types/nft'
import { cn } from '@/utils/shadcn.helper'

type DetailTab = 'details' | 'reviews'

const ROYALTY_PERCENT = 5

function shortAddress(address: string) {
  return `${address.slice(0, 6)}...${address.slice(-4).toUpperCase()}`
}

interface NftDetailTabsProps {
  nft: Nft
}

export function NftDetailTabs({ nft }: NftDetailTabsProps) {
  const [active, setActive] = useState<DetailTab>('details')
  const baseId = useId()
  const network = NETWORK_LABELS[nft.network]
  const tabs: { value: DetailTab; label: string }[] = [
    { value: 'details', label: 'Detalhes do NFT' },
    { value: 'reviews', label: `Avaliações de colecionadores (${nft.reviewCount})` },
  ]

  function handleKeyDown(event: KeyboardEvent<HTMLButtonElement>) {
    if (event.key !== 'ArrowRight' && event.key !== 'ArrowLeft') return
    const next: DetailTab = active === 'details' ? 'reviews' : 'details'
    setActive(next)
    document.getElementById(`${baseId}-${next}-tab`)?.focus()
  }

  return (
    <section className="hidden flex-col gap-3 lg:flex">
      <div role="tablist" aria-label="Informações do NFT" className="flex gap-8 border-b-[0.3px] border-primary">
        {tabs.map((tab) => {
          const selected = tab.value === active
          return (
            <button
              key={tab.value}
              id={`${baseId}-${tab.value}-tab`}
              type="button"
              role="tab"
              aria-selected={selected}
              aria-controls={`${baseId}-${tab.value}-panel`}
              tabIndex={selected ? 0 : -1}
              onClick={() => setActive(tab.value)}
              onKeyDown={handleKeyDown}
              className={cn(
                'border-b-[3px] pb-3 text-[17px] leading-4 transition-colors',
                selected
                  ? 'border-primary font-bold text-text-accent'
                  : 'border-transparent text-text-primary hover:text-text-accent',
              )}
            >
              {tab.label}
            </button>
          )
        })}
      </div>

      <div
        role="tabpanel"
        id={`${baseId}-${active}-panel`}
        aria-labelledby={`${baseId}-${active}-tab`}
        className="flex flex-col gap-3 text-sm leading-6 text-text-secondary"
      >
        {active === 'details' ? (
          <>
            <div className="flex flex-col gap-6">
              <p>
                {nft.name} é uma obra digital finalizada à mão da coleção {CATEGORY_LABELS[nft.category]}. Cada
                atributo fica armazenado nos metadados do token e verificado na {network}. A obra explora identidade,
                movimento e luz em um mundo digital sem fronteiras.
              </p>
              <p>
                A propriedade inclui a arte em alta resolução, lançamentos exclusivos para colecionadores e um
                registro permanente de procedência na rede. {nft.creator} recebe {ROYALTY_PERCENT}% de direitos
                autorais nas vendas secundárias, apoiando novos trabalhos e lançamentos da comunidade.
              </p>
            </div>
            <div>
              <h3 className="font-bold text-text-primary">Rede:</h3>
              <p>Cunhado na {network} com procedência imutável e metadados armazenados no IPFS.</p>
            </div>
            <div>
              <h3 className="font-bold text-text-primary">Direitos autorais:</h3>
              <p>
                Direitos autorais do criador: {ROYALTY_PERCENT}% nas vendas secundárias, pagos automaticamente pelos
                mercados compatíveis.
              </p>
            </div>
            <div>
              <h3 className="font-bold text-text-primary">Contrato:</h3>
              <p>{shortAddress(nft.contractAddress)} • Contrato inteligente ERC-721 verificado.</p>
            </div>
          </>
        ) : (
          <p>
            Nota média {nft.rating.toFixed(1)} de 5, com {nft.reviewCount} avaliações de colecionadores.
          </p>
        )}
      </div>
    </section>
  )
}
