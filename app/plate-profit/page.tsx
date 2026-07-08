import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import AppShell from '@/components/layout/AppShell'
import PlateProfitForm from '@/components/tools/PlateProfitForm'
import { LIMITS } from '@/types'

export default async function PlateProfitPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('tier, costing_count')
    .eq('id', user.id)
    .single()

  const tier = (profile?.tier ?? 'free') as 'free' | 'pro'
  const costingCount = profile?.costing_count ?? 0
  const limit = LIMITS[tier].costings
  const canCost = costingCount < limit

  return (
    <AppShell userEmail={user.email}>
      <div className="mb-6">
        <div className="eyebrow green mb-2">Plate Profit</div>
        <h1 className="font-serif text-[28px] md:text-[32px] text-ink">Cost a dish</h1>
      </div>

      {tier === 'free' && (
        <div className="flex items-center justify-between bg-cream border border-border
                        rounded-[10px] px-4 py-2.5 mb-5 text-[12px]">
          <span className="text-muted">
            You have <span className="font-bold text-ink">{Math.max(limit - costingCount, 0)}</span> free costings remaining.
          </span>
          {!canCost && (
            <a href="/account" className="text-orange font-bold hover:underline">Unlock Unlimited →</a>
          )}
        </div>
      )}

      <PlateProfitForm canCost={canCost} usageCount={costingCount} />
    </AppShell>
  )
}
