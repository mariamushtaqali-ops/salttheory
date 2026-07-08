'use client'
import { useEffect } from 'react'

// Soft, client-side signal only — used to tick off the "Read one Journal
// article" item on the Getting Started checklist. This is per-browser, not
// per-account, since there's no journal_read column in the database yet.
export default function MarkJournalRead() {
  useEffect(() => {
    try {
      localStorage.setItem('salttheory_journal_read_v1', 'true')
    } catch {
      // localStorage unavailable (private browsing etc.) — fail silently
    }
  }, [])
  return null
}
