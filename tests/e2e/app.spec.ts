import { expect, test } from '@playwright/test'

const adminEmail =
  process.env.E2E_ADMIN_EMAIL ?? 'vitorgabrieldeoliveiradev@gmail.com'
const adminPassword = process.env.E2E_ADMIN_PASSWORD ?? 'Vitorgabrieldev100.'

test('fluxo principal: login e acesso a todos os módulos', async ({ page }) => {
  await page.goto('/')

  await expect(page.getByRole('heading', { name: 'Entrar na plataforma' })).toBeVisible()
  await page.getByLabel('Email').fill(adminEmail)
  await page.getByLabel('Senha').fill(adminPassword)
  await page.getByRole('button', { name: 'Entrar' }).click()

  await expect(page).toHaveURL(/dashboard/)
  await expect(page.getByText('Transações recentes')).toBeVisible()

  await page.getByRole('link', { name: 'Transações' }).click()
  await expect(page).toHaveURL(/transactions/)
  await expect(page.getByText('Nova transação')).toBeVisible()

  await page.getByRole('link', { name: 'Categorias' }).click()
  await expect(page).toHaveURL(/categories/)
  await expect(page.getByText('Nova categoria')).toBeVisible()

  await page.getByRole('link', { name: 'Contas' }).click()
  await expect(page).toHaveURL(/accounts/)
  await expect(page.getByText('Nova conta')).toBeVisible()

  await page.getByRole('link', { name: 'Metas' }).click()
  await expect(page).toHaveURL(/goals/)
  await expect(page.getByText('Nova meta')).toBeVisible()

  await page.getByRole('link', { name: 'Relatórios' }).click()
  await expect(page).toHaveURL(/reports/)
  await expect(page.getByText('Resumo mensal')).toBeVisible()

  await page.getByRole('link', { name: 'Usuários' }).click()
  await expect(page).toHaveURL(/users/)
  await expect(page.getByText('Novo usuário')).toBeVisible()
})
