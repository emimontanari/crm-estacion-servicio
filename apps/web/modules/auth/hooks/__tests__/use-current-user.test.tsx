import { renderHook } from '@testing-library/react'
import { useCurrentUser } from '../use-current-user'
import { useQuery } from 'convex/react'
import { useAuth } from '@clerk/nextjs'

// Mocks are defined in jest.setup.ts, but we'll override them here for specific tests
jest.mock('convex/react')
jest.mock('@clerk/nextjs')

const mockUseQuery = useQuery as jest.MockedFunction<typeof useQuery>
const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>

describe('useCurrentUser', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('returns loading state when not loaded', () => {
    mockUseAuth.mockReturnValue({
      userId: null,
      orgId: null,
      isLoaded: false,
    } as any)

    mockUseQuery.mockReturnValue(undefined)

    const { result } = renderHook(() => useCurrentUser())

    expect(result.current.isLoading).toBe(true)
    expect(result.current.isAuthenticated).toBe(false)
  })

  it('returns authenticated user with admin role', () => {
    mockUseAuth.mockReturnValue({
      userId: 'user_123',
      orgId: 'org_456',
      isLoaded: true,
    } as any)

    // Mock user data
    mockUseQuery
      .mockReturnValueOnce({
        _id: 'user_123',
        email: 'admin@example.com',
        name: 'Admin User',
      })
      .mockReturnValueOnce({
        role: 'admin',
        permissions: {
          canManageUsers: true,
          canManageProducts: true,
          canManageCustomers: true,
          canProcessSales: true,
          canViewReports: true,
          canManageSettings: true,
          canManageOrganization: true,
        },
      })

    const { result } = renderHook(() => useCurrentUser())

    expect(result.current.isLoading).toBe(false)
    expect(result.current.isAuthenticated).toBe(true)
    expect(result.current.hasOrganization).toBe(true)
    expect(result.current.role).toBe('admin')
    expect(result.current.isAdmin).toBe(true)
    expect(result.current.isManager).toBe(true)
    expect(result.current.isCashier).toBe(true)
    expect(result.current.canManageUsers).toBe(true)
  })

  it('returns manager permissions correctly', () => {
    mockUseAuth.mockReturnValue({
      userId: 'user_123',
      orgId: 'org_456',
      isLoaded: true,
    } as any)

    mockUseQuery
      .mockReturnValueOnce({ _id: 'user_123' })
      .mockReturnValueOnce({
        role: 'manager',
        permissions: {
          canManageUsers: false,
          canManageProducts: true,
          canManageCustomers: true,
          canProcessSales: true,
          canViewReports: true,
          canManageSettings: false,
          canManageOrganization: false,
        },
      })

    const { result } = renderHook(() => useCurrentUser())

    expect(result.current.role).toBe('manager')
    expect(result.current.isAdmin).toBe(false)
    expect(result.current.isManager).toBe(true)
    expect(result.current.isCashier).toBe(true)
    expect(result.current.canManageUsers).toBe(false)
    expect(result.current.canManageProducts).toBe(true)
  })

  it('returns cashier permissions correctly', () => {
    mockUseAuth.mockReturnValue({
      userId: 'user_123',
      orgId: 'org_456',
      isLoaded: true,
    } as any)

    mockUseQuery
      .mockReturnValueOnce({ _id: 'user_123' })
      .mockReturnValueOnce({
        role: 'cashier',
        permissions: {
          canManageUsers: false,
          canManageProducts: false,
          canManageCustomers: true,
          canProcessSales: true,
          canViewReports: false,
          canManageSettings: false,
          canManageOrganization: false,
        },
      })

    const { result } = renderHook(() => useCurrentUser())

    expect(result.current.role).toBe('cashier')
    expect(result.current.isAdmin).toBe(false)
    expect(result.current.isManager).toBe(false)
    expect(result.current.isCashier).toBe(true)
    expect(result.current.canProcessSales).toBe(true)
  })

  it('returns viewer permissions correctly', () => {
    mockUseAuth.mockReturnValue({
      userId: 'user_123',
      orgId: 'org_456',
      isLoaded: true,
    } as any)

    mockUseQuery
      .mockReturnValueOnce({ _id: 'user_123' })
      .mockReturnValueOnce({
        role: 'viewer',
        permissions: {
          canManageUsers: false,
          canManageProducts: false,
          canManageCustomers: false,
          canProcessSales: false,
          canViewReports: true,
          canManageSettings: false,
          canManageOrganization: false,
        },
      })

    const { result } = renderHook(() => useCurrentUser())

    expect(result.current.role).toBe('viewer')
    expect(result.current.isViewer).toBe(true)
    expect(result.current.canViewReports).toBe(true)
    expect(result.current.canProcessSales).toBe(false)
  })

  it('handles unauthenticated user', () => {
    mockUseAuth.mockReturnValue({
      userId: null,
      orgId: null,
      isLoaded: true,
    } as any)

    mockUseQuery.mockReturnValue(undefined)

    const { result } = renderHook(() => useCurrentUser())

    expect(result.current.isAuthenticated).toBe(false)
    expect(result.current.hasOrganization).toBe(false)
    expect(result.current.user).toBeUndefined()
    expect(result.current.permissions).toBeUndefined()
  })
})
