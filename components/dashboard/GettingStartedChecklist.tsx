'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'

interface Props {
  costingDone: boolean
  recipeDone: boolean
  profileDone: boolean
}

export default function GettingStartedChecklist({ costingDone, recipeDone, profileDone }: Props) {
  const [journalDone, setJournalDone] = useState(false)

  useEffect(() => {
    try {
      setJournalDone(localStorage.getItem('salttheory_journal_read_v1') === 'true')
    } catch {
      // ignore
    }
  }, [])

  const items = [
    { label: 'Cost your first dish',    done: costingDone, href: '/plate-profit' },
    { label: 'Create your first recipe', done: recipeDone,  href: '/recipe-gennie' },
    { label: 'Save your first costing', done: costingDone, href: '/plate-profit' },
    { label: 'Read one Journal article', done: journalDone, href: '/blog' },
    { label: 'Complete your profile',   done: profileDone, href: '/account' },
  ]
  const completedCount = items.filter(i => i.done).length

  // All done — no need to keep showing the checklist
  if (completedCount === items.length) return null

  return (
    <div className="card p-5 mb-5">
      <div className="flex items-center justify-between mb-4">
        <p className="section-label text-[10px] font-bold uppercase tracking-[0.1em] text-muted">Getting started</p>
        <p className="text-[11px] font-semibold text-muted">{completedCount} / {items.length} complete</p>
      </div>
      <div className="h-1.5 bg-border rounded-full overflow-hidden mb-4">
        <div
          className="h-full bg-green rounded-full transition-all duration-500 ease-out"
          style={{ width: `${(completedCount / items.length) * 100}%` }}
        />
      </div>
      <div className="space-y-1">
        {items.map(item => (
          <Link
            key={item.label}
            href={item.href}
            className={`flex items-center gap-3 px-2 py-2 rounded-[8px] transition-colors
              ${item.done ? '' : 'hover:bg-cream'}`}
          >
            <span
              className={`w-[18px] h-[18px] rounded-full border flex items-center justify-center flex-shrink-0
                transition-all duration-300
                ${item.done ? 'bg-green border-green' : 'border-border'}`}
            >
              {item.done && (
                <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                  <path d="M1 4l2.5 2.5L9 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              )}
            </span>
            <span className={`text-[13px] ${item.done ? 'text-muted line-through' : 'text-ink font-medium'}`}>
              {item.label}
            </span>
          </Link>
        ))}
      </div>
    </div>
  )
}
