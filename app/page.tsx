import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import NewsletterSignup from '@/components/ui/NewsletterSignup'
import Logo from '@/components/ui/Logo'

export default async function HomePage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (user) redirect('/dashboard')

  return (
    <div className="bg-cream">

      {/* ── HERO ─────────────────────────────────────────────── */}
      <section className="max-w-[1000px] mx-auto px-6 pt-16 pb-20 grid md:grid-cols-2 gap-12 items-center">
        <div>
          <div className="eyebrow mb-4">Built by restaurant operators—not software people.</div>
          <h1 className="font-serif text-[clamp(38px,5.5vw,64px)] text-ink leading-[1.08] mb-5">
            Run a More Profitable Food Business.
          </h1>
          <p className="text-[16px] text-muted leading-[1.85] mb-8 max-w-[460px]">
            Build recipes, calculate food costs and create systems that help your food business grow—whether you're a home chef, caterer, cloud kitchen or restaurant.
          </p>
          <div className="flex gap-3 flex-wrap">
            <Link href="/auth/signup" className="btn-primary px-8 py-3.5 text-[15px]">
              Start Free ✦
            </Link>
            <Link href="#create-price-run" className="btn-secondary px-8 py-3.5 text-[15px]">
              Explore Tools
            </Link>
          </div>
          <p className="text-[12px] text-muted mt-4">
            5 free recipes · 3 free costings · No card needed
          </p>
        </div>

        {/* Stick figure illustration */}
        <div className="flex justify-center">
          <svg viewBox="0 0 420 320" xmlns="http://www.w3.org/2000/svg" className="w-full max-w-[420px]">
            {/* Background circles */}
            <circle cx="210" cy="160" r="140" fill="#F7F1E8" stroke="#E8DDD0" strokeWidth="1"/>

            {/* Figure 1 — Home chef (left) */}
            <g transform="translate(90,80)">
              {/* Head */}
              <circle cx="0" cy="0" r="18" fill="none" stroke="#24211E" strokeWidth="2"/>
              {/* Chef hat */}
              <rect x="-14" y="-30" width="28" height="14" rx="3" fill="none" stroke="#24211E" strokeWidth="2"/>
              <rect x="-10" y="-44" width="20" height="16" rx="4" fill="none" stroke="#24211E" strokeWidth="2"/>
              {/* Body */}
              <line x1="0" y1="18" x2="0" y2="70" stroke="#24211E" strokeWidth="2" strokeLinecap="round"/>
              {/* Arms */}
              <line x1="0" y1="32" x2="-28" y2="55" stroke="#24211E" strokeWidth="2" strokeLinecap="round"/>
              <line x1="0" y1="32" x2="28" y2="45" stroke="#24211E" strokeWidth="2" strokeLinecap="round"/>
              {/* Legs */}
              <line x1="0" y1="70" x2="-18" y2="108" stroke="#24211E" strokeWidth="2" strokeLinecap="round"/>
              <line x1="0" y1="70" x2="18" y2="108" stroke="#24211E" strokeWidth="2" strokeLinecap="round"/>
              {/* Bowl in hand */}
              <ellipse cx="30" cy="44" rx="14" ry="8" fill="none" stroke="#E96B3C" strokeWidth="1.5"/>
              <line x1="16" y1="44" x2="44" y2="44" stroke="#E96B3C" strokeWidth="1.5"/>
              {/* Steam */}
              <path d="M26 36 Q28 30 26 24" fill="none" stroke="#E96B3C" strokeWidth="1.2" strokeLinecap="round"/>
              <path d="M32 36 Q34 28 32 22" fill="none" stroke="#E96B3C" strokeWidth="1.2" strokeLinecap="round"/>
              <path d="M38 36 Q40 30 38 24" fill="none" stroke="#E96B3C" strokeWidth="1.2" strokeLinecap="round"/>
              {/* Label */}
              <text x="0" y="126" textAnchor="middle" fontSize="10" fill="#8A7060" fontFamily="Manrope,sans-serif">Home chef</text>
            </g>

            {/* Figure 2 — Caterer (centre) */}
            <g transform="translate(210,70)">
              {/* Head */}
              <circle cx="0" cy="0" r="18" fill="none" stroke="#24211E" strokeWidth="2"/>
              {/* Hair hint */}
              <path d="M-14,-8 Q-16,-22 0,-20 Q16,-22 14,-8" fill="none" stroke="#24211E" strokeWidth="1.5"/>
              {/* Body */}
              <line x1="0" y1="18" x2="0" y2="72" stroke="#24211E" strokeWidth="2" strokeLinecap="round"/>
              {/* Arms — carrying tray */}
              <line x1="0" y1="30" x2="-35" y2="50" stroke="#24211E" strokeWidth="2" strokeLinecap="round"/>
              <line x1="0" y1="30" x2="35" y2="50" stroke="#24211E" strokeWidth="2" strokeLinecap="round"/>
              {/* Tray */}
              <rect x="-40" y="48" width="80" height="6" rx="3" fill="none" stroke="#7A8B5C" strokeWidth="1.5"/>
              {/* Food on tray */}
              <circle cx="-20" cy="44" r="5" fill="none" stroke="#7A8B5C" strokeWidth="1.2"/>
              <circle cx="0" cy="43" r="6" fill="none" stroke="#7A8B5C" strokeWidth="1.2"/>
              <circle cx="20" cy="44" r="5" fill="none" stroke="#7A8B5C" strokeWidth="1.2"/>
              {/* Legs */}
              <line x1="0" y1="72" x2="-18" y2="112" stroke="#24211E" strokeWidth="2" strokeLinecap="round"/>
              <line x1="0" y1="72" x2="18" y2="112" stroke="#24211E" strokeWidth="2" strokeLinecap="round"/>
              {/* Label */}
              <text x="0" y="130" textAnchor="middle" fontSize="10" fill="#8A7060" fontFamily="Manrope,sans-serif">Caterer</text>
            </g>

            {/* Figure 3 — Restaurant owner (right) */}
            <g transform="translate(330,80)">
              {/* Head */}
              <circle cx="0" cy="0" r="18" fill="none" stroke="#24211E" strokeWidth="2"/>
              {/* Tie/formal */}
              <line x1="0" y1="18" x2="0" y2="72" stroke="#24211E" strokeWidth="2" strokeLinecap="round"/>
              <path d="M-4,24 L0,20 L4,24 L2,40 L0,44 L-2,40 Z" fill="none" stroke="#24211E" strokeWidth="1.2"/>
              {/* Arms — one holding clipboard */}
              <line x1="0" y1="32" x2="-30" y2="52" stroke="#24211E" strokeWidth="2" strokeLinecap="round"/>
              <line x1="0" y1="32" x2="28" y2="48" stroke="#24211E" strokeWidth="2" strokeLinecap="round"/>
              {/* Clipboard */}
              <rect x="26" y="44" width="22" height="28" rx="2" fill="none" stroke="#F3C766" strokeWidth="1.5"/>
              <line x1="30" y1="52" x2="44" y2="52" stroke="#F3C766" strokeWidth="1"/>
              <line x1="30" y1="58" x2="44" y2="58" stroke="#F3C766" strokeWidth="1"/>
              <line x1="30" y1="64" x2="38" y2="64" stroke="#F3C766" strokeWidth="1"/>
              {/* Legs */}
              <line x1="0" y1="72" x2="-18" y2="110" stroke="#24211E" strokeWidth="2" strokeLinecap="round"/>
              <line x1="0" y1="72" x2="18" y2="110" stroke="#24211E" strokeWidth="2" strokeLinecap="round"/>
              {/* Label */}
              <text x="0" y="128" textAnchor="middle" fontSize="10" fill="#8A7060" fontFamily="Manrope,sans-serif">Restaurant owner</text>
            </g>

            {/* Connecting dots / system lines */}
            <path d="M140,180 Q210,200 280,180" fill="none" stroke="#E8DDD0" strokeWidth="1.5" strokeDasharray="4,4"/>

            {/* Salt Theory label at bottom */}
            <text x="210" y="290" textAnchor="middle" fontSize="11" fill="#8A7060" fontFamily="Manrope,sans-serif" letterSpacing="2">SALT THEORY</text>
          </svg>
        </div>
      </section>

      {/* ── THE PROBLEM ──────────────────────────────────────── */}
      <section className="bg-light py-16">
        <div className="max-w-[720px] mx-auto px-6 text-center">
          <div className="eyebrow justify-center mb-4">The problem we solve</div>
          <h2 className="font-serif text-[clamp(20px,3vw,30px)] text-ink leading-[1.5] mb-6">
            Most food businesses don't fail because of the food.
          </h2>
          <p className="text-[15px] text-muted leading-[1.9]">
            Recipes aren't documented.<br />
            Pricing is based on guesswork.<br />
            Operations depend on people instead of systems.<br />
            When staff leave, knowledge leaves.<br />
            When ingredient prices change, profit disappears.<br />
            <strong className="text-ink">Salt Theory helps fix that.</strong>
          </p>
        </div>
      </section>

      {/* ── CREATE · PRICE · RUN ─────────────────────────────── */}
      <section className="bg-light py-16" id="create-price-run">
        <div className="max-w-[1000px] mx-auto px-6">
          <div className="text-center mb-10">
            <div className="eyebrow justify-center mb-3">The system</div>
            <h2 className="font-serif text-[clamp(28px,4vw,42px)] text-ink">
              Create · Price · Run
            </h2>
            <p className="text-[15px] text-muted mt-3 max-w-[500px] mx-auto leading-relaxed">
              From your first recipe to a fully documented operation.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-5">
            {/* Create */}
            <div className="card p-6 border-t-4 border-t-orange">
              <div className="eyebrow mb-3">Create</div>
              <h3 className="font-serif text-[22px] text-ink mb-2">Recipe Studio</h3>
              <p className="text-[14px] text-muted leading-relaxed mb-4">
                Create consistent recipes for any cuisine. Scale recipes for any number of guests.
              </p>
              <p className="text-[12px] font-semibold text-green mb-4">Free — 5 recipes/month</p>
              <Link href="/recipe-gennie" className="btn-secondary block text-center py-2.5 text-[13px]">
                Generate Recipes
              </Link>
            </div>

            {/* Price — flagship, slightly elevated */}
            <div className="card p-6 border-t-4 border-t-green relative md:scale-[1.03] md:shadow-lg z-10">
              <div className="absolute top-3 right-3 text-[10px] font-bold bg-green/15 text-green px-2 py-0.5 rounded-full">
                Flagship tool
              </div>
              <div className="eyebrow green mb-3">Price</div>
              <h3 className="font-serif text-[22px] text-ink mb-2">Plate Profit</h3>
              <p className="text-[14px] text-muted leading-relaxed mb-4">
                Know exactly what every dish costs.
              </p>
              <ul className="space-y-1.5 text-[13px] text-muted mb-4">
                <li className="flex gap-2"><span className="text-green">✦</span>Food cost</li>
                <li className="flex gap-2"><span className="text-green">✦</span>Packaging</li>
                <li className="flex gap-2"><span className="text-green">✦</span>Labour</li>
                <li className="flex gap-2"><span className="text-green">✦</span>Delivery commissions</li>
                <li className="flex gap-2"><span className="text-green">✦</span>Profit margin</li>
              </ul>
              <p className="text-[12px] font-semibold text-green mb-4">Free — 3 dish costings</p>
              <Link href="/plate-profit" className="btn-primary block text-center py-2.5 text-[13px]">
                Cost a Dish
              </Link>
            </div>

            {/* Run */}
            <div className="card p-6 border-t-4 border-t-yellow relative overflow-hidden">
              <div className="absolute top-3 right-3 text-[10px] font-bold bg-yellow/20 text-brown px-2 py-0.5 rounded-full">
                Coming soon
              </div>
              <div className="eyebrow" style={{color:'#9B6A45'}}>Run</div>
              <div className="mb-3"></div>
              <h3 className="font-serif text-[22px] text-ink mb-2">Business System</h3>
              <p className="text-[14px] text-muted leading-relaxed mb-4">
                Coming Soon
              </p>
              <ul className="space-y-1.5 text-[13px] text-muted mb-4">
                <li className="flex gap-2"><span style={{color:'#9B6A45'}}>✦</span>Weekly Dashboard</li>
                <li className="flex gap-2"><span style={{color:'#9B6A45'}}>✦</span>Profit Leak Audit</li>
                <li className="flex gap-2"><span style={{color:'#9B6A45'}}>✦</span>SOP Builder</li>
                <li className="flex gap-2"><span style={{color:'#9B6A45'}}>✦</span>Training Manuals</li>
                <li className="flex gap-2"><span style={{color:'#9B6A45'}}>✦</span>Business Blueprint</li>
              </ul>
              <Link href="#newsletter" className="btn-secondary block text-center py-2.5 text-[13px]">
                Join Waitlist
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── WHO IT'S FOR ─────────────────────────────────────── */}
      <section className="py-16 max-w-[1000px] mx-auto px-6" id="who">
        <div className="text-center mb-10">
          <div className="eyebrow justify-center mb-3">Who it's for</div>
          <h2 className="font-serif text-[clamp(28px,4vw,42px)] text-ink">Anyone who cooks for a living</h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { icon: '🏠', title: 'Home chef',        desc: 'Turning your passion into consistent, profitable orders from home' },
            { icon: '🍱', title: 'Caterer',           desc: 'Managing events and bulk orders without losing your margin' },
            { icon: '☁️', title: 'Cloud kitchen',     desc: 'Scaling your operation without the chaos that comes with growth' },
            { icon: '🏪', title: 'Restaurant & café', desc: 'Running a professional operation with real systems and processes' },
          ].map(item => (
            <div key={item.title} className="card p-5 text-center hover:-translate-y-1 transition-transform">
              <div className="text-[32px] mb-3">{item.icon}</div>
              <h3 className="font-serif text-[17px] text-ink mb-2">{item.title}</h3>
              <p className="text-[12px] text-muted leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── BUILT FROM REAL EXPERIENCE ───────────────────────── */}
      <section className="bg-light py-16">
        <div className="max-w-[1000px] mx-auto px-6">
          <div className="text-center mb-10">
            <div className="eyebrow justify-center mb-3">Why it's different</div>
            <h2 className="font-serif text-[clamp(28px,4vw,42px)] text-ink">
              Built From Real Food Businesses.
            </h2>
            <p className="text-[15px] text-muted mt-3 max-w-[520px] mx-auto leading-relaxed">
              Salt Theory wasn't created in a boardroom. It was built from years of recipe development,
              menu costing, restaurant operations and consulting work. Every feature solves a real
              operational problem.
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { value: '[XX]+', label: 'Recipes Developed' },
              { value: '[XX]+', label: 'Menu Items Costed' },
              { value: '[XX]+', label: 'Years of Restaurant Experience' },
              { value: '[XX]+', label: 'Restaurants Supported' },
            ].map(stat => (
              <div key={stat.label} className="card p-5 text-center">
                <p className="font-serif text-[30px] text-orange leading-none mb-2">{stat.value}</p>
                <p className="text-[12px] text-muted leading-relaxed">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PRICING ──────────────────────────────────────────── */}
      <section className="py-16 max-w-[700px] mx-auto px-6" id="pricing">
        <div className="text-center mb-10">
          <div className="eyebrow justify-center mb-3">Pricing</div>
          <h2 className="font-serif text-[clamp(28px,4vw,42px)] text-ink">Start free. Upgrade when ready.</h2>
          <p className="text-[14px] text-muted mt-3">
            Pay via EasyPaisa or JazzCash — no international card needed.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="card p-6">
            <p className="text-[11px] font-bold uppercase tracking-wide text-muted mb-3">Free</p>
            <p className="font-serif text-[42px] text-ink leading-none mb-1">PKR 0</p>
            <p className="text-[12px] text-muted mb-5">No card required</p>
            <ul className="space-y-2 text-[13px] text-muted mb-6">
              <li className="flex gap-2"><span className="text-green">✦</span>Recipe Gennie — 5/month</li>
              <li className="flex gap-2"><span className="text-green">✦</span>Plate Profit — 3 costings</li>
            </ul>
            <Link href="/auth/signup" className="btn-secondary block text-center py-2.5 text-[13px]">
              Get started
            </Link>
          </div>
          <div className="card p-6 border-orange relative">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-orange text-white
                            text-[10px] font-bold px-3 py-1 rounded-full whitespace-nowrap">
              ✦ Both tools unlimited
            </div>
            <p className="text-[11px] font-bold uppercase tracking-wide text-muted mb-3">Pro</p>
            <p className="font-serif text-[42px] text-ink leading-none mb-1">PKR 999</p>
            <p className="text-[12px] text-muted mb-5">per month</p>
            <ul className="space-y-2 text-[13px] text-muted mb-6">
              <li className="flex gap-2"><span className="text-green">✦</span>Unlimited recipes</li>
              <li className="flex gap-2"><span className="text-green">✦</span>Unlimited costings</li>
              <li className="flex gap-2"><span className="text-green">✦</span>PDF export</li>
              <li className="flex gap-2"><span className="text-green">✦</span>EasyPaisa / JazzCash</li>
            </ul>
            <Link href="/auth/signup" className="btn-primary block text-center py-2.5 text-[13px]">
              Upgrade to Pro
            </Link>
          </div>
        </div>
      </section>

      {/* ── FOUNDER NOTE ─────────────────────────────────────── */}
      <section className="bg-ink py-16">
        <div className="max-w-[600px] mx-auto px-6 text-center">
          <div className="w-16 h-px bg-orange mx-auto mb-8"></div>
          <p className="font-serif text-[clamp(18px,2.5vw,24px)] text-white leading-[1.7] mb-6">
            "I built Salt Theory because I kept seeing incredible food businesses struggle — not because the food wasn't good,
            but because there was no system behind it. No documented recipes. No costing. No processes. No training.
            The knowledge lived in people's heads and walked out the door with them."
          </p>
          <p className="text-[13px] text-white/40 mb-8">— Salt Theory</p>
          <Link href="/auth/signup" className="btn-primary px-8 py-3.5 text-[14px] inline-flex">
            Build your system today ✦
          </Link>
        </div>
      </section>

      {/* ── NEWSLETTER ───────────────────────────────────────── */}
      <section className="bg-green py-14" id="newsletter">
        <div className="max-w-[700px] mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <div className="eyebrow white mb-3">Weekly newsletter</div>
              <h2 className="font-serif text-[28px] text-white mb-2 leading-snug">
                Recipes & food business insights
              </h2>
              <p className="text-[13px] text-white/60 leading-relaxed">
                One email a week — recipes, pricing tips, and practical advice for food businesses. No spam, unsubscribe any time.
              </p>
            </div>
            <div>
              <NewsletterSignup dark />
              <p className="text-[11px] text-white/30 mt-2">Unsubscribe any time.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── FOOTER ───────────────────────────────────────────── */}
      <footer className="bg-ink py-10">
        <div className="max-w-[1000px] mx-auto px-6">
          <div className="flex flex-wrap justify-between items-start gap-8 mb-8">
            <div className="max-w-[260px]">
              <div className="flex items-center gap-3 mb-3">
                <Logo showName={false} size={32} />
                <span className="font-serif text-[17px] text-white">Salt Theory</span>
              </div>
              <p className="text-[12px] text-white/40 leading-relaxed">
                The complete business system for food businesses. Create · Price · Run.
              </p>
            </div>
            <div className="flex gap-12 text-[13px]">
              <div>
                <p className="text-white/20 text-[10px] uppercase tracking-wider mb-3">Tools</p>
                <div className="space-y-2">
                  <Link href="/auth/signup" className="block text-white/50 hover:text-white transition-colors">Recipe Gennie</Link>
                  <Link href="/auth/signup" className="block text-white/50 hover:text-white transition-colors">Plate Profit</Link>
                </div>
              </div>
              <div>
                <p className="text-white/20 text-[10px] uppercase tracking-wider mb-3">Company</p>
                <div className="space-y-2">
                  <Link href="/blog" className="block text-white/50 hover:text-white transition-colors">Blog</Link>
                  <Link href="/contact" className="block text-white/50 hover:text-white transition-colors">Contact</Link>
                  <a href="https://instagram.com/salttheorylab" target="_blank" rel="noopener noreferrer"
                    className="block text-white/50 hover:text-white transition-colors">Instagram</a>
                </div>
              </div>
              <div>
                <p className="text-white/20 text-[10px] uppercase tracking-wider mb-3">Account</p>
                <div className="space-y-2">
                  <Link href="/auth/signup" className="block text-white/50 hover:text-white transition-colors">Sign up free</Link>
                  <Link href="/auth/login" className="block text-white/50 hover:text-white transition-colors">Log in</Link>
                </div>
              </div>
            </div>
          </div>
          <div className="border-t border-white/10 pt-6 flex flex-wrap justify-between items-center gap-3">
            <p className="text-[11px] text-white/25">© 2026 Salt Theory · salttheorylab.com</p>
            <p className="text-[11px] text-white/25">contact@salttheorylab.com</p>
          </div>
        </div>
      </footer>

    </div>
  )
}
