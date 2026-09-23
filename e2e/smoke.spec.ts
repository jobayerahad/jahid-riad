import { expect, test } from '@playwright/test'

test('home page renders brand and main landmarks', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByRole('link', { name: /Jahid Riad/i }).first()).toBeVisible()
  await expect(page.locator('main#main-content')).toBeVisible()
})

test('publications index and detail navigation', async ({ page }) => {
  await page.goto('/publications')
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
  const firstDetail = page.locator('a[href^="/publications/"]').first()
  if (await firstDetail.count()) {
    await firstDetail.click()
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
    await expect(page.getByText(/BibTeX/i)).toBeVisible()
  }
})

test('admin login page is reachable', async ({ page }) => {
  await page.goto('/admin/login')
  await expect(page.getByLabel(/email/i)).toBeVisible()
  await expect(page.getByLabel(/password/i)).toBeVisible()
})
