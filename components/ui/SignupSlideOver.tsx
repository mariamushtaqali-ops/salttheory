'use client'
import Link from 'next/link'

interface Props {
  onContinueExploring: () => void
}

export default function SignupSlideOver({ onContinueExploring }: Props) {
  return (
    <div className="card p-6 border-2 border-orange/20 bg-cream animate-fadeIn">
      <h3 className="font-serif text-[20px] text-ink mb-2">Your first business analysis is ready.</h3>
      <p className="text-[13px] text-muted mb-4">Create your free account to:</p>
      <ul className="space-y-1.5 text-[13px] text-ink mb-5">
        <li className="flex gap-2"><span className="text-green">✓</span>Save recipes</li>
        <li className="flex gap-2"><span className="text-green">✓</span>Save costings</li>
        <li className="flex gap-2"><span className="text-green">✓</span>Build your menu</li>
        <li className="flex gap-2"><span className="text-green">✓</span>Compare versions</li>
        <li className="flex gap-2"><span className="text-green">✓</span>Track improvements over time</li>
        <li className="flex gap-2"><span className="text-green">✓</span>Unlock future Menu Intelligence</li>
      </ul>
      <div className="flex gap-3 flex-wrap">
        <Link href="/auth/signup" className="btn-primary px-6 py-2.5 text-[13px]">
          Create Free Account
        </Link>
        <button onClick={onContinueExploring}
          className="btn-secondary px-6 py-2.5 text-[13px]">
          Continue Exploring
        </button>
      </div>
    </div>
  )
}
