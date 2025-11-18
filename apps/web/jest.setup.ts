import '@testing-library/jest-dom'

// Mock environment variables for testing
process.env.NEXT_PUBLIC_CONVEX_URL = 'https://test.convex.cloud'
process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY = 'pk_test_mock'
process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY = 'pk_test_mock'

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
    back: jest.fn(),
  }),
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams(),
}))

// Mock Clerk
jest.mock('@clerk/nextjs', () => ({
  useUser: () => ({
    user: {
      id: 'user_test123',
      emailAddresses: [{ emailAddress: 'test@example.com' }],
      fullName: 'Test User',
    },
    isLoaded: true,
    isSignedIn: true,
  }),
  useOrganization: () => ({
    organization: {
      id: 'org_test123',
      name: 'Test Organization',
    },
    isLoaded: true,
  }),
  ClerkProvider: ({ children }: { children: React.ReactNode }) => children,
  SignedIn: ({ children }: { children: React.ReactNode }) => children,
  SignedOut: () => null,
  UserButton: () => null,
  OrganizationSwitcher: () => null,
}))

// Mock Convex
jest.mock('convex/react', () => ({
  useQuery: jest.fn(),
  useMutation: jest.fn(),
  useAction: jest.fn(),
  ConvexProvider: ({ children }: { children: React.ReactNode }) => children,
  ConvexReactClient: jest.fn(() => ({})),
}))

// Mock Recharts to avoid canvas issues in tests
jest.mock('recharts', () => ({
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => children,
  LineChart: () => null,
  BarChart: () => null,
  PieChart: () => null,
  AreaChart: () => null,
  Line: () => null,
  Bar: () => null,
  Pie: () => null,
  Area: () => null,
  XAxis: () => null,
  YAxis: () => null,
  CartesianGrid: () => null,
  Tooltip: () => null,
  Legend: () => null,
  Cell: () => null,
}))
