import { render, screen } from '@testing-library/react'
import { StatCard } from '../stat-card'
import { describe, it, expect } from 'vitest'
import { DollarSign } from 'lucide-react'

describe('StatCard', () => {
  it('renders title and value', () => {
    render(<StatCard title="Total Revenue" value="$12,345" />)

    expect(screen.getByText('Total Revenue')).toBeInTheDocument()
    expect(screen.getByText('$12,345')).toBeInTheDocument()
  })

  it('renders with description', () => {
    render(
      <StatCard
        title="Active Users"
        value={1234}
        description="from last month"
      />
    )

    expect(screen.getByText('Active Users')).toBeInTheDocument()
    expect(screen.getByText('1234')).toBeInTheDocument()
    expect(screen.getByText('from last month')).toBeInTheDocument()
  })

  it('renders with icon', () => {
    render(
      <StatCard
        title="Revenue"
        value="$50,000"
        icon={DollarSign}
      />
    )

    expect(screen.getByText('Revenue')).toBeInTheDocument()
    // Icon is rendered as SVG
    const svg = document.querySelector('svg')
    expect(svg).toBeInTheDocument()
  })

  it('renders positive trend correctly', () => {
    render(
      <StatCard
        title="Sales"
        value={150}
        trend={{ value: 12.5, label: 'vs last week' }}
      />
    )

    expect(screen.getByText('+12.5%')).toBeInTheDocument()
    expect(screen.getByText('vs last week')).toBeInTheDocument()
    expect(screen.getByText('+12.5%')).toHaveClass('text-green-600')
  })

  it('renders negative trend correctly', () => {
    render(
      <StatCard
        title="Conversions"
        value={80}
        trend={{ value: -5.2 }}
      />
    )

    expect(screen.getByText('-5.2%')).toBeInTheDocument()
    expect(screen.getByText('-5.2%')).toHaveClass('text-red-600')
  })

  it('renders zero trend correctly', () => {
    render(
      <StatCard
        title="Orders"
        value={100}
        trend={{ value: 0 }}
      />
    )

    expect(screen.getByText('0%')).toBeInTheDocument()
    expect(screen.getByText('0%')).toHaveClass('text-gray-600')
  })

  it('shows loading state', () => {
    render(<StatCard title="Loading Data" value="0" loading />)

    expect(screen.getByText('Loading Data')).toBeInTheDocument()
    // Value should not be visible when loading
    expect(screen.queryByText('0')).not.toBeInTheDocument()
    // Should show loading skeletons
    const loadingElements = document.querySelectorAll('.animate-pulse')
    expect(loadingElements.length).toBeGreaterThan(0)
  })

  it('applies custom className', () => {
    const { container } = render(
      <StatCard
        title="Test"
        value="123"
        className="custom-class"
      />
    )

    const card = container.querySelector('.custom-class')
    expect(card).toBeInTheDocument()
  })
})
