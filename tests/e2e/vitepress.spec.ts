import { expect, test } from '@playwright/test'

test('replaces VitePress DocSearch with the Vue implementation', async ({
  page
}) => {
  const errors: string[] = []
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(message.text())
  })
  page.on('pageerror', (error) => errors.push(error.message))

  await page.goto('/')
  await page.locator('.DocSearch-Button').click()

  const modal = page.locator('.DocSearch-Modal')
  await expect(modal).toBeVisible()
  await expect(modal).toHaveCSS('max-width', '800px')

  await page.locator('.DocSearch-Input').fill('getting')

  await expect(page.locator('.DocSearch-Hit-source')).toHaveText('Guide')
  await expect(page.locator('.DocSearch-Hit-title')).toHaveText(
    'Getting Started'
  )
  await expect(page.locator('.DocSearch-Hit')).toHaveAttribute(
    'aria-selected',
    'true'
  )

  await page.locator('.DocSearch-Input').press('Shift+Tab')
  await expect(page.getByRole('link', { name: /Powered by Algolia/i })).toBeFocused()

  await page.locator('.DocSearch-Input').focus()
  await page.locator('.DocSearch-Input').press('Enter')
  await expect(page).toHaveURL(/\/guide\/getting-started(?:\.html)?$/)
  await expect(page.getByRole('heading', { name: 'Getting Started' })).toBeVisible()

  await page.locator('.DocSearch-Button').click()
  await page.locator('.DocSearch-Input').fill('install')
  await expect(page.locator('.DocSearch-Hit-title')).toHaveText('Install')
  await page.locator('.DocSearch-Input').press('Enter')
  await expect(page).toHaveURL(/\/guide\/getting-started(?:\.html)?#install$/)
  await expect(page.getByRole('heading', { name: 'Install' })).toBeVisible()

  await page.locator('.DocSearch-Button').click()
  await expect(page.locator('.DocSearch-Hit-source')).toHaveText(
    'Recently viewed docs'
  )
  await expect(page.locator('.DocSearch-Hit-title').first()).toHaveText('Install')

  await page.getByRole('button', { name: 'Pin this search' }).first().click()
  await expect(page.locator('.DocSearch-Hit-source').first()).toHaveText('Pinned')
  expect(errors).toEqual([])
})
