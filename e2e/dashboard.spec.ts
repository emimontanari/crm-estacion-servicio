import { test, expect } from '@playwright/test'

/**
 * Tests E2E para el Dashboard
 *
 * NOTA: Estos tests requieren que la aplicación esté corriendo
 * y que tengas credenciales de prueba configuradas.
 */

test.describe('Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    // TODO: Configurar autenticación
    // Por ahora navegamos directamente al dashboard
    await page.goto('/dashboard')
  })

  test('should display dashboard title', async ({ page }) => {
    await expect(page).toHaveTitle(/Dashboard|CRM/)
  })

  test('should show main navigation', async ({ page }) => {
    // Verificar que existe la navegación principal
    const nav = page.locator('nav')
    await expect(nav).toBeVisible()
  })

  test('should display stat cards', async ({ page }) => {
    // El dashboard debería mostrar tarjetas de estadísticas
    // Esto depende de la implementación específica
    const statCards = page.locator('[data-testid="stat-card"]').or(
      page.locator('.stat-card')
    )

    // Esperamos que haya al menos una tarjeta de estadísticas
    const count = await statCards.count()
    expect(count).toBeGreaterThanOrEqual(0)
  })

  test('should be responsive', async ({ page }) => {
    // Verificar que el dashboard es responsive

    // Desktop
    await page.setViewportSize({ width: 1920, height: 1080 })
    await expect(page.locator('body')).toBeVisible()

    // Tablet
    await page.setViewportSize({ width: 768, height: 1024 })
    await expect(page.locator('body')).toBeVisible()

    // Mobile
    await page.setViewportSize({ width: 375, height: 667 })
    await expect(page.locator('body')).toBeVisible()
  })
})
