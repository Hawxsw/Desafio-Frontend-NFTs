import { expect, test } from './support/fixtures'
import { buyNow, cartTotal } from './support/flows'

test.describe('carrinho', () => {
  test('quantidades, remoção, cupom e totais coerentes', async ({ app, page }) => {
    await buyNow(app, 'nft-001', 2)
    await expect(cartTotal(page)).toHaveText('0.796 ETH')

    const increase = page.getByRole('button', { name: 'Aumentar quantidade' }).filter({ visible: true }).first()
    await increase.click()
    await expect(cartTotal(page)).toHaveText('1.186 ETH')
    await expect(page.getByRole('status').filter({ hasText: 'Quantidade atualizada.' })).toBeAttached()

    const coupon = page.getByRole('textbox', { name: 'Código promocional' })
    await coupon.fill('XYZ')
    await page.locator('main').getByRole('button', { name: 'Aplicar', exact: true }).click()
    await expect(coupon).toHaveAccessibleDescription('Cupom inválido.')

    await coupon.fill('EXPIRADO')
    await page.locator('main').getByRole('button', { name: 'Aplicar', exact: true }).click()
    await expect(coupon).toHaveAccessibleDescription('Este cupom expirou.')

    await coupon.fill('kurio10')
    await page.locator('main').getByRole('button', { name: 'Aplicar', exact: true }).click()
    await expect(page.getByRole('region', { name: 'Resumo da carteira' })).toContainText('(-) 0.117 ETH')
    await expect(cartTotal(page)).toHaveText('1.069 ETH')

    await page.getByRole('button', { name: 'Remover cupom' }).click()
    await expect(cartTotal(page)).toHaveText('1.186 ETH')

    await page.getByRole('button', { name: /Remover Emerald Ape/ }).filter({ visible: true }).click()
    await expect(page.getByRole('heading', { name: 'Seu carrinho está vazio' })).toBeVisible()
  })

  test('respeita o limite por edição', async ({ app, page }) => {
    await app.goto('/nft/nft-001')
    await page.getByRole('radio', { name: /Gênesis/ }).click()
    await page.getByRole('button', { name: app.isDesktop() ? 'Comprar' : 'Comprar NFT', exact: true }).filter({ visible: true }).click()
    await expect(page).toHaveURL(/\/carrinho$/)
    await expect(page.getByRole('button', { name: 'Aumentar quantidade' }).filter({ visible: true }).first()).toBeDisabled()

    await app.goto('/nft/nft-001')
    await page.getByRole('radio', { name: /Gênesis/ }).click()
    await page.getByRole('button', { name: app.isDesktop() ? 'Comprar' : 'Comprar NFT', exact: true }).filter({ visible: true }).click()
    await expect(page.getByRole('alert').filter({ hasText: 'Só é possível levar 1 unidade(s)' })).toBeVisible()
  })

  test('persiste após refresh e preserva os itens do visitante ao entrar', async ({ app, page }) => {
    await buyNow(app, 'nft-002')
    await page.reload()
    await expect(page.getByRole('link', { name: /Sage Nomad/ }).filter({ visible: true })).toBeVisible()

    await app.login('bruno', '/carrinho')
    await expect(page).toHaveURL(/\/carrinho$/)
    await expect(page.getByRole('link', { name: /Sage Nomad/ }).filter({ visible: true })).toBeVisible()

    const db = await app.db()
    expect(db.carts['user:usr-bruno'].items).toHaveLength(1)
  })
})
