// Fire-and-forget event tracking. Never throws, never blocks the UI —
// if the events table doesn't exist yet or the request fails, tracking
// is silently skipped rather than breaking anything.
export function track(event: string, meta?: Record<string, any>) {
  try {
    fetch('/api/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ event, meta }),
      keepalive: true,
    }).catch(() => {})
  } catch {
    // ignore
  }
}
