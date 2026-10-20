import { test as base, expect, type Page } from '@playwright/test'
import type { MockControls } from '../../src/mocks/control'
import type { ScenarioId } from '../../src/mocks/scenarios'

export const USERS = {
  ana: { name: 'Ana Souza', email: 'ana@kurio.dev', password: 'Kurio@123' },
  bruno: { name: 'Bruno Lima', email: 'bruno@kurio.dev', password: 'Kurio@123' },
} as const

type UserKey = keyof typeof USERS

interface StoredDb {
  orders: Record<string, { status: string; userId: string }>
  carts: Record<string, { items: { editionId: string; quantity: number }[] }>
}

export class App {
  constructor(readonly page: Page) {}

  async scenario(id: ScenarioId) {
    await this.page.addInitScript((scenario) => {
      if (sessionStorage.getItem('e2e:scenario-applied')) return
      sessionStorage.setItem('e2e:scenario-applied', 'true')
      localStorage.setItem('kurio:mock-scenario', scenario)
    }, id)
  }

  async goto(path: string) {
    await this.page.goto(path)
    await this.page.waitForFunction(() => (document.getElementById('root')?.childElementCount ?? 0) > 0)
  }

  async mocks<T>(run: (controls: MockControls) => T): Promise<T> {
    return this.page.evaluate(
      `import('/src/mocks/control.ts').then(({ mockControls }) => (${run.toString()})(mockControls))`,
    ) as Promise<T>
  }

  async db(): Promise<StoredDb> {
    return this.page.evaluate(() => JSON.parse(localStorage.getItem('kurio:mock-db') ?? '{}'))
  }

  async login(user: UserKey = 'ana', redirect?: string) {
    await this.goto(redirect ? `/login?redirect=${encodeURIComponent(redirect)}` : '/login')
    const dialog = this.page.getByRole('dialog')
    await dialog.getByLabel('E-mail').fill(USERS[user].email)
    await dialog.getByLabel('Senha', { exact: true }).fill(USERS[user].password)
    await dialog.getByRole('button', { name: 'Entrar', exact: true }).click()
    await expect(this.page.getByRole('dialog')).toBeHidden()
  }

  search(key: string): unknown {
    const value = new URL(this.page.url()).searchParams.get(key)
    if (value === null) return null
    try {
      return JSON.parse(value)
    } catch {
      return value
    }
  }

  isMobile() {
    return (this.page.viewportSize()?.width ?? 0) < 768
  }

  isDesktop() {
    return (this.page.viewportSize()?.width ?? 0) >= 1024
  }
}

export const test = base.extend<{ app: App }>({
  app: async ({ page }, use) => {
    await page.addInitScript(() => {
      document.addEventListener('DOMContentLoaded', () => {
        const style = document.createElement('style')
        style.textContent = '[aria-label="Cenários de mock"] { display: none !important; }'
        document.head.append(style)
      })
    })
    await use(new App(page))
  },
})

export { expect }
