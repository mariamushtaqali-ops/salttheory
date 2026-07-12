'use client'
import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Logo from '@/components/ui/Logo'

interface NavUser {
  email: string
  isAdmin: boolean
}

export default function TopNav() {
  const pathname  = usePathname()
  const router    = useRouter()
  const supabase  = createClient()

  const [user, setUser]             = useState<NavUser | null>(null)
  const [toolsOpen, setToolsOpen]   = useState(false)
  const [avatarOpen, setAvatarOpen] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  const toolsRef  = useRef<HTMLDivElement>(null)
  const avatarRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data: { user: u } }) => {
      if (!u) { setUser(null); return }
      const { data: profile } = await supabase
        .from('profiles').select('is_admin').eq('id', u.id).single()
      setUser({ email: u.email ?? '', isAdmin: !!profile?.is_admin })
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      if (!session) setUser(null)
    })
    return () => subscription.unsubscribe()
  }, [pathname])

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (toolsRef.current && !toolsRef.current.contains(e.target as Node)) setToolsOpen(false)
      if (avatarRef.current && !avatarRef.current.contains(e.target as Node)) setAvatarOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  // Close mobile menu on route change
  useEffect(() => { setMobileOpen(false) }, [pathname])

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  const initial = user?.email?.[0]?.toUpperCase() ?? 'U'
  // PR7: Recipe Studio and Plate Profit allow one free anonymous use —
  // no need to gate these behind signup anymore.
  const toolHref = (tool: string) => `/${tool}`

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 h-[64px]
                      bg-[rgba(253,249,243,0.97)] backdrop-blur-md
                      border-b border-border
                      flex items-center justify-between px-5 md:px-8">

        {/* LEFT — Logo */}
        <Logo showName size={40} showTagline={false} />

        {/* CENTRE — Desktop links */}
        <div className="hidden md:flex items-center gap-1">

          {/* Tools dropdown */}
          <div className="relative" ref={toolsRef}>
            <button
              onClick={() => setToolsOpen(o => !o)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-[8px] text-[13px] font-medium
                          transition-colors ${toolsOpen ? 'text-orange bg-cream' : 'text-muted hover:text-ink hover:bg-cream'}`}>
              System
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none"
                className={`transition-transform ${toolsOpen ? 'rotate-180' : ''}`}>
                <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>

            {toolsOpen && (
              <div className="absolute top-full left-0 mt-1.5 w-[280px]
                              bg-white border border-border rounded-[14px]
                              shadow-[0_8px_32px_rgba(36,33,30,0.12)] overflow-hidden">
                <div className="px-4 pt-3 pb-1">
                  <p className="text-[10px] font-bold uppercase tracking-wide text-muted/60">Available</p>
                </div>
                <Link href={toolHref('recipe-gennie')}
                  className="flex items-start gap-3 px-4 py-3.5 hover:bg-cream transition-colors group">
                  <div className="w-8 h-8 rounded-[8px] bg-orange/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-orange text-[14px]">✦</span>
                  </div>
                  <div>
                    <p className="text-[13px] font-bold text-ink group-hover:text-orange transition-colors">Recipe Studio</p>
                    <p className="text-[11px] text-muted">Create reliable recipes for any cuisine</p>
                  </div>
                </Link>
                <div className="h-px bg-border mx-4" />
                <Link href={toolHref('plate-profit')}
                  className="flex items-start gap-3 px-4 py-3.5 hover:bg-cream transition-colors group">
                  <div className="w-8 h-8 rounded-[8px] bg-green/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-green text-[14px]">◎</span>
                  </div>
                  <div>
                    <p className="text-[13px] font-bold text-ink group-hover:text-green transition-colors">Plate Profit</p>
                    <p className="text-[11px] text-muted">Cost dishes and know your margin</p>
                  </div>
                </Link>
                <div className="h-px bg-border mx-4" />
                <div className="px-4 pt-3 pb-1">
                  <p className="text-[10px] font-bold uppercase tracking-wide text-muted/60">Coming soon</p>
                </div>
                {[
                  { name: 'Weekly Dashboard', desc: 'Track sales, cost and profit' },
                  { name: 'Profit Leak Audit', desc: 'Find where profit is disappearing' },
                  { name: 'SOP Builder', desc: 'Document repeatable operations' },
                  { name: 'Training Manuals', desc: 'Train staff with clear systems' },
                  { name: 'Business Blueprint', desc: 'Build your full operating system' },
                ].map(mod => (
                  <div key={mod.name} className="flex items-start justify-between gap-2 px-4 py-2 cursor-default">
                    <div>
                      <p className="text-[12px] font-semibold text-muted/70">{mod.name}</p>
                      <p className="text-[10px] text-muted/50">{mod.desc}</p>
                    </div>
                    <span className="text-[9px] font-bold uppercase tracking-wide text-muted/40 bg-cream px-1.5 py-0.5 rounded-full flex-shrink-0 mt-0.5">Soon</span>
                  </div>
                ))}
                {!user && (
                  <>
                    <div className="h-px bg-border" />
                    <div className="px-4 py-3 bg-cream">
                      <p className="text-[11px] text-muted">
                        <Link href="/auth/signup" className="text-orange font-bold hover:underline">Sign up free</Link>
                        {' '}to access both modules
                      </p>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>

          <Link href="/journal"
            className={`px-3 py-2 rounded-[8px] text-[13px] font-medium transition-colors
              ${pathname.startsWith('/journal') ? 'text-ink bg-cream' : 'text-muted hover:text-ink hover:bg-cream'}`}>
            Journal
          </Link>

          <Link href="/contact"
            className={`px-3 py-2 rounded-[8px] text-[13px] font-medium transition-colors
              ${pathname === '/contact' ? 'text-ink bg-cream' : 'text-muted hover:text-ink hover:bg-cream'}`}>
            Contact
          </Link>

          {user && (
            <Link href="/dashboard"
              className={`px-3 py-2 rounded-[8px] text-[13px] font-medium transition-colors
                ${pathname === '/dashboard' ? 'text-ink bg-cream' : 'text-muted hover:text-ink hover:bg-cream'}`}>
              Dashboard
            </Link>
          )}
        </div>

        {/* RIGHT — Auth buttons or avatar */}
        <div className="flex items-center gap-2">
          {!user ? (
            <>
              <Link href="/auth/login"
                className="hidden sm:inline-flex btn-ghost text-[13px] px-4 py-2">
                Log in
              </Link>
              <Link href="/plate-profit"
                className="btn-primary text-[13px] px-4 py-2.5">
                Start free
              </Link>
            </>
          ) : (
            <div className="relative" ref={avatarRef}>
              <button
                onClick={() => setAvatarOpen(o => !o)}
                className="w-[36px] h-[36px] rounded-full bg-ink text-white text-[13px]
                           font-bold flex items-center justify-center hover:opacity-80 transition-opacity">
                {initial}
              </button>

              {avatarOpen && (
                <div className="absolute top-full right-0 mt-1.5 w-[200px]
                                bg-white border border-border rounded-[14px]
                                shadow-[0_8px_32px_rgba(36,33,30,0.12)] overflow-hidden">
                  <div className="px-4 py-3 border-b border-border">
                    <p className="text-[11px] text-muted truncate">{user.email}</p>
                  </div>
                  <Link href="/account"
                    className="flex items-center gap-2.5 px-4 py-3 text-[13px] text-ink hover:bg-cream transition-colors border-b border-border">
                    <span className="text-muted">○</span> Account
                  </Link>
                  {user.isAdmin && (
                    <Link href="/admin"
                      className="flex items-center gap-2.5 px-4 py-3 text-[13px] text-ink hover:bg-cream transition-colors border-b border-border">
                      <span className="text-muted">⚙</span> Admin
                    </Link>
                  )}
                  <button onClick={handleLogout}
                    className="w-full flex items-center gap-2.5 px-4 py-3 text-[13px] text-muted
                               hover:bg-cream hover:text-orange transition-colors text-left">
                    <span>→</span> Log out
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileOpen(o => !o)}
            className="md:hidden w-9 h-9 flex flex-col items-center justify-center gap-1.5 ml-1">
            <span className={`block w-5 h-0.5 bg-ink rounded transition-all ${mobileOpen ? 'rotate-45 translate-y-2' : ''}`} />
            <span className={`block w-5 h-0.5 bg-ink rounded transition-all ${mobileOpen ? 'opacity-0' : ''}`} />
            <span className={`block w-5 h-0.5 bg-ink rounded transition-all ${mobileOpen ? '-rotate-45 -translate-y-2' : ''}`} />
          </button>
        </div>
      </nav>

      {/* MOBILE MENU */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div className="absolute inset-0 bg-ink/40" onClick={() => setMobileOpen(false)} />
          <div className="absolute top-[64px] left-0 right-0 bg-white border-b border-border shadow-xl">
            <div className="px-5 py-4 space-y-1">

              <p className="text-[10px] font-bold uppercase tracking-wide text-muted px-3 pb-1">System</p>
              <Link href={toolHref('recipe-gennie')}
                className="flex items-center gap-3 px-3 py-3 rounded-[10px] hover:bg-cream transition-colors">
                <span className="text-orange">✦</span>
                <div>
                  <p className="text-[13px] font-bold text-ink">Recipe Studio</p>
                  <p className="text-[11px] text-muted">Create reliable recipes for any cuisine</p>
                </div>
              </Link>
              <Link href={toolHref('plate-profit')}
                className="flex items-center gap-3 px-3 py-3 rounded-[10px] hover:bg-cream transition-colors">
                <span className="text-green">◎</span>
                <div>
                  <p className="text-[13px] font-bold text-ink">Plate Profit</p>
                  <p className="text-[11px] text-muted">Cost dishes and know your margin</p>
                </div>
              </Link>

              <p className="text-[10px] font-bold uppercase tracking-wide text-muted/60 px-3 pt-2 pb-1">Coming soon</p>
              <div className="px-3 pb-1 flex flex-wrap gap-1.5">
                {['Weekly Dashboard', 'Profit Leak Audit', 'SOP Builder', 'Training Manuals', 'Business Blueprint'].map(name => (
                  <span key={name} className="text-[11px] text-muted/60 bg-cream px-2 py-1 rounded-full">{name}</span>
                ))}
              </div>

              <div className="h-px bg-border my-2" />

              {user && (
                <Link href="/dashboard" className="block px-3 py-2.5 text-[13px] font-medium text-ink hover:bg-cream rounded-[10px] transition-colors">
                  Dashboard
                </Link>
              )}
              <Link href="/journal" className="block px-3 py-2.5 text-[13px] font-medium text-ink hover:bg-cream rounded-[10px] transition-colors">Journal</Link>
              <Link href="/contact" className="block px-3 py-2.5 text-[13px] font-medium text-ink hover:bg-cream rounded-[10px] transition-colors">Contact</Link>

              <div className="h-px bg-border my-2" />

              {!user ? (
                <div className="flex gap-2 pt-1">
                  <Link href="/auth/login" className="flex-1 btn-ghost text-center py-2.5 text-[13px]">Log in</Link>
                  <Link href="/plate-profit" className="flex-1 btn-primary text-center py-2.5 text-[13px]">Start free</Link>
                </div>
              ) : (
                <>
                  <Link href="/account" className="block px-3 py-2.5 text-[13px] text-ink hover:bg-cream rounded-[10px] transition-colors">Account</Link>
                  {user.isAdmin && (
                    <Link href="/admin" className="block px-3 py-2.5 text-[13px] text-ink hover:bg-cream rounded-[10px] transition-colors">Admin</Link>
                  )}
                  <button onClick={handleLogout}
                    className="w-full text-left px-3 py-2.5 text-[13px] text-orange font-semibold hover:bg-cream rounded-[10px] transition-colors">
                    Log out
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
