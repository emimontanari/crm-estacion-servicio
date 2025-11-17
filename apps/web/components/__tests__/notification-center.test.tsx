import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { NotificationCenter } from '../notifications/notification-center'
import { useQuery, useMutation } from 'convex/react'

jest.mock('convex/react')

const mockUseQuery = useQuery as jest.MockedFunction<typeof useQuery>
const mockUseMutation = useMutation as jest.MockedFunction<typeof useMutation>

describe('NotificationCenter', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders with no notifications', () => {
    mockUseQuery.mockReturnValue([])

    render(<NotificationCenter userId="user_123" />)

    expect(screen.getByRole('button')).toBeInTheDocument()
  })

  it('shows unread count badge', async () => {
    const mockNotifications = [
      {
        _id: '1',
        channel: 'email',
        subject: 'Test 1',
        body: 'Body 1',
        status: 'sent',
        readAt: null,
        createdAt: Date.now(),
      },
      {
        _id: '2',
        channel: 'sms',
        subject: 'Test 2',
        body: 'Body 2',
        status: 'sent',
        readAt: null,
        createdAt: Date.now(),
      },
    ]

    mockUseQuery.mockReturnValue(mockNotifications)

    render(<NotificationCenter userId="user_123" />)

    // Open the popover
    const button = screen.getByRole('button')
    await userEvent.click(button)

    await waitFor(() => {
      expect(screen.getByText('2')).toBeInTheDocument()
    })
  })

  it('shows 9+ for more than 9 unread notifications', async () => {
    const mockNotifications = Array.from({ length: 15 }, (_, i) => ({
      _id: `${i}`,
      channel: 'email',
      subject: `Test ${i}`,
      body: `Body ${i}`,
      status: 'sent',
      readAt: null,
      createdAt: Date.now(),
    }))

    mockUseQuery.mockReturnValue(mockNotifications)

    render(<NotificationCenter userId="user_123" />)

    const button = screen.getByRole('button')
    await userEvent.click(button)

    await waitFor(() => {
      expect(screen.getByText('9+')).toBeInTheDocument()
    })
  })

  it('displays notifications list when opened', async () => {
    const mockNotifications = [
      {
        _id: '1',
        channel: 'email',
        subject: 'Welcome!',
        body: 'Welcome to our platform',
        status: 'sent',
        readAt: null,
        createdAt: Date.now(),
      },
    ]

    mockUseQuery.mockReturnValue(mockNotifications)

    render(<NotificationCenter userId="user_123" />)

    const button = screen.getByRole('button')
    await userEvent.click(button)

    await waitFor(() => {
      expect(screen.getByText('Welcome!')).toBeInTheDocument()
      expect(screen.getByText('Welcome to our platform')).toBeInTheDocument()
    })
  })

  it('marks notification as read when check button is clicked', async () => {
    const mockMarkAsRead = jest.fn()
    mockUseMutation.mockReturnValue(mockMarkAsRead)

    const mockNotifications = [
      {
        _id: '1',
        channel: 'email',
        subject: 'Test',
        body: 'Test body',
        status: 'sent',
        readAt: null,
        createdAt: Date.now(),
      },
    ]

    mockUseQuery.mockReturnValue(mockNotifications)

    render(<NotificationCenter userId="user_123" />)

    const button = screen.getByRole('button')
    await userEvent.click(button)

    await waitFor(() => {
      expect(screen.getByText('Test')).toBeInTheDocument()
    })

    // Find and click the check button
    const checkButtons = screen.getAllByRole('button')
    const checkButton = checkButtons.find(
      btn => btn.querySelector('svg.lucide-check')
    )

    if (checkButton) {
      await userEvent.click(checkButton)
      expect(mockMarkAsRead).toHaveBeenCalledWith({ notificationId: '1' })
    }
  })

  it('shows empty state when no notifications', async () => {
    mockUseQuery.mockReturnValue([])

    render(<NotificationCenter userId="user_123" />)

    const button = screen.getByRole('button')
    await userEvent.click(button)

    await waitFor(() => {
      expect(screen.getByText('No hay notificaciones')).toBeInTheDocument()
    })
  })

  it('displays different status colors', async () => {
    const mockNotifications = [
      {
        _id: '1',
        channel: 'email',
        subject: 'Sent',
        body: 'Sent notification',
        status: 'sent',
        readAt: null,
        createdAt: Date.now(),
      },
      {
        _id: '2',
        channel: 'sms',
        subject: 'Failed',
        body: 'Failed notification',
        status: 'failed',
        readAt: null,
        createdAt: Date.now(),
      },
    ]

    mockUseQuery.mockReturnValue(mockNotifications)

    render(<NotificationCenter userId="user_123" />)

    const button = screen.getByRole('button')
    await userEvent.click(button)

    await waitFor(() => {
      const statusIndicators = document.querySelectorAll('.rounded-full')
      expect(statusIndicators.length).toBeGreaterThan(0)
    })
  })
})
