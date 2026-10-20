import { expect, test } from './support/fixtures'

function favoriteButton(page: import('@playwright/test').Page, desktop: boolean, name = 'Golden Signal') {
  return desktop
    ? page.getByRole('button', { name: 'Favoritar', exact: true })
    : page.getByRole('button', { name: new RegExp(`(Favoritar|Remover) ${name}`) })
}

test.describe('favoritos', () => {
  test('visitante é levado ao login ao favoritar', async ({ app, page }) => {
    await app.goto('/nft/nft-008')
    await favoriteButton(page, app.isDesktop()).click()
    await expect(page).toHaveURL(/\/login\?redirect=%2Fnft%2Fnft-008/)
  })

  test('favoritar persiste para o usuário autenticado', async ({ app, page }) => {
    await app.login('ana')
    await app.goto('/nft/nft-008')
    const button = favoriteButton(page, app.isDesktop())
    await expect(button).toHaveAttribute('aria-pressed', 'false')
    await button.click()
    await expect(button).toHaveAttribute('aria-pressed', 'true')
    await expect(page.getByRole('status').filter({ hasText: 'adicionado aos favoritos' })).toBeAttached()

    await page.reload()
    await expect(favoriteButton(page, app.isDesktop())).toHaveAttribute('aria-pressed', 'true')
    await app.goto('/favoritos')
    await expect(page.locator('main').getByRole('article')).toHaveCount(3)
  })

  test('falha na mutation desfaz a atualização otimista e informa o erro', async ({ app, page }) => {
    await app.scenario('favorites-error')
    await app.login('ana')
    await app.goto('/nft/nft-002')
    const button = favoriteButton(page, app.isDesktop(), 'Sage Nomad')
    await expect(button).toHaveAttribute('aria-pressed', 'true')

    await button.evaluate((element) => {
      element.dataset.pressedHistory = ''
      new MutationObserver(() => {
        element.dataset.pressedHistory += `${element.getAttribute('aria-pressed')},`
      }).observe(element, { attributes: true, attributeFilter: ['aria-pressed'] })
    })
    await button.click()
    await expect(button).toHaveAttribute('data-pressed-history', 'false,true,')
    await expect(page.getByRole('alert').filter({ hasText: 'Não foi possível salvar o favorito' })).toBeAttached()

    await app.mocks(() => localStorage.setItem('kurio:mock-scenario', 'default'))
    await button.click()
    await expect(button).toHaveAttribute('aria-pressed', 'false')
  })

})
