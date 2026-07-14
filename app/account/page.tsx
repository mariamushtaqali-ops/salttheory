import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import AppShell from '@/components/layout/AppShell'
import ProfileCompletionForm from '@/components/tools/ProfileCompletionForm'
import { LIMITS } from '@/types'

export default async function AccountPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  const tier = (profile?.tier ?? 'free') as 'free' | 'pro'
  const profileComplete = !!(profile?.last_name && profile?.role)

  return (
    <AppShell userEmail={user.email}>
      <div className="mb-6">
        <div className="eyebrow mb-2">Account</div>
        <h1 className="font-serif text-[28px] text-ink">Your plan</h1>
      </div>

      {/* Plan */}
      <div className="card mb-4 overflow-hidden">
        <div className="px-5 py-3 border-b border-border text-[10px] font-bold uppercase tracking-[0.1em] text-muted">
          Current plan
        </div>
        {[
          { label: 'Plan', value: <span className={`text-[11px] font-bold uppercase tracking-wide px-2.5 py-1 rounded-full ${tier === 'pro' ? 'bg-orange/10 text-orange' : 'bg-green/10 text-green'}`}>{tier === 'pro' ? 'Pro' : 'Free'}</span> },
          { label: 'Recipes this month', value: `${profile?.recipe_count ?? 0} / ${tier === 'free' ? LIMITS.free.recipes : '∞'}` },
          { label: 'Dish costings', value: `${profile?.costing_count ?? 0} / ${tier === 'free' ? LIMITS.free.costings : '∞'}` },
          { label: 'PDF export', value: tier === 'pro' ? '✓ Included' : 'Pro only' },
        ].map(row => (
          <div key={row.label} className="flex items-center justify-between px-5 py-3.5 border-b border-border last:border-none text-[13px]">
            <span className="text-muted">{row.label}</span>
            <span className="font-semibold text-ink">{row.value}</span>
          </div>
        ))}
      </div>

      {/* Upgrade banner */}
      {tier === 'free' && (
        <div className="bg-ink rounded-[14px] p-5 mb-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <p className="text-[14px] font-bold text-white mb-1">Upgrade to Pro</p>
            <p className="text-[13px] text-white/40 leading-relaxed">
              Recipe Studio unlocked + unlimited costings + PDF export<br />
              PKR 999/month · Pay via EasyPaisa or JazzCash
            </p>
          </div>
          <div className="flex-shrink-0">
            <a
              href={`https://wa.me/923342992706?text=Hi! I'd like to upgrade my Salt Theory account to Pro (PKR 999/mo). My email: ${user.email}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-orange text-white font-bold
                         text-[13px] px-5 py-2.5 rounded-full hover:bg-[#C85A2C] transition-colors"
            >
              Upgrade — PKR 999/mo ✦
            </a>
            <p className="text-[11px] text-white/30 mt-2 text-center">
              Send payment via EasyPaisa/JazzCash,<br />we'll upgrade you within 24 hours
            </p>
          </div>
        </div>
      )}

      {!profileComplete && (
        <div className="mb-4">
          <ProfileCompletionForm userId={user.id} initialLastName={profile?.last_name ?? ''} />
        </div>
      )}

      {/* Profile */}
      <div className="card mb-4 overflow-hidden">
        <div className="px-5 py-3 border-b border-border text-[10px] font-bold uppercase tracking-[0.1em] text-muted">Profile</div>
        {[
          { label: 'Name', value: [profile?.first_name, profile?.last_name].filter(Boolean).join(' ') || '—' },
          { label: 'Email', value: user.email },
          { label: 'Member since', value: new Date(profile?.created_at ?? '').toLocaleDateString('en-GB', { month: 'long', year: 'numeric' }) },
        ].map(row => (
          <div key={row.label} className="flex items-center justify-between px-5 py-3.5 border-b border-border last:border-none text-[13px]">
            <span className="text-muted">{row.label}</span>
            <span className="font-semibold text-ink">{row.value}</span>
          </div>
        ))}
      </div>

      {/* Support */}
      <div className="card mb-5 overflow-hidden">
        <div className="px-5 py-3 border-b border-border text-[10px] font-bold uppercase tracking-[0.1em] text-muted">Support</div>
        {[
          { label: 'Privacy Policy', href: '/privacy' },
          { label: 'Terms of Use', href: '/terms' },
          { label: 'Contact us', href: 'mailto:contact@salttheorylab.com' },
        ].map(row => (
          <a key={row.label} href={row.href}
             className="flex items-center justify-between px-5 py-3.5 border-b border-border last:border-none text-[13px] hover:bg-cream transition-colors">
            <span className="text-muted">{row.label}</span>
            <span className="text-muted/50">›</span>
          </a>
        ))}
      </div>

      <form action="/auth/signout" method="post">
        <button
          type="submit"
          className="w-full border border-border rounded-full py-3 text-[13px]
                     font-semibold text-muted hover:border-orange hover:text-orange transition-colors"
        >
          Log out
        </button>
      </form>
    </AppShell>
  )
}
