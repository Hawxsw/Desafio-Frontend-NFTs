import { useRouter, useSearch } from '@tanstack/react-router'
import { AuthDialog } from './components/auth-dialog'
import { SignUpForm } from './components/sign-up-form'

export function SignUp() {
  const { redirect } = useSearch({ from: '/cadastro' })
  const router = useRouter()

  return (
    <AuthDialog mode="sign-up" redirect={redirect}>
      <SignUpForm onSuccess={() => router.history.replace(redirect ?? '/perfil')} />
    </AuthDialog>
  )
}
