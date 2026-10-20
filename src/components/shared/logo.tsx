import { Link } from '@tanstack/react-router'

export function Logo() {
  return (
    <Link
      to="/"
      aria-label="Kurio, página inicial"
      className="flex items-center text-sm leading-none font-bold tracking-[0.1em] text-text-primary md:h-[34px] md:w-40"
    >
      KURIO
    </Link>
  )
}
