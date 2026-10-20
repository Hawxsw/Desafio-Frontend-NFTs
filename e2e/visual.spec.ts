import type { Page } from '@playwright/test'
import { expect, test } from './support/fixtures'
import { buyNow, cartTotal, goToCheckout } from './support/flows'

async function settle(page: Page) {
  await page.waitForLoadState('networkidle')
  await page.evaluate(() => document.fonts.ready)
  await page.waitForFunction(() =>
    Array.from(document.images).every((image) => image.complete || !image.checkVisibility()),
  )
}

test.describe('regressão visual', () => {
  test('início', async ({ app, page }) => {
    await app.goto('/')
    await expect(page.locator('#catalogo').getByRole('article').first()).toBeVisible()
    await settle(page)
    await expect(page).toHaveScreenshot('inicio.png', { fullPage: true })
  })

  test('detalhe do NFT', async ({ app, page }) => {
    await app.goto('/nft/nft-001')
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
    await settle(page)
    await expect(page).toHaveScreenshot('detalhe.png', { fullPage: true })
  })

  test('carrinho', async ({ app, page }) => {
    await buyNow(app, 'nft-003', 2)
    await expect(cartTotal(page)).toBeVisible()
    await page.mouse.move(0, 0)
    await settle(page)
    await expect(page).toHaveScreenshot('carrinho.png', { fullPage: true })
  })

  test('pagamento', async ({ app, page }) => {
    await app.login('ana')
    await buyNow(app, 'nft-003')
    await goToCheckout(app)
    await expect(page.getByRole('button', { name: 'Confirmar compra' })).toBeVisible()
    await page.mouse.move(0, 0)
    await settle(page)
    await expect(page).toHaveScreenshot('pagamento.png', { fullPage: true })
  })
})
