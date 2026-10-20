import { FaFacebook } from 'react-icons/fa6'
import { FcGoogle } from 'react-icons/fc'

export const AUTH_INPUT_CLASS =
  'h-[50px] rounded-lg px-[18px] leading-4 lg:h-10 lg:rounded-[5px]'

export const AUTH_SUBMIT_CLASS =
  'h-14 rounded-lg bg-primary text-lg leading-4 font-bold text-ink disabled:cursor-wait disabled:opacity-70 lg:h-[45px] lg:rounded-[5px]'

const SOCIAL_BUTTON_CLASS =
  'flex h-11 w-full items-center justify-center gap-3 rounded-lg border border-surface-border text-[13px] leading-4 font-medium text-text-secondary disabled:cursor-not-allowed lg:h-9 lg:rounded-[5px]'

export function SocialSignIn() {
  return (
    <div className="flex flex-col gap-3 pt-6 lg:mt-6 lg:border-t lg:border-surface-border lg:px-20">
      <p className="text-center text-[13px] leading-4">Ou continue com</p>
      <button type="button" disabled title="Disponível em breve" className={SOCIAL_BUTTON_CLASS}>
        <FcGoogle aria-hidden className="size-5" />
        Continuar com Google
      </button>
      <button type="button" disabled title="Disponível em breve" className={SOCIAL_BUTTON_CLASS}>
        <FaFacebook aria-hidden className="size-5 text-[#1877F2]" />
        Continuar com Facebook
      </button>
    </div>
  )
}
