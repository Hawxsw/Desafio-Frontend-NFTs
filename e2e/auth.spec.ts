import { expect, test, USERS } from './support/fixtures'

test.describe('conta e sessão', () => {
  test('cadastro valida campos, trata conflito e cria a conta', async ({ app, page }) => {
    await app.goto('/cadastro')
    const dialog = page.getByRole('dialog')
    const submit = dialog.getByRole('button', { name: /Criar (conta|perfil)/ })

    await submit.click()
    await expect(dialog.getByLabel('Nome de usuário')).toHaveAttribute('aria-invalid', 'true')
    await expect(dialog.getByLabel('Digite seu e-mail')).toHaveAccessibleDescription('Informe um e-mail válido.')

    await dialog.getByLabel('Nome de usuário').fill('ana')
    await dialog.getByLabel('Digite seu e-mail').fill(USERS.ana.email)
    await dialog.getByLabel('Senha', { exact: true }).fill('SenhaNova1')
    await dialog.getByLabel('Confirmar senha').fill('SenhaNova1')
    await submit.click()
    await expect(dialog.getByLabel('Digite seu e-mail')).toHaveAccessibleDescription('Já existe uma conta com este e-mail.')
    await expect(dialog.getByLabel('Nome de usuário')).toHaveAccessibleDescription('Este nome de usuário já está em uso.')

    await dialog.getByLabel('Nome de usuário').fill('carla')
    await dialog.getByLabel('Digite seu e-mail').fill('carla@kurio.dev')
    await submit.click()
    await expect(page).toHaveURL(/\/perfil/)
    await expect(page.getByLabel('Nome de usuário')).toHaveValue('carla')

    await page.reload()
    await expect(page.locator('main').getByLabel('E-mail')).toHaveValue('carla@kurio.dev')
  })

  test('login inválido mostra erro e login válido volta ao fluxo anterior', async ({ app, page }) => {
    await app.goto('/favoritos')
    await expect(page).toHaveURL(/\/login\?redirect=%2Ffavoritos/)
    const dialog = page.getByRole('dialog')
    await dialog.getByLabel('E-mail').fill(USERS.ana.email)
    await dialog.getByLabel('Senha', { exact: true }).fill('errada123')
    await dialog.getByRole('button', { name: 'Entrar', exact: true }).click()
    await expect(dialog.getByRole('alert')).toHaveText('E-mail ou senha inválidos.')

    await dialog.getByLabel('Senha', { exact: true }).fill(USERS.ana.password)
    await dialog.getByRole('button', { name: 'Entrar', exact: true }).click()
    await expect(page).toHaveURL(/\/favoritos$/)
    await expect(page.getByRole('heading', { name: 'Favoritos' })).toBeVisible()
  })

  test('sessão expirada redireciona para o login preservando o destino', async ({ app, page }) => {
    await app.login('ana')
    await app.goto('/perfil')
    await expect(page.getByLabel('Nome de exibição')).toHaveValue(USERS.ana.name)

    await app.mocks((mocks) => mocks.expireSessions())
    await page.reload()
    await expect(page).toHaveURL(/\/login\?redirect=%2Fperfil/)
    await expect(page.getByRole('alert').filter({ hasText: 'Sua sessão expirou' })).toBeAttached()

    const dialog = page.getByRole('dialog')
    await dialog.getByLabel('E-mail').fill(USERS.ana.email)
    await dialog.getByLabel('Senha', { exact: true }).fill(USERS.ana.password)
    await dialog.getByRole('button', { name: 'Entrar', exact: true }).click()
    await expect(page).toHaveURL(/\/perfil$/)
  })

  test('logout e troca de usuário não expõem dados do usuário anterior', async ({ app, page }) => {
    test.skip(!app.isDesktop(), 'menu da conta com botão Sair visível no desktop')
    await app.login('ana')
    await app.goto('/favoritos')
    await expect(page.locator('main').getByRole('article')).toHaveCount(2)

    await app.goto('/perfil/carteiras')
    await expect(page.getByLabel('Endereço da carteira').first()).toHaveValue(/^0x5a1b/)

    await page.getByRole('button', { name: 'Sair' }).click()
    await expect(page).toHaveURL(/\/$/)
    await expect(page.getByRole('link', { name: 'Entrar' })).toBeVisible()

    await app.login('bruno')
    await app.goto('/favoritos')
    await expect(page.getByText('Você ainda não favoritou nenhum NFT.')).toBeVisible()
    await app.goto('/perfil/carteiras')
    await expect(page.getByLabel('Endereço da carteira').first()).toHaveValue(/^0x3e4f/)
  })
})
