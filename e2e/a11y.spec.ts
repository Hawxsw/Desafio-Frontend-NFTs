import { expect, test } from './support/fixtures'
import { buyNow, fillCheckoutAndConnect, goToCheckout } from './support/flows'

test.describe('acessibilidade e responsividade', () => {
  test('link de pular conteúdo e foco visível por teclado', async ({ app, page }) => {
    await app.goto('/')
    await expect(page.locator('#catalogo').getByRole('article').first()).toBeVisible()
    await page.keyboard.press('Tab')
    const skip = page.getByRole('link', { name: 'Pular para o conteúdo' })
    await expect(skip).toBeFocused()
    await expect(skip).toBeVisible()
    await page.keyboard.press('Enter')
    await expect(page.locator('main')).toBeFocused()

    await page.keyboard.press('Tab')
    const focusVisible = await page.evaluate(() => document.activeElement?.matches(':focus-visible'))
    expect(focusVisible).toBe(true)
  })

  test('diálogo de login prende o foco e fecha com Escape', async ({ app, page }) => {
    await app.goto('/')
    await app.goto('/login')
    const dialog = page.getByRole('dialog')
    await expect(dialog).toBeVisible()
    for (let index = 0; index < 12; index += 1) {
      await page.keyboard.press('Tab')
      expect(await dialog.evaluate((node) => node.contains(document.activeElement))).toBe(true)
    }
    await page.keyboard.press('Escape')
    await expect(dialog).toBeHidden()
  })

  test('revisão do pedido controla o foco e devolve ao gatilho', async ({ app, page }) => {
    await app.login('ana')
    await buyNow(app, 'nft-003')
    await goToCheckout(app)
    await fillCheckoutAndConnect(app)
    const trigger = page.getByRole('button', { name: 'Confirmar compra' })
    await trigger.focus()
    await page.keyboard.press('Enter')
    const dialog = page.getByRole('dialog', { name: 'Revise seu pedido' })
    await expect(dialog).toBeVisible()
    expect(await dialog.evaluate((node) => node.contains(document.activeElement))).toBe(true)
    await page.keyboard.press('Escape')
    await expect(dialog).toBeHidden()
    await expect(trigger).toBeFocused()
  })

  test('imagens relevantes têm texto alternativo', async ({ app, page }) => {
    await app.goto('/nft/nft-001')
    await expect(page.getByRole('img', { name: /Emerald Ape/ }).first()).toBeVisible()
    const missing = await page.locator('main img:not([alt])').count()
    expect(missing).toBe(0)
  })

  test('skeleton respeita movimento reduzido', async ({ app, page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' })
    await app.scenario('slow')
    await app.goto('/')
    const skeleton = page.getByRole('list', { name: 'Carregando NFTs' }).getByRole('listitem').first()
    await expect(skeleton).toBeVisible()
    expect(await skeleton.evaluate((node) => getComputedStyle(node).animationName)).toBe('none')
  })

  for (const width of [390, 768, 1440]) {
    test(`sem overflow horizontal em ${width}px`, async ({ app, page }) => {
      test.skip(!app.isDesktop(), 'larguras controladas no projeto desktop')
      await page.setViewportSize({ width, height: 900 })
      await buyNow(app, 'nft-003')
      for (const path of ['/', '/nft/nft-001', '/carrinho', '/login', '/rota-inexistente']) {
        await app.goto(path)
        await page.waitForLoadState('networkidle')
        const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)
        expect(overflow, `${path} em ${width}px`).toBeLessThanOrEqual(0)
      }
    })
  }
})
