# Ejemplos de Testing

Esta guía proporciona ejemplos prácticos de cómo escribir tests para diferentes escenarios en el proyecto CRM.

## Tabla de Contenidos

- [Testing de Componentes React](#testing-de-componentes-react)
- [Testing de Hooks](#testing-de-hooks)
- [Testing de Lógica de Negocio](#testing-de-lógica-de-negocio)
- [Testing E2E](#testing-e2e)
- [Mocking](#mocking)
- [Testing de Formularios](#testing-de-formularios)

## Testing de Componentes React

### Componente Simple

```typescript
// components/welcome-message.tsx
interface WelcomeMessageProps {
  name: string
  isAdmin?: boolean
}

export function WelcomeMessage({ name, isAdmin }: WelcomeMessageProps) {
  return (
    <div>
      <h1>Welcome, {name}!</h1>
      {isAdmin && <p>You have admin privileges</p>}
    </div>
  )
}

// components/__tests__/welcome-message.test.tsx
import { render, screen } from '@testing-library/react'
import { WelcomeMessage } from '../welcome-message'

describe('WelcomeMessage', () => {
  it('renders welcome message with user name', () => {
    render(<WelcomeMessage name="John" />)

    expect(screen.getByText('Welcome, John!')).toBeInTheDocument()
  })

  it('shows admin message when user is admin', () => {
    render(<WelcomeMessage name="Admin" isAdmin />)

    expect(screen.getByText(/admin privileges/i)).toBeInTheDocument()
  })

  it('does not show admin message for regular users', () => {
    render(<WelcomeMessage name="User" />)

    expect(screen.queryByText(/admin privileges/i)).not.toBeInTheDocument()
  })
})
```

### Componente con Estado

```typescript
// components/counter.tsx
import { useState } from 'react'

export function Counter() {
  const [count, setCount] = useState(0)

  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={() => setCount(count + 1)}>Increment</button>
      <button onClick={() => setCount(count - 1)}>Decrement</button>
      <button onClick={() => setCount(0)}>Reset</button>
    </div>
  )
}

// components/__tests__/counter.test.tsx
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Counter } from '../counter'

describe('Counter', () => {
  it('starts at zero', () => {
    render(<Counter />)
    expect(screen.getByText('Count: 0')).toBeInTheDocument()
  })

  it('increments count when increment button is clicked', async () => {
    const user = userEvent.setup()
    render(<Counter />)

    await user.click(screen.getByRole('button', { name: /increment/i }))

    expect(screen.getByText('Count: 1')).toBeInTheDocument()
  })

  it('decrements count when decrement button is clicked', async () => {
    const user = userEvent.setup()
    render(<Counter />)

    await user.click(screen.getByRole('button', { name: /decrement/i }))

    expect(screen.getByText('Count: -1')).toBeInTheDocument()
  })

  it('resets count to zero', async () => {
    const user = userEvent.setup()
    render(<Counter />)

    await user.click(screen.getByRole('button', { name: /increment/i }))
    await user.click(screen.getByRole('button', { name: /increment/i }))
    await user.click(screen.getByRole('button', { name: /reset/i }))

    expect(screen.getByText('Count: 0')).toBeInTheDocument()
  })
})
```

### Componente con Props de Callback

```typescript
// components/search-bar.tsx
interface SearchBarProps {
  onSearch: (query: string) => void
  placeholder?: string
}

export function SearchBar({ onSearch, placeholder = 'Search...' }: SearchBarProps) {
  const [query, setQuery] = useState('')

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    onSearch(query)
  }

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={placeholder}
      />
      <button type="submit">Search</button>
    </form>
  )
}

// components/__tests__/search-bar.test.tsx
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { SearchBar } from '../search-bar'

describe('SearchBar', () => {
  it('calls onSearch with query when form is submitted', async () => {
    const onSearch = jest.fn()
    const user = userEvent.setup()

    render(<SearchBar onSearch={onSearch} />)

    await user.type(screen.getByPlaceholderText(/search/i), 'test query')
    await user.click(screen.getByRole('button', { name: /search/i }))

    expect(onSearch).toHaveBeenCalledWith('test query')
    expect(onSearch).toHaveBeenCalledTimes(1)
  })

  it('uses custom placeholder', () => {
    render(<SearchBar onSearch={jest.fn()} placeholder="Find customers..." />)

    expect(screen.getByPlaceholderText('Find customers...')).toBeInTheDocument()
  })
})
```

## Testing de Hooks

### Hook Simple

```typescript
// hooks/use-toggle.ts
import { useState, useCallback } from 'react'

export function useToggle(initialValue = false) {
  const [value, setValue] = useState(initialValue)

  const toggle = useCallback(() => setValue(v => !v), [])
  const setTrue = useCallback(() => setValue(true), [])
  const setFalse = useCallback(() => setValue(false), [])

  return { value, toggle, setTrue, setFalse }
}

// hooks/__tests__/use-toggle.test.ts
import { renderHook, act } from '@testing-library/react'
import { useToggle } from '../use-toggle'

describe('useToggle', () => {
  it('initializes with false by default', () => {
    const { result } = renderHook(() => useToggle())
    expect(result.current.value).toBe(false)
  })

  it('initializes with provided value', () => {
    const { result } = renderHook(() => useToggle(true))
    expect(result.current.value).toBe(true)
  })

  it('toggles value', () => {
    const { result } = renderHook(() => useToggle())

    act(() => {
      result.current.toggle()
    })

    expect(result.current.value).toBe(true)

    act(() => {
      result.current.toggle()
    })

    expect(result.current.value).toBe(false)
  })

  it('sets value to true', () => {
    const { result } = renderHook(() => useToggle(false))

    act(() => {
      result.current.setTrue()
    })

    expect(result.current.value).toBe(true)
  })

  it('sets value to false', () => {
    const { result } = renderHook(() => useToggle(true))

    act(() => {
      result.current.setFalse()
    })

    expect(result.current.value).toBe(false)
  })
})
```

### Hook con Dependencias Externas

```typescript
// hooks/use-local-storage.ts
import { useState, useEffect } from 'react'

export function useLocalStorage<T>(key: string, initialValue: T) {
  const [value, setValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key)
      return item ? JSON.parse(item) : initialValue
    } catch {
      return initialValue
    }
  })

  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(value))
    } catch {
      console.error('Failed to save to localStorage')
    }
  }, [key, value])

  return [value, setValue] as const
}

// hooks/__tests__/use-local-storage.test.ts
import { renderHook, act } from '@testing-library/react'
import { useLocalStorage } from '../use-local-storage'

describe('useLocalStorage', () => {
  beforeEach(() => {
    localStorage.clear()
    jest.clearAllMocks()
  })

  it('returns initial value when localStorage is empty', () => {
    const { result } = renderHook(() => useLocalStorage('test-key', 'default'))
    expect(result.current[0]).toBe('default')
  })

  it('saves value to localStorage', () => {
    const { result } = renderHook(() => useLocalStorage('test-key', 'initial'))

    act(() => {
      result.current[1]('new value')
    })

    expect(localStorage.getItem('test-key')).toBe(JSON.stringify('new value'))
    expect(result.current[0]).toBe('new value')
  })

  it('reads existing value from localStorage', () => {
    localStorage.setItem('test-key', JSON.stringify('existing'))

    const { result } = renderHook(() => useLocalStorage('test-key', 'default'))

    expect(result.current[0]).toBe('existing')
  })

  it('handles localStorage errors gracefully', () => {
    const consoleError = jest.spyOn(console, 'error').mockImplementation()
    jest.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('Storage full')
    })

    const { result } = renderHook(() => useLocalStorage('test-key', 'value'))

    act(() => {
      result.current[1]('new value')
    })

    expect(consoleError).toHaveBeenCalled()

    consoleError.mockRestore()
  })
})
```

## Testing de Lógica de Negocio

### Funciones de Utilidad

```typescript
// utils/format-currency.ts
export function formatCurrency(amount: number, currency: string = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(amount)
}

// utils/__tests__/format-currency.test.ts
import { formatCurrency } from '../format-currency'

describe('formatCurrency', () => {
  it('formats USD currency correctly', () => {
    expect(formatCurrency(1234.56)).toBe('$1,234.56')
  })

  it('formats other currencies', () => {
    expect(formatCurrency(1234.56, 'EUR')).toContain('1,234.56')
  })

  it('handles zero', () => {
    expect(formatCurrency(0)).toBe('$0.00')
  })

  it('handles negative amounts', () => {
    expect(formatCurrency(-100)).toContain('-')
  })

  it('rounds to two decimal places', () => {
    expect(formatCurrency(10.999)).toBe('$11.00')
  })
})
```

### Validaciones

```typescript
// utils/validators.ts
export const validators = {
  email: (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  },

  phone: (phone: string): boolean => {
    const phoneRegex = /^\+?[\d\s-()]+$/
    return phoneRegex.test(phone) && phone.replace(/\D/g, '').length >= 10
  },

  required: (value: string): boolean => {
    return value.trim().length > 0
  },

  minLength: (value: string, min: number): boolean => {
    return value.length >= min
  },
}

// utils/__tests__/validators.test.ts
import { validators } from '../validators'

describe('validators', () => {
  describe('email', () => {
    it('validates correct email formats', () => {
      expect(validators.email('test@example.com')).toBe(true)
      expect(validators.email('user.name@domain.co')).toBe(true)
    })

    it('rejects invalid email formats', () => {
      expect(validators.email('invalid')).toBe(false)
      expect(validators.email('@example.com')).toBe(false)
      expect(validators.email('test@')).toBe(false)
    })
  })

  describe('phone', () => {
    it('validates phone numbers', () => {
      expect(validators.phone('+1 (555) 123-4567')).toBe(true)
      expect(validators.phone('5551234567')).toBe(true)
    })

    it('rejects invalid phone numbers', () => {
      expect(validators.phone('123')).toBe(false)
      expect(validators.phone('abc')).toBe(false)
    })
  })

  describe('required', () => {
    it('validates non-empty strings', () => {
      expect(validators.required('hello')).toBe(true)
    })

    it('rejects empty strings', () => {
      expect(validators.required('')).toBe(false)
      expect(validators.required('   ')).toBe(false)
    })
  })
})
```

## Testing E2E

### Flujo de Autenticación

```typescript
// e2e/auth.spec.ts
import { test, expect } from '@playwright/test'

test.describe('Authentication Flow', () => {
  test('should sign in successfully', async ({ page }) => {
    await page.goto('/sign-in')

    await page.fill('[name="email"]', 'test@example.com')
    await page.fill('[name="password"]', 'password123')
    await page.click('button[type="submit"]')

    await expect(page).toHaveURL(/\/dashboard/)
    await expect(page.getByText(/welcome/i)).toBeVisible()
  })

  test('should show error for invalid credentials', async ({ page }) => {
    await page.goto('/sign-in')

    await page.fill('[name="email"]', 'invalid@example.com')
    await page.fill('[name="password"]', 'wrongpassword')
    await page.click('button[type="submit"]')

    await expect(page.getByText(/invalid credentials/i)).toBeVisible()
  })
})
```

### Flujo de Creación

```typescript
// e2e/create-customer.spec.ts
import { test, expect } from '@playwright/test'

test.describe('Create Customer', () => {
  test.beforeEach(async ({ page }) => {
    // Asumir autenticación previa
    await page.goto('/dashboard/customers')
  })

  test('should create a new customer', async ({ page }) => {
    await page.click('button:has-text("New Customer")')

    // Llenar formulario
    await page.fill('[name="name"]', 'John Doe')
    await page.fill('[name="email"]', 'john@example.com')
    await page.fill('[name="phone"]', '+1234567890')

    // Enviar
    await page.click('button[type="submit"]')

    // Verificar éxito
    await expect(page.getByText('Customer created successfully')).toBeVisible()
    await expect(page.getByText('John Doe')).toBeVisible()
  })

  test('should validate required fields', async ({ page }) => {
    await page.click('button:has-text("New Customer")')

    // Intentar enviar vacío
    await page.click('button[type="submit"]')

    // Verificar mensajes de error
    await expect(page.getByText(/name is required/i)).toBeVisible()
  })
})
```

## Mocking

### Mock de Convex

```typescript
// __tests__/component-with-convex.test.tsx
import { useQuery, useMutation } from 'convex/react'

jest.mock('convex/react')

const mockUseQuery = useQuery as jest.MockedFunction<typeof useQuery>
const mockUseMutation = useMutation as jest.MockedFunction<typeof useMutation>

describe('ComponentWithConvex', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('displays data from Convex', () => {
    mockUseQuery.mockReturnValue([
      { _id: '1', name: 'Item 1' },
      { _id: '2', name: 'Item 2' },
    ])

    render(<ComponentWithConvex />)

    expect(screen.getByText('Item 1')).toBeInTheDocument()
    expect(screen.getByText('Item 2')).toBeInTheDocument()
  })

  it('calls mutation on button click', async () => {
    const mockMutation = jest.fn()
    mockUseMutation.mockReturnValue(mockMutation)

    const user = userEvent.setup()
    render(<ComponentWithConvex />)

    await user.click(screen.getByRole('button', { name: /save/i }))

    expect(mockMutation).toHaveBeenCalled()
  })
})
```

### Mock de API Calls

```typescript
// __tests__/component-with-api.test.tsx
import { rest } from 'msw'
import { setupServer } from 'msw/node'

const server = setupServer(
  rest.get('/api/users', (req, res, ctx) => {
    return res(
      ctx.json([
        { id: 1, name: 'User 1' },
        { id: 2, name: 'User 2' },
      ])
    )
  })
)

beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

describe('ComponentWithAPI', () => {
  it('fetches and displays users', async () => {
    render(<ComponentWithAPI />)

    await waitFor(() => {
      expect(screen.getByText('User 1')).toBeInTheDocument()
    })
  })

  it('handles errors', async () => {
    server.use(
      rest.get('/api/users', (req, res, ctx) => {
        return res(ctx.status(500))
      })
    )

    render(<ComponentWithAPI />)

    await waitFor(() => {
      expect(screen.getByText(/error loading/i)).toBeInTheDocument()
    })
  })
})
```

## Testing de Formularios

```typescript
// components/customer-form.tsx
interface CustomerFormProps {
  onSubmit: (data: CustomerData) => void
}

export function CustomerForm({ onSubmit }: CustomerFormProps) {
  const [errors, setErrors] = useState({})

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    // Validación y envío
  }

  return (
    <form onSubmit={handleSubmit}>
      <input name="name" required />
      {errors.name && <span role="alert">{errors.name}</span>}

      <input name="email" type="email" required />
      {errors.email && <span role="alert">{errors.email}</span>}

      <button type="submit">Save</button>
    </form>
  )
}

// components/__tests__/customer-form.test.tsx
describe('CustomerForm', () => {
  it('submits form with valid data', async () => {
    const onSubmit = jest.fn()
    const user = userEvent.setup()

    render(<CustomerForm onSubmit={onSubmit} />)

    await user.type(screen.getByLabelText(/name/i), 'John Doe')
    await user.type(screen.getByLabelText(/email/i), 'john@example.com')
    await user.click(screen.getByRole('button', { name: /save/i }))

    expect(onSubmit).toHaveBeenCalledWith({
      name: 'John Doe',
      email: 'john@example.com',
    })
  })

  it('shows validation errors', async () => {
    const user = userEvent.setup()
    render(<CustomerForm onSubmit={jest.fn()} />)

    await user.click(screen.getByRole('button', { name: /save/i }))

    expect(screen.getByRole('alert')).toHaveTextContent(/required/i)
  })

  it('validates email format', async () => {
    const user = userEvent.setup()
    render(<CustomerForm onSubmit={jest.fn()} />)

    await user.type(screen.getByLabelText(/email/i), 'invalid-email')
    await user.click(screen.getByRole('button', { name: /save/i }))

    expect(screen.getByRole('alert')).toHaveTextContent(/invalid email/i)
  })
})
```

---

**Nota**: Estos son ejemplos de referencia. Adapta los tests a las necesidades específicas de tu código.
