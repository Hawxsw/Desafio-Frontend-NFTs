import { expect, test } from './support/fixtures'
import { buyNow, cartIssues, cartTotal, fillCheckoutAndConnect, goToCheckout, openReview, orderCount, reviewTotal } from './support/flows'

test.describe('tempo real via Socket.IO', () => {
  test('alteração de preço no checkout bloqueia a cotação desatualizada até nova confirmação', async ({ app, page }) => {
    await app.login('ana')
    await buyNow(app, 'nft-003')
    await goToCheckout(app)
    await fillCheckoutAndConnect(app)

    await app.mocks((mocks) => mocks.updateEdition('nft-003', 'nft-003-padrao', { price: '1' }))

    const issues = cartIssues(page)
    await expect(issues).toContainText('preço mudou de 0.664 ETH para 1 ETH')
    await expect(page.getByRole('alert').filter({ hasText: 'O preço ou a disponibilidade de Neon Vessel' })).toBeAttached()
    await expect(page.getByRole('button', { name: 'Confirmar compra' })).toBeDisabled()

    await issues.getByRole('button', { name: 'Aceitar alterações' }).click()
    await expect(issues).toBeHidden()
    const review = await openReview(app)
    await expect(reviewTotal(review)).toHaveText('1.016 ETH')
    await review.getByRole('button', { name: 'Confirmar compra' }).click()
    await expect(page.getByRole('dialog', { name: 'Seus NFTs agora estão na sua carteira' })).toContainText('1.016 ETH', {
      timeout: 15_000,
    })
  })

  test('mudança durante a revisão exige nova confirmação', async ({ app }) => {
    await app.login('ana')
    await buyNow(app, 'nft-003')
    await goToCheckout(app)
    await fillCheckoutAndConnect(app)
    const review = await openReview(app)

    await app.mocks((mocks) => mocks.updateEdition('nft-003', 'nft-003-padrao', { available: 0 }))
    await expect(cartIssues(review)).toContainText('edição esgotada')
    await expect(review.getByRole('button', { name: 'Confirmar compra' })).toBeDisabled()
    expect(await orderCount(app)).toBe(0)
  })

  test('cenário de preço alterado avisa no carrinho aberto', async ({ app, page }) => {
    await app.scenario('price-changed')
    await buyNow(app, 'nft-003')
    await expect(cartIssues(page)).toBeVisible({ timeout: 10_000 })
    await expect(page.getByRole('button', { name: 'Conectar e finalizar' })).toBeDisabled()
    await page.getByRole('button', { name: 'Aceitar alterações' }).click()
    await expect(cartTotal(page)).toHaveText('0.7464 ETH')
  })

  test('eventos duplicados ou antigos não regridem o estado', async ({ app, page }) => {
    await app.goto('/nft/nft-001')
    const price = (value: string) =>
      app.isDesktop()
        ? page.locator('main').getByText(value, { exact: true })
        : page.locator('main').getByText(`Total: ${value}`, { exact: true })
    await expect(price('0.39 ETH')).toBeVisible()

    await app.mocks((mocks) => mocks.updateEdition('nft-001', 'nft-001-padrao', { price: '1.5' }))
    await expect(price('1.5 ETH')).toBeVisible()

    await app.mocks((mocks) => mocks.replayLastEvent())
    await app.mocks((mocks) => mocks.updateEdition('nft-001', 'nft-001-padrao', { price: '2' }))
    await expect(price('2 ETH')).toBeVisible()

    const stale = await app.mocks((mocks) => mocks.replayStaleNftEvent('nft-001'))
    expect(stale?.data.editions[0].price).toBe('1.5')
    await app.mocks((mocks) => mocks.replayLastEvent())
    await page.waitForTimeout(500)
    await expect(price('2 ETH')).toBeVisible()
  })

  test('queda de conexão com pedido pendente reconcilia ao reconectar sem duplicar a compra', async ({ app, page }) => {
    await app.login('ana')
    await buyNow(app, 'nft-003')
    await goToCheckout(app)
    await fillCheckoutAndConnect(app)
    const review = await openReview(app)

    await app.mocks((mocks) => mocks.disconnectRealtime({ block: true }))
    await review.getByRole('button', { name: 'Confirmar compra' }).click()

    await expect(page.getByRole('heading', { name: 'Pagamento em processamento' })).toBeVisible()
    await expect(page.getByRole('status').filter({ hasText: 'Reconectando' })).toBeVisible()
    await page.waitForTimeout(3500)
    await expect(page.getByRole('heading', { name: 'Pagamento em processamento' })).toBeVisible()

    await app.mocks((mocks) => mocks.restoreRealtime())
    await expect(page.getByRole('dialog', { name: 'Seus NFTs agora estão na sua carteira' })).toBeVisible({ timeout: 15_000 })
    expect(await orderCount(app)).toBe(1)
  })

  test('pedido pendente é recuperado após recarregar a página', async ({ app, page }) => {
    await app.login('ana')
    await buyNow(app, 'nft-003')
    await goToCheckout(app)
    await fillCheckoutAndConnect(app)
    const review = await openReview(app)
    await app.mocks((mocks) => mocks.disconnectRealtime({ block: true }))
    await review.getByRole('button', { name: 'Confirmar compra' }).click()
    await expect(page.getByRole('heading', { name: 'Pagamento em processamento' })).toBeVisible()

    await page.waitForTimeout(3500)
    await page.reload()
    await expect(page.getByRole('dialog', { name: 'Seus NFTs agora estão na sua carteira' })).toBeVisible({ timeout: 15_000 })
    expect(await orderCount(app)).toBe(1)
  })
})
