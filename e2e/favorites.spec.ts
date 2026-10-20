import { expect, test } from './support/fixtures'

function favoriteButton(page: import('@playwright/test').Page, desktop: boolean) {
  return desktop
    ? page.getByRole('button', { name: 'Favoritar', exact: true })
    : page.getByRole('button', { name: /Favoritar Golden Signal|Remover Golden Signal/ })
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
    const favoritesLoaded = page.waitForResponse((response) => response.url().endsWith('/api/favorites'))
    await app.goto('/nft/nft-008')
    await favoritesLoaded
    const button = favoriteButton(page, app.isDesktop())
    await expect(button).toHaveAttribute('aria-pressed', 'false')
    const optimistic = button.evaluate(
      (element) =>
        new Promise<boolean>((resolve) => {
          new MutationObserver(() => {
            if (element.getAttribute('aria-pressed') === 'true') resolve(true)
          }).observe(element, { attributes: true, attributeFilter: ['aria-pressed'] })
        }),
    )
    await button.click()
    expect(await optimistic).toBe(true)
    await expect(button).toHaveAttribute('aria-pressed', 'false')
    await expect(page.getByRole('alert').filter({ hasText: 'Não foi possível salvar o favorito' })).toBeAttached()

    await app.mocks((mocks) => {
      localStorage.setItem('kurio:mock-scenario', 'default')
      return mocks.getScenario()
    })
    await button.click()
    await expect(button).toHaveAttribute('aria-pressed', 'true')
  })
})
