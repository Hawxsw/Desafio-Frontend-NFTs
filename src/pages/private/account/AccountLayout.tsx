import { Outlet } from '@tanstack/react-router'
import { AccountSidebar } from './components/account-sidebar'

export function AccountLayout() {
  return (
    <div className="mx-auto flex w-full max-w-page flex-col gap-7 px-4 py-6 lg:flex-row lg:items-start lg:px-10 lg:pt-8 xl:px-0">
      <AccountSidebar />
      <div className="min-w-0 flex-1">
        <Outlet />
      </div>
    </div>
  )
}
