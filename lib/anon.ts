import { cookies } from 'next/headers'
import { createClient } from '@/lib/supabase/server'

export const ANON_COOKIE = 'st_anon_id'

export function getAnonId(): string | null {
  return cookies().get(ANON_COOKIE)?.value ?? null
}

export async function getAnonUsage(anonId: string | null) {
  if (!anonId) return { recipe_used: false, costing_used: false }
  const supabase = createClient()
  const { data } = await supabase
    .from('anon_usage')
    .select('recipe_used, costing_used')
    .eq('anon_id', anonId)
    .single()
  return { recipe_used: data?.recipe_used ?? false, costing_used: data?.costing_used ?? false }
}

export async function markAnonUsed(anonId: string, field: 'recipe_used' | 'costing_used') {
  const supabase = createClient()
  await supabase.from('anon_usage').upsert(
    { anon_id: anonId, [field]: true },
    { onConflict: 'anon_id' }
  )
}
