import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Free Weekly Restaurant Numbers Tracker',
  description: 'Download the free Salt Theory Weekly Performance Tracker — a printable checklist for tracking sales, food cost, labour cost, prime cost, waste, and profit every week.',
  alternates: {
    canonical: '/weekly-tracker',
  },
  openGraph: {
    title: 'Free Weekly Restaurant Numbers Tracker — Salt Theory',
    description: 'A printable weekly tracker for the numbers every restaurant, café, or cloud kitchen owner should check.',
    url: 'https://salttheorylab.com/weekly-tracker',
    type: 'website',
  },
}

export default function WeeklyTrackerLayout({ children }: { children: React.ReactNode }) {
  return children
}
