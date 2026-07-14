import type { Metadata } from 'next'
import { Toaster } from 'react-hot-toast'
import TopNav from '@/components/layout/TopNav'
import './globals.css'

const siteUrl = 'https://salttheorylab.com'
const defaultTitle = 'Salt Theory — Recipe Studio & Plate Profit'
const defaultDescription = 'AI-powered recipe generator and food costing calculator built for home chefs, caterers, and cloud kitchens in Pakistan. Generate any recipe, know your exact margin, price with confidence.'

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: defaultTitle,
    template: '%s — Salt Theory',
  },
  description: defaultDescription,
  keywords: [
    'recipe generator',
    'food costing calculator',
    'food costing Pakistan',
    'Pakistani food business tools',
    'caterer pricing tool',
    'cloud kitchen software',
    'recipe generator Pakistan',
    'plate profit',
    'home chef business tools',
  ],
  authors: [{ name: 'Salt Theory' }],
  creator: 'Salt Theory',
  verification: {
    google: 'o1kE40nHWvQH6RegbbACAZ5XcoY7kgPpXiMd4pHpcjc',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  alternates: {
    canonical: '/',
  },
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
  openGraph: {
    title: 'Salt Theory — Create · Price · Run',
    description: 'AI tools for food businesses. Recipe Studio generates any recipe. Plate Profit shows your exact margin, instantly.',
    url: siteUrl,
    siteName: 'Salt Theory',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Salt Theory — Create, Sell, Grow',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Salt Theory — Create · Price · Run',
    description: 'AI tools for food businesses. Recipe Studio generates any recipe. Plate Profit shows your exact margin, instantly.',
    images: ['/og-image.png'],
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
