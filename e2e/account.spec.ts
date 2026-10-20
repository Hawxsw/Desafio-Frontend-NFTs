import path from 'node:path'
import { expect, test, USERS } from './support/fixtures'

const AVATAR_FILE = path.resolve(import.meta.dirname, '../public/images/hero/hero-2.png')

test.describe('perfil e carteiras', () => {
  test.beforeEach(async ({ app }) => {
    await app.login('ana')
    await app.goto('/perfil')
  })

  test('edição dos dados valida erros da API e persiste após refresh', async ({ page }) => {
    const main = page.locator('main')
    await main.getByLabel('Nome de usuário').fill('bruno')
    await main.getByRole('button', { name: 'Salvar' }).click()
    await expect(main.getByLabel('Nome de usuário')).toHaveAccessibleDescription('Este nome de usuário já está em uso.')

    await main.getByLabel('Nome de exibição').fill('Ana Clara')
    await main.getByLabel('Nome de usuário').fill('anaclara')
    await main.getByRole('button', { name: 'Salvar' }).click()
    await expect(main.getByRole('status').filter({ hasText: 'Perfil atualizado.' })).toBeVisible()

    await page.reload()
    await expect(main.getByLabel('Nome de exibição')).toHaveValue('Ana Clara')
    await expect(main.getByLabel('Nome de usuário')).toHaveValue('anaclara')
  })

  test('avatar: envio, validação de arquivo e remoção', async ({ page }) => {
    const main = page.locator('main')
    const input = main.locator('input[type="file"]')

    await input.setInputFiles({ name: 'notas.txt', mimeType: 'text/plain', buffer: Buffer.from('texto') })
    await expect(main.getByRole('alert')).toHaveText('Envie uma imagem PNG, JPG ou WebP.')

    await input.setInputFiles(AVATAR_FILE)
    await expect(main.getByRole('img', { name: 'Seu avatar' })).toBeVisible()
    await page.reload()
    await expect(main.getByRole('img', { name: 'Seu avatar' })).toHaveAttribute('src', /^data:image\/jpeg;base64,/)

    await main.getByRole('button', { name: 'Remover', exact: true }).click()
    await expect(main.getByRole('img', { name: 'Seu avatar' })).toBeHidden()
  })

  test('alteração de senha valida confirmação e senha atual', async ({ app, page }) => {
    const main = page.locator('main')
    await main.getByLabel('Senha atual').fill('errada123')
    await main.getByLabel('Nova senha', { exact: true }).fill('NovaSenha1')
    await main.getByLabel('Confirmar nova senha').fill('Outra123')
    await main.getByRole('button', { name: 'Salvar' }).click()
    await expect(main.getByLabel('Confirmar nova senha')).toHaveAccessibleDescription('As senhas não conferem.')

    await main.getByLabel('Confirmar nova senha').fill('NovaSenha1')
    await main.getByRole('button', { name: 'Salvar' }).click()
    await expect(main.getByLabel('Senha atual')).toHaveAccessibleDescription('Senha atual incorreta.')

    await main.getByLabel('Senha atual').fill(USERS.ana.password)
    await main.getByRole('button', { name: 'Salvar' }).click()
    await expect(main.getByRole('status').filter({ hasText: 'Perfil atualizado.' })).toBeVisible()

    const db = await app.db()
    expect(JSON.stringify(db)).not.toContain('NovaSenha1')
  })

  test('carteira principal valida endereço e persiste a edição', async ({ app, page }) => {
    await app.goto('/perfil/carteiras')
    const main = page.locator('main')
    const address = main.getByLabel('Endereço da carteira').first()
    await main.getByLabel('Código de indicação').fill('KURIO-ANA')
    await main.getByRole('textbox', { name: /^Nome ENS/ }).fill('ana')

    await address.fill('0x123')
    await main.getByRole('button', { name: 'Salvar carteira' }).click()
    await expect(address).toHaveAccessibleDescription('Informe um endereço 0x com 40 caracteres.')

    await address.fill('0xabcdefabcdefabcdefabcdefabcdefabcdefabcd')
    await main.getByRole('button', { name: 'Salvar carteira' }).click()
    await expect(main.getByRole('status').filter({ hasText: 'Carteira salva.' })).toBeVisible()

    await page.reload()
    await expect(main.getByLabel('Endereço da carteira').first()).toHaveValue('0xabcdefabcdefabcdefabcdefabcdefabcdefabcd')
  })
})
