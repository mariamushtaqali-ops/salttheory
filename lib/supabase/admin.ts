import { createClient as createSupabaseClient } from '@supabase/supabase-js'

// Service-role client — bypasses RLS. Only use this for server-side code
// that has no user session to act as (e.g. webhook handlers), and only
// ever update the specific row you've already identified and verified.
// Never expose this client or the service role key to the browser.
export function createAdminClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}
