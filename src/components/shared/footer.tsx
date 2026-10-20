import { BellRing, ShieldCheck, Sparkles } from 'lucide-react'
import { Container } from './container'
import { NewsletterForm } from './newsletter-form'
import { useFullScreenMobile } from '@/hooks/useFullScreenMobile'
import { cn } from '@/utils/shadcn.helper'
import { FaFacebookF, FaInstagram, FaLinkedinIn, FaXTwitter, FaYoutube } from 'react-icons/fa6'


const HIGHLIGHTS = [
  {
    icon: ShieldCheck,
    title: 'Segurança da carteira',
    description: 'Proteja seus ativos e acompanhe cada compra digital verificada pela Kurio.',
  },
  {
    icon: Sparkles,
    title: 'Pioneiros na cunhagem',
    description: 'Coleções únicas, edições limitadas e criadores que moldam a cultura digital.',
  },
  {
    icon: BellRing,
    title: 'Alertas de lançamentos',
    description: 'Receba avisos de novas cunhagens, mudanças de preço e edições esgotando.',
  },
]

const LINK_GROUPS = [
  { title: 'Meu perfil', links: ['Meu perfil', 'Meus pedidos', 'Favoritos', 'Carteiras', 'Lista de desejos'] },
  {
    title: 'Central de ajuda',
    links: ['Central de ajuda', 'Como comprar NFTs', 'Contato e suporte', 'Políticas do mercado', 'Perguntas frequentes'],
  },
  { title: 'Coleções', links: ['Arte digital', 'Fotografia', 'Música', 'Arte 3D', 'Colecionáveis'] },
]

const SOCIALS = [
  { name: 'Facebook', href: 'https://facebook.com', icon: FaFacebookF },
  { name: 'Instagram', href: 'https://instagram.com', icon: FaInstagram },
  { name: 'X', href: 'https://x.com', icon: FaXTwitter },
  { name: 'LinkedIn', href: 'https://linkedin.com', icon: FaLinkedinIn },
  { name: 'YouTube', href: 'https://youtube.com', icon: FaYoutube },
]


const WALLETS = ['METAMASK', 'WALLETCONNECT', 'COINBASE']

export function Footer() {
  const fullScreenMobile = useFullScreenMobile()

  return (
    <footer className={cn('mt-24', fullScreenMobile && 'hidden md:block')}>
      <Container>
        <div className="bg-surface-card">
          <div className="grid gap-10 px-6 py-10 md:grid-cols-2 xl:grid-cols-4 xl:gap-0">
            {HIGHLIGHTS.map(({ icon: Icon, title, description }) => (
              <div key={title} className="flex flex-col gap-3 xl:px-4">
                <span className="flex size-12 items-center justify-center rounded-full bg-primary text-primary-foreground">
                  <Icon aria-hidden className="size-5" />
                </span>
                <h2 className="text-base leading-5 font-bold">{title}</h2>
                <p className="text-xs leading-[18px] text-text-secondary">{description}</p>
              </div>
            ))}
            <NewsletterForm />
          </div>

          <div className="grid gap-4 bg-surface-dark p-8 md:grid-cols-2 xl:grid-cols-4 xl:items-center">
            <p className="text-sm font-bold tracking-[0.1em]">KURIO</p>
            <p className="text-sm leading-[22px] text-text-secondary">
              Feito para colecionadores, criadores e artistas.
            </p>
            <a href="mailto:contato@kurio.com" className="text-sm text-text-secondary hover:text-text-accent">
              contato@kurio.com
            </a>
            <a href="tel:+551140000000" className="text-sm text-text-secondary hover:text-text-accent">
              +55 11 4000 0000
            </a>
          </div>

          <div className="grid grid-cols-2 gap-x-6 gap-y-10 px-6 py-10 xl:grid-cols-4 xl:gap-x-[124px] xl:px-8">
            {LINK_GROUPS.map((group) => (
              <div key={group.title} className="flex flex-col gap-3">
                <h2 className="text-lg leading-4 font-bold">{group.title}</h2>
                <ul>
                  {group.links.map((link) => (
                    <li key={link} className="text-sm leading-[30px] text-text-secondary">
                      {link}
                    </li>
                  ))}
                </ul>
              </div>
            ))}

            <div className="flex flex-col gap-6">
              <div className="flex flex-col gap-3">
                <h2 className="text-lg leading-4 font-bold">Redes sociais</h2>
                <ul className="flex gap-2">
                  {SOCIALS.map(({ name, href, icon: Icon }) => (
                    <li key={name}>
                      <a
                        href={href}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={`${name} (abre em nova aba)`}
                        className="flex size-7 items-center justify-center rounded-sm border border-primary text-primary transition-colors hover:bg-surface-dark"
                      >
                        <Icon aria-hidden className="size-3.5" />
                      </a>
                    </li>
                  ))}

                </ul>
              </div>
              <div className="flex flex-col gap-3">
                <h2 className="text-lg leading-4 font-bold">Carteiras compatíveis</h2>
                <ul className="flex flex-wrap gap-1">
                  {WALLETS.map((wallet) => (
                    <li
                      key={wallet}
                      className="rounded-full bg-surface-dark px-2 py-1 text-tiny font-bold tracking-[0.1px] text-text-accent"
                    >
                      {wallet}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </Container>
      <p className="py-6 text-center text-xs text-text-secondary">
        © {new Date().getFullYear()} Kurio. Propriedade digital para todos.
      </p>
    </footer>
  )
}
