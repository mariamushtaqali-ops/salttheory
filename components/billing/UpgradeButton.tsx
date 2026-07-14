'use client'

import { useState } from 'react'

export default function UpgradeButton() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleClick() {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/billing/subscribe', { method: 'POST' })
      const data = await res.json()
      if (!res.ok || !data.url) {
        throw new Error(data.error || 'Could not start checkout')
      }
      window.location.href = data.url
    } catch (e: any) {
      setError('Something went wrong starting checkout. Please try again.')
      setLoading(false)
    }
  }

  return (
    <div className="flex-shrink-0">
      <button
        onClick={handleClick}
        disabled={loading}
        className="inline-flex items-center gap-2 bg-orange text-white font-bold
                   text-[13px] px-5 py-2.5 rounded-full hover:bg-[#C85A2C] transition-colors
                   disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {loading ? 'Starting checkout…' : 'Upgrade — PKR 999/mo ✦'}
      </button>
      {error && (
        <p className="text-[11px] text-red-400 mt-2 text-center">{error}</p>
      )}
    </div>
  )
}
