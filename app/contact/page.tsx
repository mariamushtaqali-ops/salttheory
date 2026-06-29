'use client'
import { useState } from 'react'
import Link from 'next/link'
import Logo from '@/components/ui/Logo'
import NewsletterSignup from '@/components/ui/NewsletterSignup'
import toast from 'react-hot-toast'

const INSTAGRAM_URL = 'https://instagram.com/salttheorylab'
const EMAIL = 'contact@salttheorylab.com'

export default function ContactPage() {
  const [name, setName]       = useState('')
  const [email, setEmail]     = useState('')
  const [subject, setSubject] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent]       = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name || !email || !message) { toast.error('Please fill in all required fields'); return }
    setLoading(true)
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, subject, message }),
      })
      if (!res.ok) throw new Error()
      setSent(true)
      toast.success('Message sent!')
    } catch {
      toast.error('Something went wrong — email us directly')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-cream flex flex-col">

      {/* Main */}
      <main className="flex-1 max-w-[860px] mx-auto w-full px-6 py-14">

        {/* Header */}
        <div className="mb-10">
          <div className="eyebrow mb-3">Get in touch</div>
          <h1 className="font-serif text-[40px] md:text-[52px] text-ink leading-tight mb-3">Contact us</h1>
          <p className="text-[15px] text-muted leading-relaxed max-w-[480px]">
            Questions, feedback, or help with your account — we reply within 24 hours.
          </p>
        </div>

        <div className="grid md:grid-cols-[1fr_300px] gap-6 items-start">

          {/* Form */}
          <div className="card p-6">
            {sent ? (
              <div className="text-center py-10">
                <div className="w-14 h-14 bg-green/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-green text-[24px]">✦</span>
                </div>
                <h2 className="font-serif text-[22px] text-ink mb-2">Message sent</h2>
                <p className="text-[14px] text-muted leading-relaxed mb-6 max-w-[280px] mx-auto">
                  Thank you for reaching out. We'll reply to {email} within 24 hours.
                </p>
                <button
                  onClick={() => { setSent(false); setName(''); setEmail(''); setSubject(''); setMessage('') }}
                  className="btn-ghost px-5 py-2.5 text-[13px]">
                  Send another message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wide text-muted mb-1.5">
                      Name <span className="text-orange">*</span>
                    </label>
                    <input className="input" type="text" placeholder="Your name"
                      value={name} onChange={e => setName(e.target.value)} required />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wide text-muted mb-1.5">
                      Email <span className="text-orange">*</span>
                    </label>
                    <input className="input" type="email" placeholder="your@email.com"
                      value={email} onChange={e => setEmail(e.target.value)} required />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wide text-muted mb-1.5">Subject</label>
                  <select className="input text-[14px] cursor-pointer"
                    value={subject} onChange={e => setSubject(e.target.value)}>
                    <option value="">Select a topic</option>
                    <option>General question</option>
                    <option>Upgrade / payment help</option>
                    <option>Bug report</option>
                    <option>Feature request</option>
                    <option>Partnership</option>
                    <option>Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wide text-muted mb-1.5">
                    Message <span className="text-orange">*</span>
                  </label>
                  <textarea className="input resize-none" rows={6}
                    placeholder="Tell us what's on your mind..."
                    value={message} onChange={e => setMessage(e.target.value)} required />
                </div>

                <button type="submit" disabled={loading}
                  className="btn-primary w-full py-3.5 text-[14px] disabled:opacity-60">
                  {loading ? 'Sending…' : 'Send message ✦'}
                </button>
              </form>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-3">

            <div className="card p-5">
              <p className="text-[10px] font-bold uppercase tracking-wide text-muted mb-3">Email</p>
              <a href={`mailto:${EMAIL}`} className="text-[14px] font-semibold text-orange hover:underline">
                {EMAIL}
              </a>
              <p className="text-[12px] text-muted mt-1 leading-relaxed">We reply within 24 hours</p>
            </div>

            <div className="card p-5">
              <p className="text-[10px] font-bold uppercase tracking-wide text-muted mb-3">Instagram</p>
              <a href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-3 group">
                <div className="w-9 h-9 rounded-[10px] flex items-center justify-center flex-shrink-0"
                  style={{background:'linear-gradient(135deg,#E96B3C,#9B6A45)'}}>
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="none">
                    <rect x="2" y="2" width="20" height="20" rx="5" stroke="white" strokeWidth="1.8"/>
                    <circle cx="12" cy="12" r="4.5" stroke="white" strokeWidth="1.8"/>
                    <circle cx="17.5" cy="6.5" r="1" fill="white"/>
                  </svg>
                </div>
                <div>
                  <p className="text-[14px] font-semibold text-ink group-hover:text-orange transition-colors">@salttheorylab</p>
                  <p className="text-[11px] text-muted">Follow on Instagram</p>
                </div>
              </a>
            </div>

            <div className="card p-5">
              <p className="text-[10px] font-bold uppercase tracking-wide text-muted mb-2">Upgrade your account</p>
              <p className="text-[13px] text-muted leading-relaxed mb-3">
                Pay via EasyPaisa or JazzCash and send your screenshot — we'll upgrade you within a few hours.
              </p>
              <Link href="/account" className="text-[13px] font-bold text-green hover:underline">
                Go to account →
              </Link>
            </div>

          </div>
        </div>

        {/* Newsletter section */}
        <div className="mt-10 bg-green rounded-[20px] p-8">
          <div className="grid md:grid-cols-2 gap-6 items-center">
            <div>
              <div className="eyebrow white mb-2">Weekly newsletter</div>
              <h2 className="font-serif text-[24px] text-white mb-2 leading-snug">
                Recipes & food business insights
              </h2>
              <p className="text-[13px] text-white/60 leading-relaxed">
                One email a week — recipes, pricing tips, and something worth reading.
              </p>
            </div>
            <div>
              <NewsletterSignup dark />
              <p className="text-[11px] text-white/30 mt-2">Unsubscribe any time.</p>
            </div>
          </div>
        </div>

      </main>

      {/* Footer */}
      <footer className="bg-ink py-8">
        <div className="max-w-[900px] mx-auto px-6 flex flex-wrap justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            <Logo showName={false} size={32} />
            <span className="font-serif text-[16px] text-white">Salt Theory</span>
          </div>
          <div className="flex gap-5 text-[12px] text-white/40">
            <Link href="/blog" className="hover:text-white transition-colors">Blog</Link>
            <Link href="/contact" className="hover:text-white transition-colors">Contact</Link>
            <a href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer"
              className="hover:text-white transition-colors">Instagram</a>
          </div>
        </div>
        <div className="text-center text-[11px] text-white/25 mt-6">
          © 2026 Salt Theory · salttheorylab.com
        </div>
      </footer>

    </div>
  )
}
