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
            <Link href="/plate-profit" className="btn-primary px-8 py-3.5 text-[15px]">
              Start Free ✦
            </Link>
            <Link href="#create-price-run" className="btn-secondary px-8 py-3.5 text-[15px]">
              Explore the Platform
            </Link>
          </div>
          <div className="flex flex-wrap gap-x-4 gap-y-1 mt-4">
            <span className="text-[12px] text-muted">✔ 5 free recipes</span>
            <span className="text-[12px] text-muted">✔ 3 free food costings</span>
            <span className="text-[12px] text-muted">✔ No credit card required</span>
            <span className="text-[12px] text-muted">✔ Takes less than 2 minutes</span>
          </div>
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

      {/* ── FOUR PILLARS ─────────────────────────────────────── */}
      <section className="bg-light py-16" id="create-price-run">
        <div className="max-w-[1100px] mx-auto px-6">
          <div className="text-center mb-10">
            <div className="eyebrow justify-center mb-3">The system</div>
            <h2 className="font-serif text-[clamp(28px,4vw,42px)] text-ink">
              The Four Pillars of Salt Theory
            </h2>
            <p className="text-[15px] text-muted mt-3 max-w-[560px] mx-auto leading-relaxed">
              Everything you need to build a profitable food business—from creating recipes to running a business powered by systems.
            </p>
          </div>

          <div className="flex flex-col lg:flex-row items-stretch gap-0">

            {/* Create */}
            <Link href="/recipe-gennie"
              className="flex-1 card p-6 border-t-4 border-t-orange relative flex flex-col transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
              <div className="absolute top-3 right-3 text-[9px] font-bold uppercase tracking-wide bg-green/15 text-green px-2 py-0.5 rounded-full">
                Available ✅
              </div>
              <div className="eyebrow mb-3">Create</div>
              <h3 className="font-serif text-[22px] text-ink mb-2">Recipe Studio</h3>
              <p className="text-[14px] text-muted leading-relaxed mb-4">
                Create consistent recipes that can be repeated across every kitchen, every shift and every team.
              </p>
              <span className="btn-secondary block text-center py-2.5 text-[13px] mt-auto">
                Open Recipe Studio
              </span>
            </Link>

            {/* Arrow */}
            <div className="flex items-center justify-center py-2 lg:py-0 lg:px-1">
              <span className="text-muted/25 text-[20px] lg:hidden">↓</span>
              <span className="text-muted/25 text-[18px] hidden lg:block">→</span>
            </div>

            {/* Price — flagship */}
            <Link href="/plate-profit"
              className="flex-1 card p-6 border-t-4 border-t-green relative flex flex-col border-2 border-green/20
                         transition-all duration-200 hover:-translate-y-0.5 md:shadow-md hover:shadow-lg z-10">
              <div className="absolute top-3 right-3 text-[9px] font-bold uppercase tracking-wide bg-green/15 text-green px-2 py-0.5 rounded-full">
                Start Here
              </div>
              <div className="eyebrow green mb-3">Price</div>
              <h3 className="font-serif text-[22px] text-ink mb-2">Plate Profit</h3>
              <p className="text-[14px] text-muted leading-relaxed mb-4">
                Know exactly what every dish costs, how much profit it makes and what you should charge.
              </p>
              <span className="btn-primary block text-center py-2.5 text-[13px] mt-auto">
                Open Plate Profit
              </span>
            </Link>

            {/* Arrow */}
            <div className="flex items-center justify-center py-2 lg:py-0 lg:px-1">
              <span className="text-muted/25 text-[20px] lg:hidden">↓</span>
              <span className="text-muted/25 text-[18px] hidden lg:block">→</span>
            </div>

            {/* Analyze — coming next, no link */}
            <div className="flex-1 card p-6 border-t-4 border-t-yellow relative flex flex-col">
              <div className="absolute top-3 right-3 text-[9px] font-bold uppercase tracking-wide bg-yellow/20 text-brown px-2 py-0.5 rounded-full">
                Next Release 🚀
              </div>
              <div className="eyebrow" style={{color:'#9B6A45'}}>Analyze</div>
              <h3 className="font-serif text-[22px] text-ink mb-2 mt-3">Menu Intelligence</h3>
              <p className="text-[14px] text-muted leading-relaxed mb-4">
                Transform recipes and food costings into business intelligence. Discover your most profitable dishes, identify weak performers and understand the health of your entire menu.
              </p>
              <span className="border border-border rounded-full block text-center py-2.5 text-[13px] text-muted mt-auto cursor-default">
                Coming Soon
              </span>
            </div>

            {/* Arrow */}
            <div className="flex items-center justify-center py-2 lg:py-0 lg:px-1">
              <span className="text-muted/25 text-[20px] lg:hidden">↓</span>
              <span className="text-muted/25 text-[18px] hidden lg:block">→</span>
            </div>

            {/* Run */}
            <Link href="#newsletter"
              className="flex-1 card p-6 border-t-4 border-t-yellow relative flex flex-col overflow-hidden block
                         transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
              <div className="absolute top-3 right-3 text-[9px] font-bold uppercase tracking-wide bg-yellow/20 text-brown px-2 py-0.5 rounded-full">
                In Development ⚙️
              </div>
              <div className="eyebrow" style={{color:'#9B6A45'}}>Run</div>
              <h3 className="font-serif text-[22px] text-ink mb-2 mt-3">Business System</h3>
              <p className="text-[14px] text-muted leading-relaxed mb-4">
                Standard operating procedures, weekly dashboards, staff training and operational systems that help your business scale consistently.
              </p>
              <span className="btn-secondary block text-center py-2.5 text-[13px] mt-auto">
                Coming Soon
              </span>
            </Link>
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
            {
              title: 'Home Chef',
              desc: 'Turn passion into a profitable food business.',
              icon: (
                <svg viewBox="0 0 48 48" className="w-10 h-10 mx-auto" fill="none">
                  <ellipse cx="24" cy="30" rx="16" ry="9" stroke="#E96B3C" strokeWidth="2"/>
                  <line x1="8" y1="30" x2="40" y2="30" stroke="#E96B3C" strokeWidth="2"/>
                  <path d="M18 20 Q20 12 18 6" stroke="#E96B3C" strokeWidth="1.5" strokeLinecap="round"/>
                  <path d="M24 20 Q26 10 24 4" stroke="#E96B3C" strokeWidth="1.5" strokeLinecap="round"/>
                  <path d="M30 20 Q32 12 30 6" stroke="#E96B3C" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
              ),
            },
            {
              title: 'Caterer',
              desc: 'Scale events without losing your margins.',
              icon: (
                <svg viewBox="0 0 48 48" className="w-10 h-10 mx-auto" fill="none">
                  <rect x="6" y="28" width="36" height="6" rx="3" stroke="#7A8B5C" strokeWidth="2"/>
                  <circle cx="14" cy="22" r="6" stroke="#7A8B5C" strokeWidth="1.5"/>
                  <circle cx="24" cy="20" r="7" stroke="#7A8B5C" strokeWidth="1.5"/>
                  <circle cx="34" cy="22" r="6" stroke="#7A8B5C" strokeWidth="1.5"/>
                </svg>
              ),
            },
            {
              title: 'Cloud Kitchen',
              desc: 'Run leaner with documented recipes and systems.',
              icon: (
                <svg viewBox="0 0 48 48" className="w-10 h-10 mx-auto" fill="none">
                  <path d="M14 26a8 8 0 0 1 0-16 10 10 0 0 1 19-3 7 7 0 0 1 1 14H14z" stroke="#24211E" strokeWidth="2" strokeLinejoin="round"/>
                  <path d="M22 30q2 4 0 7q3-1 3-4q2 2 1 5" stroke="#E96B3C" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              ),
            },
            {
              title: 'Restaurant & Café',
              desc: 'Standardize costing, operations and staff training.',
              icon: (
                <svg viewBox="0 0 48 48" className="w-10 h-10 mx-auto" fill="none">
                  <rect x="14" y="10" width="20" height="28" rx="2" stroke="#F3C766" strokeWidth="2"/>
                  <line x1="18" y1="18" x2="30" y2="18" stroke="#F3C766" strokeWidth="1.2"/>
                  <line x1="18" y1="24" x2="30" y2="24" stroke="#F3C766" strokeWidth="1.2"/>
                  <line x1="18" y1="30" x2="26" y2="30" stroke="#F3C766" strokeWidth="1.2"/>
                </svg>
              ),
            },
          ].map(item => (
            <div key={item.title} className="card p-6 text-center hover:-translate-y-1 hover:shadow-md transition-all duration-200">
              <div className="mb-4">{item.icon}</div>
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
              { value: '100+', label: 'Recipes Developed' },
              { value: '50+', label: 'Menu Items Costed' },
              { value: '15+', label: 'Years Business Experience' },
              { value: 'Real Kitchens', label: 'Systems Tested In' },
            ].map(stat => (
              <div key={stat.label} className="card p-5 text-center">
                <p className="font-serif text-[clamp(18px,3vw,30px)] text-orange leading-tight mb-2">{stat.value}</p>
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
            <p className="text-[12px] text-muted mb-5">Perfect for getting started</p>
            <ul className="space-y-2 text-[13px] text-muted mb-6">
              <li className="flex gap-2"><span className="text-green">✦</span>5 recipes every month</li>
              <li className="flex gap-2"><span className="text-green">✦</span>3 food costings</li>
              <li className="flex gap-2"><span className="text-green">✦</span>No credit card required</li>
            </ul>
            <Link href="/auth/signup" className="btn-secondary block text-center py-2.5 text-[13px]">
              Get started
            </Link>
          </div>
          <div className="card p-6 border-orange relative">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-orange text-white
                            text-[10px] font-bold px-3 py-1 rounded-full whitespace-nowrap">
              ✦ Everything you need to run your kitchen
            </div>
            <p className="text-[11px] font-bold uppercase tracking-wide text-muted mb-3">Pro</p>
            <p className="font-serif text-[42px] text-ink leading-none mb-1">PKR 999</p>
            <p className="text-[12px] text-muted mb-5">Built for serious food businesses</p>
            <ul className="space-y-2 text-[13px] text-muted mb-6">
              <li className="flex gap-2"><span className="text-green">✦</span>Recipe Studio, unlocked</li>
              <li className="flex gap-2"><span className="text-green">✦</span>Unlimited Plate Profit</li>
              <li className="flex gap-2"><span className="text-green">✦</span>PDF Export</li>
              <li className="flex gap-2"><span className="text-green">✦</span>Future Platform Modules</li>
              <li className="flex gap-2"><span className="text-green">✦</span>Priority Updates</li>
              <li className="flex gap-2"><span className="text-green">✦</span>Secure card payment</li>
              <li className="flex gap-2"><span className="text-green">✦</span>Cancel anytime</li>
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
          <div className="eyebrow white justify-center mb-5">Why Salt Theory exists</div>
          <p className="font-serif text-[clamp(18px,2.5vw,24px)] text-white leading-[1.7] mb-6">
            Every recipe eventually becomes a business problem.<br /><br />
            If your pricing is wrong, your profit disappears.<br />
            If your recipes aren't documented, your consistency disappears.<br />
            If your systems only exist inside people's heads, your business cannot grow.
          </p>
          <p className="text-[14px] text-white/60 leading-relaxed mb-8 max-w-[480px] mx-auto">
            Salt Theory helps food businesses replace guesswork with documented recipes, accurate costing and repeatable systems. Built by someone who has experienced these challenges first-hand.
          </p>
          <Link href="/plate-profit" className="btn-primary px-8 py-3.5 text-[14px] inline-flex">
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
          <p className="text-center text-[11px] text-white/25 tracking-wide mb-8">
            Built on the Four Pillars — Create • Price • Analyze • Run
          </p>
          <div className="flex flex-wrap justify-between items-start gap-8 mb-8">
            <div className="max-w-[260px]">
              <div className="flex items-center gap-3 mb-3">
                <Logo showName={false} size={32} />
                <span className="font-serif text-[17px] text-white">Salt Theory</span>
              </div>
              <p className="text-[12px] text-white/40 leading-relaxed">
                Helping food businesses create better recipes, price with confidence and build systems that scale.
              </p>
            </div>
            <div className="flex gap-12 text-[13px]">
              <div>
                <p className="text-white/20 text-[10px] uppercase tracking-wider mb-3">System</p>
                <div className="space-y-2">
                  <Link href="/recipe-gennie" className="block text-white/50 hover:text-white transition-colors">Recipe Studio</Link>
                  <Link href="/plate-profit" className="block text-white/50 hover:text-white transition-colors">Plate Profit</Link>
                </div>
              </div>
              <div>
                <p className="text-white/20 text-[10px] uppercase tracking-wider mb-3">Company</p>
                <div className="space-y-2">
                  <Link href="/journal" className="block text-white/50 hover:text-white transition-colors">Journal</Link>
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
