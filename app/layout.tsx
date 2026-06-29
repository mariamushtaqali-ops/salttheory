import type { Metadata } from 'next'
import { Toaster } from 'react-hot-toast'
import TopNav from '@/components/layout/TopNav'
import './globals.css'

export const metadata: Metadata = {
  title: 'Salt Theory — Recipe Gennie & Plate Profit',
  description: 'AI-powered recipe generator and food costing tool for Asian food businesses. Generate any recipe, know your margin, grow with confidence.',
  keywords: ['recipe generator', 'food costing', 'Asian recipes', 'Pakistani recipes', 'food business', 'plate profit'],
  openGraph: {
    title: 'Salt Theory — Create · Sell · Grow',
    description: 'AI tools for food businesses. Recipe Gennie generates any recipe. Plate Profit shows your exact margin.',
    url: 'https://salttheorylab.com',
    siteName: 'Salt Theory',
    type: 'website',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <TopNav />
        <div className="pt-[64px]">
          {children}
        </div>
        <Toaster
          position="top-center"
          toastOptions={{
            duration: 3000,
            style: {
              fontFamily: 'Manrope, sans-serif',
              fontSize: '13px',
              borderRadius: '100px',
              padding: '10px 20px',
            },
            success: {
              style: { background: '#7A8B5C', color: '#fff' },
              iconTheme: { primary: '#fff', secondary: '#7A8B5C' },
            },
            error: {
              style: { background: '#E96B3C', color: '#fff' },
              iconTheme: { primary: '#fff', secondary: '#E96B3C' },
            },
          }}
        />
      </body>
    </html>
  )
}
