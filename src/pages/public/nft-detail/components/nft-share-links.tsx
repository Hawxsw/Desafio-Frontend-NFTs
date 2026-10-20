import { Mail } from 'lucide-react'
import { FaLinkedinIn, FaXTwitter } from 'react-icons/fa6'

interface NftShareLinksProps {
  name: string
}

const SHARE_LINK_CLASS = 'flex items-center justify-center text-text-primary transition-colors hover:text-text-accent'

export function NftShareLinks({ name }: NftShareLinksProps) {
  const shareUrl = encodeURIComponent(window.location.href)
  const shareText = encodeURIComponent(name)
  const shareLinks = [
    {
      label: 'LinkedIn',
      href: `https://www.linkedin.com/sharing/share-offsite/?url=${shareUrl}`,
      icon: <FaLinkedinIn className="size-[15px]" />,
    },
    {
      label: 'E-mail',
      href: `mailto:?subject=${shareText}&body=${shareUrl}`,
      icon: <Mail className="size-[15px]" />,
    },
    {
      label: 'X',
      href: `https://x.com/intent/post?url=${shareUrl}&text=${shareText}`,
      icon: <FaXTwitter className="size-[15px]" />,
    },
  ]

  return (
    <div className="hidden h-[18px] items-center gap-2 lg:flex">
      <strong className="text-body leading-4">Compartilhar este NFT:</strong>
      <ul className="flex items-center gap-2">
        {shareLinks.map((link) => (
          <li key={link.label} className="flex">
            <a href={link.href} target="_blank" rel="noopener noreferrer" className={SHARE_LINK_CLASS}>
              {link.icon}
              <span className="sr-only">{link.label} (abre em nova aba)</span>
            </a>
          </li>
        ))}
      </ul>
    </div>
  )
}
