import { expect, test } from './support/fixtures'
import { buyNow, fillCheckoutAndConnect, goToCheckout, openReview, orderCount, reviewTotal, walletStatus } from './support/flows'

test.describe('pagamento', () => {
  test('compra completa do catálogo ao recibo confirmado', async ({ app, page }) => {
    await app.login('ana')
    await app.goto('/')
    await page.locator('#catalogo').getByRole('link', { name: /Golden Signal #/ }).first().click()
    await expect(page).toHaveURL(/\/nft\//)
    await page.getByRole('button', { name: app.isDesktop() ? 'Comprar' : 'Comprar NFT', exact: true }).filter({ visible: true }).click()
    await expect(page).toHaveURL(/\/carrinho$/)

    await goToCheckout(app)
    await fillCheckoutAndConnect(app)
    const review = await openReview(app)
    const total = await reviewTotal(review).innerText()
    await review.getByRole('button', { name: 'Confirmar compra' }).click()

    await expect(page).toHaveURL(/\/pedido\/ord-/)
    const receipt = page.getByRole('dialog', { name: 'Seus NFTs agora estão na sua carteira' })
    await expect(receipt).toBeVisible({ timeout: 15_000 })
    await expect(receipt).toContainText(total)
    await expect(receipt.getByRole('link', { name: /Ver no/ })).toHaveAttribute('href', /tx\/0x[0-9a-f]{64}$/)

    const orderUrl = page.url()
    await app.mocks((mocks) => {
      const db = JSON.parse(localStorage.getItem('kurio:mock-db') ?? '{}')
      const order = Object.values(db.orders as Record<string, { items: { nftId: string; editionId: string }[] }>)[0]
      return mocks.updateEdition(order.items[0].nftId, order.items[0].editionId, { price: '99' })
    })
    await page.goto(orderUrl)
    await expect(page.getByRole('dialog', { name: 'Seus NFTs agora estão na sua carteira' })).toContainText(total)

    await app.goto('/carrinho')
    await expect(page.getByRole('heading', { name: 'Seu carrinho está vazio' })).toBeVisible()
  })

  test('valida os campos do layout com mensagens associadas', async ({ app, page }) => {
    test.skip(!app.isDesktop(), 'formulário do colecionador existe no layout desktop')
    await app.login('ana')
    await buyNow(app, 'nft-003')
    await goToCheckout(app)
    await page.getByLabel('Nome de exibição').fill('')
    await page.getByRole('button', { name: 'Confirmar compra' }).click()
    await expect(page.getByLabel('Nome de exibição')).toHaveAccessibleDescription('Informe seu nome de exibição.')
    await expect(page.getByLabel('Código de indicação')).toHaveAccessibleDescription('Informe o código de indicação.')
    await expect(page.getByLabel('Nome de exibição')).toBeFocused()
  })

  test('conexão da carteira: recusa, nova tentativa e desconexão', async ({ app, page }) => {
    await app.scenario('wallet-rejected')
    await app.login('ana')
    await buyNow(app, 'nft-003')
    await goToCheckout(app)
    await page.getByRole('button', { name: 'Conectar carteira' }).click()
    await expect(page.getByRole('region', { name: 'Carteira e rede' }).getByRole('alert')).toHaveText(/A conexão foi recusada/)
    await expect(walletStatus(page)).toHaveText('Carteira desconectada.')

    await app.mocks(() => localStorage.setItem('kurio:mock-scenario', 'default'))
    await fillCheckoutAndConnect(app)
    await page.getByRole('button', { name: 'Desconectar carteira' }).click()
    await expect(walletStatus(page)).toHaveText('Carteira desconectada.')
    await page.getByRole('button', { name: 'Confirmar compra' }).click()
    await expect(page.locator('main').getByRole('alert').filter({ hasText: 'Conecte sua carteira para revisar o pedido.' })).toBeVisible()
  })

  test('clique repetido cria um único pedido', async ({ app, page }) => {
    await app.login('ana')
    await buyNow(app, 'nft-003')
    await goToCheckout(app)
    await fillCheckoutAndConnect(app)
    const review = await openReview(app)
    await review.getByRole('button', { name: 'Confirmar compra' }).dblclick()
    await expect(page).toHaveURL(/\/pedido\/ord-/)
    expect(await orderCount(app)).toBe(1)
  })

  test('pagamento recusado mantém os itens no carrinho', async ({ app, page }) => {
    await app.scenario('payment-declined')
    await app.login('ana')
    await buyNow(app, 'nft-003')
    await goToCheckout(app)
    await fillCheckoutAndConnect(app)
    const review = await openReview(app)
    await review.getByRole('button', { name: 'Confirmar compra' }).click()
    await expect(page.getByRole('heading', { name: 'Pagamento recusado' })).toBeVisible({ timeout: 15_000 })
    await expect(page.getByText('A carteira recusou a assinatura da transação.')).toBeVisible()
    await page.getByRole('link', { name: 'Ver carrinho' }).click()
    await expect(page.getByRole('link', { name: /Ivory Baron|Neon Vessel/ }).filter({ visible: true }).first()).toBeVisible()
  })

  test('timeout após criar o pedido recupera o mesmo pedido pela chave de idempotência', async ({ app, page }) => {
    test.setTimeout(90_000)
    await app.scenario('order-timeout')
    await app.login('ana')
    await buyNow(app, 'nft-003')
    await goToCheckout(app)
    await fillCheckoutAndConnect(app)
    const review = await openReview(app)
    await review.getByRole('button', { name: 'Confirmar compra' }).click()
    await expect(review.getByRole('button', { name: 'Enviando pedido...' })).toBeVisible()

    await expect(review.getByRole('alert')).toHaveText('O servidor demorou para responder. Tente novamente.', {
      timeout: 15_000,
    })
    await expect(review.getByRole('button', { name: 'Tentar novamente' })).toBeEnabled()
    expect(await orderCount(app)).toBe(1)

    await page.reload()
    await expect(page.getByRole('button', { name: 'Verificar pedido' })).toBeVisible()
    await page.getByRole('button', { name: 'Verificar pedido' }).click()
    await expect(page).toHaveURL(/\/pedido\/ord-/)
    expect(await orderCount(app)).toBe(1)
  })
})
