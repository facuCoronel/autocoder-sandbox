import '@testing-library/jest-dom/vitest'
import { render, screen, waitFor } from '@testing-library/react'
import HealthStatus from './HealthStatus'
import { describe, test, expect, afterEach, vi } from 'vitest'

describe('HealthStatus component', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  test('shows loading state initially', () => {
    render(<HealthStatus />)
    const loading = screen.getByRole('status')
    expect(loading).toHaveTextContent('Loading health status...')
  })

  test('shows online state when health endpoint returns ok', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ status: 'ok' })
    })
    vi.stubGlobal('fetch', mockFetch)
    render(<HealthStatus />)
    await waitFor(() => expect(screen.getByRole('status')).toHaveTextContent('Service is online'))
    expect(mockFetch).toHaveBeenCalledWith('/api/health')
  })

  test('shows error state when fetch fails', async () => {
    const mockFetch = vi.fn().mockRejectedValue(new Error('network'))
    vi.stubGlobal('fetch', mockFetch)
    render(<HealthStatus />)
    await waitFor(() => {
      const alerts = screen.getAllByRole('alert')
      expect(alerts[0]).toHaveTextContent('Service unavailable')
    })
    expect(mockFetch).toHaveBeenCalledWith('/api/health')
  })
})
