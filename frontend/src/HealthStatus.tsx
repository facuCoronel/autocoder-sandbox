import { useEffect, useState } from 'react'

type HealthStatus = 'loading' | 'online' | 'error'

export default function HealthStatusComponent() {
  const [status, setStatus] = useState<HealthStatus>('loading')

  useEffect(() => {
    fetch('/api/health')
      .then(async (res) => {
        if (!res.ok) throw new Error('Network response not ok')
        const data = await res.json()
        if (data.status === 'ok') {
          setStatus('online')
        } else {
          setStatus('error')
        }
      })
      .catch(() => setStatus('error'))
  }, [])

  if (status === 'loading') {
    return <p role="status">Loading health status...</p>
  }
  if (status === 'online') {
    return <p role="status">Service is online</p>
  }
  return <p role="alert">Service unavailable</p>
}
