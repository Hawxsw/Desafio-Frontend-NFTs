import { expect, test } from './support/fixtures'

test.describe('catálogo', () => {
  test('busca, filtros combinados, ordenação e paginação compõem a URL e sobrevivem ao histórico', async ({ app, page }) => {
    test.skip(!app.isDesktop(), 'filtros laterais no desktop; mobile coberto no teste do drawer')
    await app.goto('/')

    const catalog = page.locator('#catalogo')
    await expect(catalog.getByRole('article').first()).toBeVisible()

    await catalog.getByRole('searchbox', { name: 'Buscar NFTs' }).fill('Golden')
    await expect(page).toHaveURL(/q=Golden/)
    await expect(catalog.getByRole('article').first()).toContainText('Golden')

    await catalog.getByText('Arte digital', { exact: true }).click()
    await expect.poll(() => app.search('category')).toEqual(['arte-digital'])
    await catalog.getByText('Ethereum', { exact: true }).click()
    await expect.poll(() => app.search('network')).toEqual(['ethereum'])
    expect(app.search('q')).toBe('Golden')

    await app.goto('/?sort=price-asc')
    await expect(catalog.getByRole('combobox', { name: 'Ordenar por' })).toContainText('Menor preço')
    const firstCheap = await catalog.getByRole('article').first().innerText()

    await catalog.getByRole('navigation', { name: 'Paginação' }).getByRole('button', { name: '2', exact: true }).click()
    await expect(page).toHaveURL(/page=2/)
    await expect(catalog.getByRole('article').first()).not.toHaveText(firstCheap)

    await catalog.getByText('Fotografia', { exact: true }).click()
    await expect.poll(() => app.search('category')).toEqual(['fotografia'])
    expect(app.search('page')).toBeNull()

    await page.goBack()
    await expect.poll(() => app.search('page')).toBe(2)
    expect(app.search('category')).toBeNull()

    await page.reload()
    await expect(page).toHaveURL(/sort=price-asc/)
    await expect(catalog.getByRole('navigation', { name: 'Paginação' }).getByRole('button', { name: '2', exact: true })).toHaveAttribute(
      'aria-current',
      'page',
    )
  })

  test('busca sem resultados mostra estado vazio e permite limpar', async ({ app, page }) => {
    await app.goto('/?q=inexistente-xyz')
    await expect(page.getByText('Nenhum NFT encontrado.')).toBeVisible()
    await page.getByRole('button', { name: 'Limpar busca e filtros' }).click()
    await expect(page).not.toHaveURL(/q=/)
    await expect(page.locator('#catalogo').getByRole('article').first()).toBeVisible()
  })

  test('filtros no drawer mobile mantêm foco e atualizam a URL', async ({ app, page }) => {
    test.skip(app.isDesktop(), 'drawer só existe abaixo de 1280px')
    await app.goto('/')
    const trigger = page.getByRole('button', { name: 'Abrir filtros' })
    await trigger.click()
    const sheet = page.getByRole('dialog', { name: 'Filtros' })
    await expect(sheet).toBeVisible()
    await sheet.getByText('Música', { exact: true }).click()
    await expect.poll(() => app.search('category')).toEqual(['musica'])
    await page.keyboard.press('Escape')
    await expect(sheet).toBeHidden()
    await expect(trigger).toBeFocused()
  })

  test('cenário vazio mostra catálogo sem itens', async ({ app, page }) => {
    await app.scenario('empty')
    await app.goto('/')
    await expect(page.getByText('Nenhum NFT encontrado.')).toBeVisible()
  })

  test('skeleton aparece em carregamento lento e falha permite nova tentativa', async ({ app, page }) => {
    await app.scenario('slow')
    await app.goto('/')
    await expect(page.getByRole('list', { name: 'Carregando NFTs' }).first()).toBeVisible()
    await expect(page.locator('#catalogo').getByRole('article').first()).toBeVisible({ timeout: 15_000 })

    await app.mocks((mocks) => mocks.selectScenario('server-error'))
    await page.reload()
    await expect(page.getByText('Não foi possível carregar o catálogo.')).toBeVisible({ timeout: 20_000 })

    await app.mocks((mocks) => mocks.selectScenario('default'))
    await page.getByRole('button', { name: 'Tentar novamente' }).click()
    await expect(page.locator('#catalogo').getByRole('article').first()).toBeVisible()
  })

  test('respostas fora de ordem não sobrescrevem a busca mais recente', async ({ app, page }) => {
    test.skip(!app.isDesktop(), 'campo lateral no desktop')
    await app.scenario('out-of-order')
    await app.goto('/')
    const search = page.locator('#catalogo').getByRole('searchbox', { name: 'Buscar NFTs' })
    await search.fill('Emerald')
    await search.press('Enter')
    await search.fill('Ivory')
    await search.press('Enter')
    await expect(page).toHaveURL(/q=Ivory/)
    const cards = page.locator('#catalogo').getByRole('article')
    await expect(cards.first()).toContainText('Ivory')
    await page.waitForTimeout(2500)
    await expect(cards.first()).toContainText('Ivory')
  })
})

test.describe('detalhe e rotas', () => {
  test('acesso direto ao detalhe, edição esgotada e limite de quantidade', async ({ app, page }) => {
    await app.goto('/nft/nft-001')
    await expect(page.getByRole('heading', { level: 1 })).toContainText('Emerald Ape')

    const editions = page.getByRole('radiogroup', { name: 'Edição:' })
    await expect(editions.getByRole('radio', { name: /Dourada/ })).toBeDisabled()

    await editions.getByRole('radio', { name: /Gênesis/ }).click()
    const stepper = page.getByRole('group', { name: 'Quantidade' }).filter({ visible: true }).first()
    await expect(stepper.getByRole('button', { name: 'Aumentar quantidade' })).toBeDisabled()
  })

  test('NFT inexistente e rota desconhecida', async ({ app, page }) => {
    await app.goto('/nft/nft-999')
    await expect(page.getByRole('heading', { name: 'NFT não encontrado' })).toBeVisible()
    await app.goto('/rota/que/nao/existe')
    await expect(page.getByRole('heading', { name: 'Página não encontrada' })).toBeVisible()
  })
})
