'use client'
import Link from 'next/link'
import Logo from '@/components/ui/Logo'

export default function SiteNav() {
  return (
    <nav className="sticky top-0 z-50 h-[68px] px-6
                    flex items-center justify-between
                    bg-[rgba(253,249,243,0.97)] backdrop-blur-md
                    border-b border-border">
      <Logo showName showTagline size={44} />
      <div className="hidden md:flex items-center gap-8">
        {[
          { href: '/#tools',   label: 'Tools' },
          { href: '/#pricing', label: 'Pricing' },
          { href: '/journal',  label: 'Journal' },
        ].map(l => (
          <Link
            key={l.href}
            href={l.href}
            className="text-[13px] font-medium text-ink/60 hover:text-orange transition-colors"
          >
            {l.label}
          </Link>
        ))}
      </div>
      <div className="flex items-center gap-2.5">
        <Link href="/auth/login" className="btn-ghost hidden sm:inline-flex">Log in</Link>
        <Link href="/auth/signup" className="btn-primary text-sm px-5 py-2.5">
          Start for free
        </Link>
      </div>
    </nav>
  )
}
