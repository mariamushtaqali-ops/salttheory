'use client'
import { useState } from 'react'
import toast from 'react-hot-toast'

const TRACKER_URL = '/salt-theory-weekly-tracker.pdf'

const CONTENTS = [
  'Weekly Performance Dashboard — 8 core metrics with target vs. actual',
  'Daily Sales Tracker — Monday through Sunday, at a glance',
  'Weekly Review — biggest win, biggest challenge',
  'Action Plan — five changes to make next week',
  "Manager's Weekly Checklist — before you start a new week",
]

export default function WeeklyTrackerPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [unlocked, setUnlocked] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email) return
    setLoading(true)
    try {
      const res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, source: 'weekly-tracker' }),
      })
      if (!res.ok) throw new Error()
      setUnlocked(true)
      toast.success("You're in — download below.")
    } catch {
      toast.error('Something went wrong — try again')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-cream flex flex-col">
      <main className="flex-1 max-w-[560px] mx-auto w-full px-6 py-16">

        <div className="eyebrow mb-4">Free Download</div>
        <h1 className="font-serif text-[40px] md:text-[50px] text-ink leading-[1.05] mb-4">
          The Weekly Performance Tracker
        </h1>
        <p className="text-[16px] text-muted leading-relaxed mb-10 max-w-[460px]">
          A printable, one-page-a-week system for the numbers every restaurant, café,
          or cloud kitchen owner should check — sales, food cost, labour cost, prime
          cost, waste, and profit.
        </p>

        <div className="card p-6 mb-8">
          <div className="text-[11px] font-bold tracking-[0.14em] uppercase text-muted mb-4">
            What's inside
          </div>
          <ul className="space-y-3">
            {CONTENTS.map((item) => (
              <li key={item} className="flex items-start gap-2.5 text-[14px] text-ink leading-snug">
                <span className="w-1.5 h-1.5 rounded-full bg-orange mt-[7px] flex-shrink-0" />
                {item}
              </li>
            ))}
          </ul>
        </div>

        {!unlocked ? (
          <form onSubmit={handleSubmit} className="card p-6">
            <label className="text-[13px] font-semibold text-ink mb-2 block">
              Enter your email to get the free tracker
            </label>
            <div className="flex gap-2.5 flex-wrap">
              <input
                type="email"
                required
                placeholder="Your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input flex-1 min-w-[200px]"
              />
              <button type="submit" disabled={loading} className="btn-primary whitespace-nowrap">
                {loading ? 'Sending…' : 'Get the tracker →'}
              </button>
            </div>
            <p className="text-[11px] text-muted mt-3">
              You'll also join the Salt Theory newsletter. Unsubscribe anytime.
            </p>
          </form>
        ) : (
          <div className="card p-6 text-center">
            <div className="w-12 h-12 bg-green/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-green text-xl">✓</span>
            </div>
            <p className="text-[15px] font-semibold text-ink mb-4">
              You're on the list — here's your tracker.
            </p>
            
              href={TRACKER_URL}
              download
              className="btn-primary inline-flex"
            >
              Download the PDF ↓
            </a>
          </div>
        )}

      </main>
    </div>
  )
}
