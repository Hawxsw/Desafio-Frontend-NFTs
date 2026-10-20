import { useId, useState, type FormEvent } from 'react'
import { Button } from '@/components/shadcn/ui/button'
import { Input } from '@/components/shadcn/ui/input'

export function NewsletterForm() {
  const id = useId()
  const [message, setMessage] = useState('')

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setMessage('A inscrição na newsletter não está disponível nesta demonstração.')
  }

  return (
    <form onSubmit={handleSubmit} aria-labelledby={`${id}-title`} className="flex flex-col gap-3 xl:px-4">
      <h2 id={`${id}-title`} className="text-base leading-5 font-bold">
        Inscreva-se nos próximos lançamentos
      </h2>
      <div className="flex">
        <label htmlFor={`${id}-email`} className="sr-only">
          E-mail
        </label>
        <Input
          id={`${id}-email`}
          type="email"
          required
          autoComplete="email"
          placeholder="Seu melhor e-mail"
          className="h-10 rounded-r-none border-0 bg-ink text-sm"
        />
        <Button type="submit" className="h-10 w-[85px] shrink-0 rounded-l-none rounded-r-md text-sm font-bold">
          Enviar
        </Button>
      </div>
      <p className="text-xs leading-[18px] text-text-secondary">
        Receba lançamentos exclusivos, alertas de cunhagem e novidades do mercado.
      </p>
      <p role="status" className="text-xs text-text-accent">
        {message}
      </p>
    </form>
  )
}
