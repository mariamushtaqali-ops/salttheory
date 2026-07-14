import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import AppShell from '@/components/layout/AppShell'
import GettingStartedChecklist from '@/components/dashboard/GettingStartedChecklist'
import Link from 'next/link'
import { LIMITS } from '@/types'

// ── Rotating message pools ──────────────────────────────
// Deterministic per day + per user, so the message feels intentional
// rather than jittery on every refresh, but still varies day to day.
const GREETINGS: ((name: string) => string)[] = [
  name => `Good morning, ${name}. Let's build something profitable today.`,
  () => `Every great restaurant begins with one well-costed recipe.`,
  () => `Consistency creates profit. Let's continue building your system.`,
  name => `Welcome back, ${name}.`,
  () => `Small systems, run consistently, build big businesses.`,
  name => `${name}, what are we costing today?`,
  () => `Your recipes are worth documenting properly.`,
  () => `Profit is a decision, not an accident.`,
  () => `Let's turn today's cooking into tomorrow's margin.`,
  name => `Good to see you, ${name}.`,
  () => `A well-priced dish is a well-run business.`,
  () => `Systems today. Growth tomorrow.`,
  name => `${name}, ready to build on what you started?`,
  () => `The best kitchens run on documented recipes.`,
  () => `Let's keep your numbers honest today.`,
  () => `Margins matter more than guesses.`,
  () => `Welcome back — your system is waiting.`,
  () => `One dish, priced right, changes everything.`,
  name => `${name}, let's make today count.`,
  () => `Great businesses don't guess. They document.`,
]

const REMINDERS: string[] = [
  `Great businesses don't guess.\nDocument recipes. Know your margins. Build systems.`,
  `The businesses that scale are the ones that write things down.`,
  `A recipe you can't repeat isn't a recipe — it's a memory.`,
  `Margins protect you when ingredient prices don't.`,
  `Systems outlast people. Build yours early.`,
  `Small, consistent documentation beats big, occasional effort.`,
]

function dayOfYear(d: Date) {
  const start = new Date(d.getFullYear(), 0, 0)
  return Math.floor((d.getTime() - start.getTime()) / 86400000)
}

function userSeed(id: string) {
  let sum = 0
  for (let i = 0; i < id.length; i++) sum += id.charCodeAt(i)
  return sum
}

function pick<T>(arr: T[], seed: number) {
  return arr[((seed % arr.length) + arr.length) % arr.length]
}

// ── Small line-art icons matching the homepage illustration style ──
function NotebookIcon() {
  return (
    <svg viewBox="0 0 64 64" className="w-11 h-11 mx-auto" fill="none">
      <rect x="14" y="10" width="36" height="44" rx="3" stroke="#E96B3C" strokeWidth="2"/>
      <line x1="14" y1="18" x2="50" y2="18" stroke="#E96B3C" strokeWidth="1.5"/>
      <line x1="22" y1="26" x2="42" y2="26" stroke="#E96B3C" strokeWidth="1.2"/>
      <line x1="22" y1="32" x2="42" y2="32" stroke="#E96B3C" strokeWidth="1.2"/>
      <line x1="22" y1="38" x2="36" y2="38" stroke="#E96B3C" strokeWidth="1.2"/>
    </svg>
  )
}
function ClipboardIcon() {
  return (
    <svg viewBox="0 0 64 64" className="w-11 h-11 mx-auto" fill="none">
      <rect x="16" y="12" width="32" height="42" rx="3" stroke="#7A8B5C" strokeWidth="2"/>
      <rect x="24" y="8" width="16" height="8" rx="2" stroke="#7A8B5C" strokeWidth="2"/>
      <line x1="22" y1="27" x2="42" y2="27" stroke="#7A8B5C" strokeWidth="1.2"/>
      <line x1="22" y1="34" x2="34" y2="34" stroke="#7A8B5C" strokeWidth="1.2"/>
      <line x1="22" y1="41" x2="42" y2="41" stroke="#7A8B5C" strokeWidth="1.2"/>
    </svg>
  )
}
function ShelfIcon() {
  return (
    <svg viewBox="0 0 64 64" className="w-11 h-11 mx-auto" fill="none">
      <line x1="8" y1="46" x2="56" y2="46" stroke="#9B6A45" strokeWidth="2"/>
      <path d="M12 46V32a2 2 0 0 1 2-2h10l3 4h15a2 2 0 0 1 2 2v10H12z" stroke="#9B6A45" strokeWidth="1.5" strokeLinejoin="round"/>
      <path d="M34 46V28a2 2 0 0 1 2-2h8l2 3h6a2 2 0 0 1 2 2v15" stroke="#9B6A45" strokeWidth="1.5" strokeLinejoin="round"/>
    </svg>
  )
}

