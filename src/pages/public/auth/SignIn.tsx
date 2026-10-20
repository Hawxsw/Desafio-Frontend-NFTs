import { useRouter, useSearch } from '@tanstack/react-router'
import { AuthDialog } from './components/auth-dialog'
import { SignInForm } from './components/sign-in-form'

export function SignIn() {
  const { redirect } = useSearch({ from: '/login' })
  const router = useRouter()

  return (
    <AuthDialog mode="sign-in" redirect={redirect}>
      <SignInForm onSuccess={() => router.history.replace(redirect ?? '/')} />
    </AuthDialog>
  )
}
