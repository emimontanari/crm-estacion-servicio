# Estrategia de Testing - CRM Estación de Servicio

## Tabla de Contenidos

- [Visión General](#visión-general)
- [Frameworks de Testing](#frameworks-de-testing)
- [Estructura de Tests](#estructura-de-tests)
- [Tipos de Tests](#tipos-de-tests)
- [Comandos de Testing](#comandos-de-testing)
- [Configuración](#configuración)
- [Buenas Prácticas](#buenas-prácticas)
- [CI/CD Integration](#cicd-integration)

## Visión General

Este proyecto implementa una estrategia de testing completa que abarca:

- **Tests Unitarios**: Para componentes React y lógica de negocio
- **Tests de Integración**: Para funciones de Convex y APIs
- **Tests E2E**: Para flujos críticos de usuario

### Cobertura de Testing

```
┌─────────────────────────────────────────────────────────┐
│                    Testing Pyramid                      │
├─────────────────────────────────────────────────────────┤
│                                                         │
│                    E2E Tests                            │
│              (Playwright - Críticos)                    │
│                                                         │
│            ─────────────────────────                    │
│                                                         │
│              Integration Tests                          │
│         (Vitest - Funciones Convex)                     │
│                                                         │
│        ─────────────────────────────────                │
│                                                         │
│                 Unit Tests                              │
│      (Jest/Vitest - Componentes y Lógica)               │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

## Frameworks de Testing

### Jest + React Testing Library (Frontend)

- **Ubicación**: `apps/web`
- **Propósito**: Testing de componentes React, hooks y lógica de UI
- **Configuración**: `apps/web/jest.config.ts`

### Vitest (Packages)

- **Ubicación**: `packages/ui`, `packages/backend`
- **Propósito**:
  - `packages/ui`: Testing de componentes compartidos
  - `packages/backend`: Testing de lógica de negocio Convex
- **Configuración**:
  - `packages/ui/vitest.config.ts`
  - `packages/backend/vitest.config.ts`

### Playwright (E2E)

- **Ubicación**: `/e2e`
- **Propósito**: Testing end-to-end de flujos críticos
- **Configuración**: `playwright.config.ts`

## Estructura de Tests

```
crm-estacion-servicio/
├── apps/
│   └── web/
│       ├── jest.config.ts
│       ├── jest.setup.ts
│       ├── components/
│       │   └── __tests__/
│       │       └── *.test.tsx
│       └── modules/
│           └── auth/
│               └── hooks/
│                   └── __tests__/
│                       └── *.test.tsx
│
├── packages/
│   ├── ui/
│   │   ├── vitest.config.ts
│   │   ├── vitest.setup.ts
│   │   └── src/
│   │       └── components/
│   │           └── __tests__/
│   │               └── *.test.tsx
│   │
│   └── backend/
│       ├── vitest.config.ts
│       └── convex/
│           └── __tests__/
│               └── *.test.ts
│
└── e2e/
    ├── auth.setup.ts
    ├── dashboard.spec.ts
    ├── customers.spec.ts
    ├── sales.spec.ts
    └── notifications.spec.ts
```

## Tipos de Tests

### 1. Tests Unitarios - Componentes UI

**Ubicación**: `packages/ui/src/components/__tests__/`

**Ejemplo**: Testing del componente Button

```typescript
import { render, screen } from '@testing-library/react'
import { Button } from '../button'

describe('Button', () => {
  it('renders with default variant', () => {
    render(<Button>Click me</Button>)
    expect(screen.getByRole('button')).toBeInTheDocument()
  })
})
```

**Archivos de test creados**:
- `button.test.tsx` - Tests del componente Button
- `stat-card.test.tsx` - Tests del componente StatCard

### 2. Tests Unitarios - Hooks

**Ubicación**: `apps/web/modules/auth/hooks/__tests__/`

**Ejemplo**: Testing de hooks personalizados

```typescript
import { renderHook } from '@testing-library/react'
import { useCurrentUser } from '../use-current-user'

describe('useCurrentUser', () => {
  it('returns authenticated user', () => {
    const { result } = renderHook(() => useCurrentUser())
    expect(result.current.isAuthenticated).toBe(true)
  })
})
```

**Archivos de test creados**:
- `use-current-user.test.tsx` - Tests del hook de usuario actual

### 3. Tests de Componentes de Aplicación

**Ubicación**: `apps/web/components/__tests__/`

**Ejemplo**: Testing de componentes complejos

```typescript
import { render, screen } from '@testing-library/react'
import { NotificationCenter } from '../notifications/notification-center'

describe('NotificationCenter', () => {
  it('displays unread count badge', async () => {
    render(<NotificationCenter userId="user_123" />)
    // Assertions...
  })
})
```

**Archivos de test creados**:
- `notification-center.test.tsx` - Tests del centro de notificaciones

### 4. Tests de Lógica de Negocio

**Ubicación**: `packages/backend/convex/__tests__/`

**Ejemplo**: Testing de lógica de Convex

```typescript
import { describe, it, expect } from 'vitest'

describe('Customer validation', () => {
  it('should validate email format', () => {
    const isValidEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
    expect(isValidEmail('test@example.com')).toBe(true)
  })
})
```

**Archivos de test creados**:
- `customers.test.ts` - Tests de validación y lógica de clientes
- `loyalty.test.ts` - Tests del sistema de lealtad y puntos

### 5. Tests End-to-End

**Ubicación**: `/e2e/`

**Ejemplo**: Testing de flujos de usuario

```typescript
import { test, expect } from '@playwright/test'

test('should navigate to customers page', async ({ page }) => {
  await page.goto('/dashboard/customers')
  await expect(page).toHaveURL(/customers/)
})
```

**Archivos de test creados**:
- `auth.setup.ts` - Configuración de autenticación
- `dashboard.spec.ts` - Tests del dashboard
- `customers.spec.ts` - Tests de gestión de clientes
- `sales.spec.ts` - Tests del flujo de ventas
- `notifications.spec.ts` - Tests del sistema de notificaciones

## Comandos de Testing

### Tests Globales (desde la raíz)

```bash
# Ejecutar todos los tests unitarios
pnpm test

# Ejecutar tests en modo watch
pnpm test:watch

# Generar reporte de cobertura
pnpm test:coverage

# Ejecutar tests E2E
pnpm test:e2e

# Ejecutar tests E2E en modo UI
pnpm test:e2e:ui

# Ejecutar tests E2E con navegador visible
pnpm test:e2e:headed

# Instalar navegadores de Playwright
pnpm playwright:install
```

### Tests por Paquete

#### Frontend (apps/web)

```bash
cd apps/web

# Ejecutar tests
pnpm test

# Modo watch
pnpm test:watch

# Con cobertura
pnpm test:coverage
```

#### UI Package (packages/ui)

```bash
cd packages/ui

# Ejecutar tests
pnpm test

# Modo watch
pnpm test:watch

# UI de Vitest
pnpm test:ui

# Con cobertura
pnpm test:coverage
```

#### Backend (packages/backend)

```bash
cd packages/backend

# Ejecutar tests
pnpm test

# Modo watch
pnpm test:watch

# UI de Vitest
pnpm test:ui

# Con cobertura
pnpm test:coverage
```

## Configuración

### Jest (Frontend)

**Archivo**: `apps/web/jest.config.ts`

Características:
- Entorno jsdom para testing de React
- Mocks de Next.js, Clerk y Convex
- Alias de módulos configurados
- Cobertura de código habilitada

### Vitest (UI Package)

**Archivo**: `packages/ui/vitest.config.ts`

Características:
- Plugin de React habilitado
- Entorno jsdom
- Cobertura con v8
- Setup automático de testing-library

### Vitest (Backend)

**Archivo**: `packages/backend/vitest.config.ts`

Características:
- Entorno Node.js
- Cobertura de funciones Convex
- Exclusión de archivos generados

### Playwright (E2E)

**Archivo**: `playwright.config.ts`

Características:
- Múltiples navegadores (Chrome, Firefox, Safari)
- Tests móviles (Pixel 5, iPhone 12)
- Servidor de desarrollo automático
- Screenshots y videos en fallos
- Trazas en retry

## Buenas Prácticas

### 1. Nomenclatura de Tests

```typescript
// ✅ BIEN: Descriptivo y claro
describe('Button', () => {
  it('should render with primary variant by default', () => {})
  it('should call onClick handler when clicked', () => {})
})

// ❌ MAL: Vago y no descriptivo
describe('Button', () => {
  it('works', () => {})
  it('test1', () => {})
})
```

### 2. Aislamiento de Tests

```typescript
// ✅ BIEN: Cada test es independiente
describe('CustomerForm', () => {
  beforeEach(() => {
    // Setup limpio para cada test
    jest.clearAllMocks()
  })

  it('validates email', () => {
    // Test específico
  })
})

// ❌ MAL: Tests dependientes entre sí
let sharedState
it('test1', () => { sharedState = 'value' })
it('test2', () => { expect(sharedState).toBe('value') })
```

### 3. Testing de Componentes

```typescript
// ✅ BIEN: Testing del comportamiento del usuario
it('should submit form when button is clicked', async () => {
  const onSubmit = jest.fn()
  render(<Form onSubmit={onSubmit} />)

  await userEvent.type(screen.getByLabelText(/name/i), 'John')
  await userEvent.click(screen.getByRole('button', { name: /submit/i }))

  expect(onSubmit).toHaveBeenCalledWith({ name: 'John' })
})

// ❌ MAL: Testing de implementación interna
it('should set state when typing', () => {
  const { container } = render(<Form />)
  const input = container.querySelector('.name-input')
  // Testing detalles de implementación
})
```

### 4. Mocking

```typescript
// ✅ BIEN: Mock mínimo necesario
jest.mock('convex/react', () => ({
  useQuery: jest.fn(),
  useMutation: jest.fn(),
}))

// ❌ MAL: Mock excesivo
jest.mock('entire-library', () => ({ /* todo el módulo */ }))
```

### 5. Assertions Claras

```typescript
// ✅ BIEN: Assertion específica y clara
expect(screen.getByRole('button', { name: /submit/i })).toBeEnabled()

// ❌ MAL: Assertion vaga
expect(document.body.innerHTML).toContain('Submit')
```

## CI/CD Integration

### GitHub Actions (Ejemplo)

```yaml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3
      - uses: pnpm/action-setup@v2
      - uses: actions/setup-node@v3
        with:
          node-version: '20'
          cache: 'pnpm'

      - name: Install dependencies
        run: pnpm install

      - name: Run linter
        run: pnpm lint

      - name: Run unit tests
        run: pnpm test:coverage

      - name: Install Playwright
        run: pnpm playwright:install

      - name: Run E2E tests
        run: pnpm test:e2e

      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          files: ./coverage/lcov.info
```

## Cobertura de Código

### Objetivos de Cobertura

| Tipo | Objetivo Mínimo | Objetivo Ideal |
|------|----------------|----------------|
| Statements | 70% | 80%+ |
| Branches | 65% | 75%+ |
| Functions | 70% | 80%+ |
| Lines | 70% | 80%+ |

### Ver Reportes de Cobertura

```bash
# Generar reporte de cobertura
pnpm test:coverage

# Ver reporte HTML
# apps/web/coverage/index.html
# packages/ui/coverage/index.html
# packages/backend/coverage/index.html
```

## Troubleshooting

### Problema: Tests de Jest fallan con módulos ES

**Solución**: Verificar que `jest.config.ts` tenga la configuración correcta de `transformIgnorePatterns`.

### Problema: Playwright no encuentra elementos

**Solución**:
1. Usar `data-testid` para elementos importantes
2. Aumentar timeouts si la aplicación es lenta
3. Verificar que el servidor de desarrollo esté corriendo

### Problema: Tests de Vitest fallan con componentes React

**Solución**: Verificar que `@vitejs/plugin-react` esté instalado y configurado en `vitest.config.ts`.

## Recursos Adicionales

- [Jest Documentation](https://jestjs.io/)
- [React Testing Library](https://testing-library.com/react)
- [Vitest Documentation](https://vitest.dev/)
- [Playwright Documentation](https://playwright.dev/)
- [Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)

## Próximos Pasos

1. ✅ Configuración básica de testing
2. ✅ Tests unitarios de componentes críticos
3. ✅ Tests E2E de flujos principales
4. 🔄 Aumentar cobertura de código
5. 🔄 Integración con CI/CD
6. 📋 Tests de performance
7. 📋 Tests de accesibilidad (a11y)
8. 📋 Visual regression testing

---

**Última actualización**: Fase 9 - Testing Completo
**Mantenido por**: Equipo de Desarrollo CRM