const COMING_SOON_MODULES = ['Weekly Dashboard', 'Profit Leak Audit', 'SOP Builder', 'Training Manuals', 'Business Blueprint']

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
  const profileComplete = !!(profile?.last_name && profile?.role)
  const isFirstTimeUser = recipeCount === 0 && costingCount === 0

  const seed = dayOfYear(new Date()) + userSeed(user.id)
  const greeting = pick(GREETINGS, seed)(firstName)
  const reminder = pick(REMINDERS, seed + 3)

  function timeAgo(date: string) {
    const diff = Date.now() - new Date(date).getTime()
    const mins = Math.floor(diff / 60000)
    if (mins < 60) return `${mins}m ago`
    const hrs = Math.floor(mins / 60)
    if (hrs < 24) return `${hrs}h ago`
    return `${Math.floor(hrs / 24)}d ago`
  }

  const activity = [
    ...(recentRecipes ?? []).map(r => ({ type: 'recipe' as const, name: r.dish_name, meta: `Recipe Studio · ${timeAgo(r.created_at)}`, id: r.id })),
    ...(recentCostings ?? []).map(c => ({ type: 'costing' as const, name: `${c.dish_name} — ${c.margin_pct}% margin`, meta: `Plate Profit · ${timeAgo(c.created_at)}`, id: c.id })),
  ].slice(0, 5)

  return (
    <AppShell userEmail={user.email}>

      {/* ── Greeting ─────────────────────────────────────── */}
      {isFirstTimeUser ? (
        <div className="mb-6">
          <p className="text-[11px] font-semibold uppercase tracking-[0.06em] text-muted mb-1">Welcome</p>
          <h1 className="font-serif text-[28px] md:text-[32px] text-ink mb-2">
            Welcome to <em className="text-orange not-italic">Salt Theory</em>
          </h1>
          <p className="text-[14px] text-muted leading-relaxed mb-5 max-w-[440px]">
            Let's build your first profitable dish. This only takes about 2 minutes.
          </p>
          <div className="flex gap-3 flex-wrap mb-2">
            <Link href="/plate-profit" className="btn-primary px-6 py-3 text-[13px]">
              Start with Plate Profit
            </Link>
            <Link href="/recipe-gennie" className="btn-secondary px-6 py-3 text-[13px]">
              Explore Recipe Studio
            </Link>
          </div>
          <p className="text-[11px] text-muted">No setup required. We'll guide you as you go.</p>
        </div>
      ) : (
        <div className="mb-6">
          <p className="text-[11px] font-semibold uppercase tracking-[0.06em] text-muted mb-1">
            {new Date().getHours() < 12 ? 'Good morning' : new Date().getHours() < 17 ? 'Good afternoon' : 'Good evening'}
          </p>
          <h1 className="font-serif text-[24px] md:text-[28px] text-ink leading-snug">{greeting}</h1>
        </div>
      )}

      {/* ── Today's Reminder ─────────────────────────────── */}
      <div className="bg-cream border border-border rounded-[10px] px-4 py-3 mb-5">
        <p className="text-[10px] font-bold uppercase tracking-wide text-muted/60 mb-1">Today's reminder</p>
        <p className="text-[12px] text-muted leading-relaxed whitespace-pre-line">{reminder}</p>
      </div>

      {/* ── Getting Started checklist ────────────────────── */}
      <GettingStartedChecklist
        costingDone={costingCount > 0}
        recipeDone={recipeCount > 0}
        profileDone={profileComplete}
      />

      {/* ── Usage — hidden until user has done something ─── */}
      {!isFirstTimeUser && (
        <div className="grid grid-cols-2 gap-3 mb-4">
          {[
            { label: 'Recipes', count: recipeCount, limit: limits.recipes, color: 'bg-orange', proLabel: 'Pro' },
            { label: 'Costings', count: costingCount, limit: limits.costings, color: 'bg-green', proLabel: 'Unlimited' },
          ].map(stat => (
            <div key={stat.label} className="card p-4">
              <div className="flex justify-between items-center mb-2.5">
                <span className="text-[11px] font-bold uppercase tracking-[0.07em] text-muted">{stat.label}</span>
                <span className="text-[10px] text-orange font-bold">
                  {tier === 'free' ? `${stat.limit} free` : stat.proLabel}
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
      )}

      {/* ── Upgrade banner — free users, once they've done something ── */}
      {tier === 'free' && !isFirstTimeUser && (
        <div className="bg-ink rounded-[14px] p-4 mb-5 flex items-center justify-between gap-4">
          <div>
            <p className="text-[13px] font-bold text-white mb-0.5">
              {limits.recipes - recipeCount} recipes left this month
            </p>
            <p className="text-[12px] text-white/40 leading-relaxed">
              Recipe Studio unlocked + unlimited costings + PDF export — PKR 999/mo
            </p>
          </div>
          <Link
            href="/account"
            className="bg-orange text-white text-[12px] font-bold px-4 py-2
                       rounded-full flex-shrink-0 hover:bg-[#C85A2C] transition-colors"
          >
            Unlock Pro ✦
          </Link>
        </div>
      )}

      {/* ── Workspace — Quick Start for first-timers, snapshot once active ── */}
      <p className="section-label text-[10px] font-bold uppercase tracking-[0.1em] text-muted mb-2.5">
        {isFirstTimeUser ? 'Quick start' : 'Your workspace'}
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-5">
        <Link href="/recipe-gennie"
          className={`card relative overflow-hidden hover:-translate-y-1 hover:shadow-lg transition-all duration-200
            ${isFirstTimeUser ? 'p-6 text-center' : 'p-4'}`}>
          <div className="absolute top-0 left-0 right-0 h-[3px] bg-orange" />
          {recipeCount === 0 ? (
            <>
              {isFirstTimeUser && <div className="mb-3"><NotebookIcon /></div>}
              <h3 className="font-serif text-[18px] mb-1">Recipe Library</h3>
              <p className="text-[12px] text-muted leading-relaxed mb-3">
                You haven't created any recipes yet.
              </p>
              <span className="text-[12px] font-bold text-orange">Create your first recipe →</span>
            </>
          ) : (
            <>
              <h3 className="font-serif text-[18px] mb-1">Recipe Studio</h3>
              <p className="text-[12px] text-muted leading-relaxed mb-3">Generate any recipe, any cuisine</p>
              <span className="text-[12px] font-bold text-orange">Create Recipe ✦</span>
            </>
          )}
        </Link>
        <Link href="/plate-profit"
          className={`card relative overflow-hidden hover:-translate-y-1 hover:shadow-lg transition-all duration-200
            ${isFirstTimeUser ? 'p-6 text-center' : 'p-4'}`}>
          <div className="absolute top-0 left-0 right-0 h-[3px] bg-green" />
          {costingCount === 0 ? (
            <>
              {isFirstTimeUser && <div className="mb-3"><ClipboardIcon /></div>}
              <h3 className="font-serif text-[18px] mb-1">Plate Profit</h3>
              <p className="text-[12px] text-muted leading-relaxed mb-3">
                No food costings yet.
              </p>
              <span className="text-[12px] font-bold text-green">Calculate your first dish →</span>
            </>
          ) : (
            <>
              <h3 className="font-serif text-[18px] mb-1">Plate Profit</h3>
              <p className="text-[12px] text-muted leading-relaxed mb-3">Cost a dish, know your margin</p>
              <span className="text-[12px] font-bold text-green">Cost My Dish ✦</span>
            </>
          )}
        </Link>
      </div>

      {/* ── Business System — always coming soon ─────────── */}
      {isFirstTimeUser && (
        <div className="card p-6 text-center mb-5 border-dashed">
          <div className="mb-3"><ShelfIcon /></div>
          <h3 className="font-serif text-[18px] mb-1">Business System</h3>
          <p className="text-[11px] font-bold uppercase tracking-wide text-muted/50 mb-2">Coming soon</p>
          <p className="text-[12px] text-muted leading-relaxed max-w-[360px] mx-auto">
            You'll soon be able to manage SOPs, audits and restaurant systems from here.
          </p>
        </div>
      )}

      {/* ── Recent work ───────────────────────────────────── */}
      {activity.length > 0 && (
        <>
          <p className="section-label text-[10px] font-bold uppercase tracking-[0.1em] text-muted mb-2.5">Recent work</p>
          <div className="space-y-2 mb-5">
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

      {/* ── Future modules preview ───────────────────────── */}
      {!isFirstTimeUser && (
        <div className="mt-2 mb-2">
          <p className="text-[10px] font-bold uppercase tracking-wide text-muted/50 mb-2">Coming soon to your system</p>
          <div className="flex flex-wrap gap-1.5">
            {COMING_SOON_MODULES.map(name => (
              <span key={name} className="text-[11px] text-muted/60 bg-cream border border-border px-2.5 py-1 rounded-full">
                {name}
              </span>
            ))}
          </div>
        </div>
      )}
    </AppShell>
  )
}
