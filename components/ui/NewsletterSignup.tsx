'use client'
import { useState } from 'react'
import toast from 'react-hot-toast'

export default function NewsletterSignup({ dark = false }: { dark?: boolean }) {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email) return
    setLoading(true)
    try {
      const res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, source: 'homepage' }),
      })
      if (!res.ok) throw new Error()
      setDone(true)
      toast.success('You\'re on the list!')
    } catch {
      toast.error('Something went wrong — try again')
    } finally {
      setLoading(false)
    }
  }

  if (done) {
    return (
      <p className={`text-[14px] font-semibold ${dark ? 'text-white' : 'text-ink'}`}>
        ✦ You're on the list — first issue coming soon.
      </p>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2.5 flex-wrap">
      <input
        type="email"
        required
        placeholder="Your email address"
        value={email}
        onChange={e => setEmail(e.target.value)}
        className={`flex-1 min-w-[200px] px-5 py-3 rounded-full text-[14px] outline-none
                    transition-colors border
                    ${dark
                      ? 'bg-white/10 border-white/20 text-white placeholder:text-white/40 focus:border-yellow'
                      : 'bg-white border-border text-ink placeholder:text-muted focus:border-orange'
                    }`}
      />
      <button
        type="submit"
        disabled={loading}
        className="bg-orange text-white font-bold text-[13px] px-6 py-3
                   rounded-full hover:bg-[#C85A2C] transition-colors
                   disabled:opacity-60 whitespace-nowrap"
      >
        {loading ? 'Subscribing…' : 'Subscribe ✦'}
      </button>
    </form>
  )
}
