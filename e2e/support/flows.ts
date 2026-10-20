import { expect, type Locator, type Page } from '@playwright/test'
import type { App } from './fixtures'

export async function buyNow(app: App, nftId: string, quantity = 1) {
  const { page } = app
  await app.goto(`/nft/${nftId}`)
  const increase = page.getByRole('button', { name: 'Aumentar quantidade' }).filter({ visible: true }).first()
  for (let count = 1; count < quantity; count += 1) await increase.click()
  const buy = page.getByRole('button', { name: app.isDesktop() ? 'Comprar' : 'Comprar NFT', exact: true }).filter({ visible: true })
  await buy.click()
  await expect(page).toHaveURL(/\/carrinho$/)
}

export function cartTotal(page: Page) {
  return page.locator('main').getByRole('region', { name: 'Resumo da carteira' }).locator('dt:text-is("Total") + dd')
}

export function reviewTotal(dialog: Locator) {
  return dialog.locator('dt:text-is("Total") + dd')
}

export function walletStatus(page: Page) {
  return page.locator('main').getByRole('status').filter({ hasText: /^Carteira (conectada|desconectada)/ })
}

export function cartIssues(scope: Page | Locator) {
  return scope.getByRole('alert', { name: 'Seu carrinho mudou' })
}

export async function goToCheckout(app: App) {
  await app.page.getByRole('button', { name: 'Conectar e finalizar' }).click()
  await expect(app.page).toHaveURL(/\/pagamento/)
}

export async function fillCheckoutAndConnect(app: App) {
  const { page } = app
  if (app.isDesktop()) {
    await page.getByLabel('Código de indicação').fill('KURIO-ANA')
  }
  await page.getByRole('button', { name: 'Conectar carteira' }).click()
  await expect(walletStatus(page)).toContainText('Carteira conectada')
}

export async function openReview(app: App) {
  await app.page.getByRole('button', { name: 'Confirmar compra' }).click()
  const dialog = app.page.getByRole('dialog', { name: 'Revise seu pedido' })
  await expect(reviewTotal(dialog)).toBeVisible()
  return dialog
}

export async function orderCount(app: App) {
  const db = await app.db()
  return Object.keys(db.orders ?? {}).length
}
