import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import AppShell from '@/components/layout/AppShell'
import Link from 'next/link'
import { LIMITS } from '@/types'

export default async function DashboardPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  const { data: recentRecipes } = await supabase
    .from('recipes')
    .select('id, dish_name, created_at')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(3)

  const { data: recentCostings } = await supabase
    .from('costings')
    .select('id, dish_name, margin_pct, created_at')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(3)

  const tier = profile?.tier ?? 'free'
  const limits = LIMITS[tier as 'free' | 'pro']
  const recipeCount = profile?.recipe_count ?? 0
  const costingCount = profile?.costing_count ?? 0
  const firstName = profile?.first_name ?? user.email?.split('@')[0] ?? 'there'

  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'

  function timeAgo(date: string) {
    const diff = Date.now() - new Date(date).getTime()
    const mins = Math.floor(diff / 60000)
    if (mins < 60) return `${mins}m ago`
    const hrs = Math.floor(mins / 60)
    if (hrs < 24) return `${hrs}h ago`
    return `${Math.floor(hrs / 24)}d ago`
  }

  // Merge and sort recent activity
  const activity = [
    ...(recentRecipes ?? []).map(r => ({ type: 'recipe' as const, name: r.dish_name, meta: `Recipe Studio · ${timeAgo(r.created_at)}`, id: r.id })),
    ...(recentCostings ?? []).map(c => ({ type: 'costing' as const, name: `${c.dish_name} — ${c.margin_pct}% margin`, meta: `Plate Profit · ${timeAgo(c.created_at)}`, id: c.id })),
  ].slice(0, 5)

  return (
    <AppShell userEmail={user.email}>
      {/* Greeting */}
      <div className="mb-6">
        <p className="text-[11px] font-semibold uppercase tracking-[0.06em] text-muted mb-1">{greeting}</p>
        <h1 className="font-serif text-[28px] md:text-[32px] text-ink">
          Welcome back, <em className="text-orange not-italic">{firstName}</em>
        </h1>
      </div>

      {/* Usage */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        {[
          { label: 'Recipes', count: recipeCount, limit: limits.recipes, color: 'bg-orange' },
          { label: 'Costings', count: costingCount, limit: limits.costings, color: 'bg-green' },
        ].map(stat => (
          <div key={stat.label} className="card p-4">
            <div className="flex justify-between items-center mb-2.5">
              <span className="text-[11px] font-bold uppercase tracking-[0.07em] text-muted">{stat.label}</span>
              <span className="text-[10px] text-orange font-bold">
                {tier === 'free' ? `${stat.limit} free` : 'Unlimited'}
              </span>
            </div>
            <div className="flex items-baseline gap-1 mb-2">
              <span className="font-serif text-[36px] text-ink leading-none">{stat.count}</span>
              {tier === 'free' && <span className="text-[13px] text-muted">/ {stat.limit}</span>}
            </div>
            {tier === 'free' && (
              <div className="usage-bar">
                <div
                  className={`usage-bar-fill ${stat.color}`}
                  style={{ width: `${Math.min((stat.count / (stat.limit as number)) * 100, 100)}%` }}
                />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Upgrade banner — only for free users */}
      {tier === 'free' && (
        <div className="bg-ink rounded-[14px] p-4 mb-5 flex items-center justify-between gap-4">
          <div>
            <p className="text-[13px] font-bold text-white mb-0.5">
              {limits.recipes - recipeCount} recipes left this month
            </p>
            <p className="text-[12px] text-white/40 leading-relaxed">
              Unlimited recipes + costings + PDF export — PKR 999/mo
            </p>
          </div>
          <Link
            href="/account"
            className="bg-orange text-white text-[12px] font-bold px-4 py-2
                       rounded-full flex-shrink-0 hover:bg-[#C85A2C] transition-colors"
          >
            Unlock Unlimited ✦
          </Link>
        </div>
      )}

      {/* Tools */}
      <p className="section-label text-[10px] font-bold uppercase tracking-[0.1em] text-muted mb-2.5">Your modules</p>
      <div className="grid grid-cols-2 gap-3 mb-5">
        <Link href="/recipe-gennie" className="card p-4 relative overflow-hidden hover:-translate-y-1 hover:shadow-lg transition-all">
          <div className="absolute top-0 left-0 right-0 h-[3px] bg-orange" />
          <h3 className="font-serif text-[18px] mb-1">Recipe Studio</h3>
          <p className="text-[12px] text-muted leading-relaxed mb-3">Generate any recipe, any cuisine</p>
          <span className="text-[12px] font-bold text-orange">Create Recipe ✦</span>
        </Link>
        <Link href="/plate-profit" className="card p-4 relative overflow-hidden hover:-translate-y-1 hover:shadow-lg transition-all">
          <div className="absolute top-0 left-0 right-0 h-[3px] bg-green" />
          <h3 className="font-serif text-[18px] mb-1">Plate Profit</h3>
          <p className="text-[12px] text-muted leading-relaxed mb-3">Cost a dish, know your margin</p>
          <span className="text-[12px] font-bold text-green">Cost My Dish ✦</span>
        </Link>
      </div>

      {/* Recent activity */}
      {activity.length > 0 && (
        <>
          <p className="section-label text-[10px] font-bold uppercase tracking-[0.1em] text-muted mb-2.5">Recent work</p>
          <div className="space-y-2">
            {activity.map((item, i) => (
              <div key={i} className="card px-4 py-3 flex items-center gap-3 hover:border-orange transition-colors cursor-pointer">
                <div className={`w-2 h-2 rounded-full flex-shrink-0 ${item.type === 'recipe' ? 'bg-orange' : 'bg-green'}`} />
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-semibold text-ink truncate">{item.name}</p>
                  <p className="text-[11px] text-muted mt-0.5">{item.meta}</p>
                </div>
                <span className="text-muted/50 text-base">›</span>
              </div>
            ))}
          </div>
        </>
      )}

      {activity.length === 0 && (
        <div className="card border-dashed p-8 text-center">
          <p className="font-serif text-[18px] text-ink mb-1">Start cooking</p>
          <p className="text-[13px] text-muted">Generate your first recipe or cost your first dish</p>
        </div>
      )}
    </AppShell>
  )
}
