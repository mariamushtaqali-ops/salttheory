import { createClient } from '@/lib/supabase/server'

// Simple fixed-window rate limiter backed by Supabase.
// Fails OPEN (never blocks real traffic) if the check itself errors —
// a broken rate limiter should never take down a working feature.
export async function isRateLimited(
  identifier: string,
  limit: number,
  windowMinutes: number
): Promise<boolean> {
  try {
    const supabase = createClient()
    const windowMs = windowMinutes * 60 * 1000
    const windowStart = new Date(Math.floor(Date.now() / windowMs) * windowMs).toISOString()

    const { data: existing } = await supabase
      .from('rate_limits')
      .select('count')
      .eq('key', identifier)
      .eq('window_start', windowStart)
      .single()

    if (existing) {
      if (existing.count >= limit) return true
      await supabase
        .from('rate_limits')
        .update({ count: existing.count + 1 })
        .eq('key', identifier)
        .eq('window_start', windowStart)
      return false
    }

    await supabase
      .from('rate_limits')
      .insert({ key: identifier, window_start: windowStart, count: 1 })
    return false
  } catch (e) {
    console.error('Rate limit check failed (failing open):', e)
    return false
  }
}

export function getClientIp(req: Request): string {
  const forwarded = req.headers.get('x-forwarded-for')
  return forwarded ? forwarded.split(',')[0].trim() : 'unknown'
}
