import { createClient } from '@/lib/supabase/server'
import { createClient as createPublicClient } from '@supabase/supabase-js'
import { notFound } from 'next/navigation'
import Logo from '@/components/ui/Logo'
import Link from 'next/link'
import NewsletterSignup from '@/components/ui/NewsletterSignup'
import type { Metadata } from 'next'

const SITE_URL = 'https://salttheorylab.com'

function publicSupabase() {
  return createPublicClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

// Strips HTML tags so the excerpt fallback is safe to use as a plain-text meta description
function stripHtml(html: string, maxLength = 155) {
  const text = html.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim()
  return text.length > maxLength ? `${text.slice(0, maxLength).trim()}…` : text
}

export async function generateMetadata(
  { params }: { params: { slug: string } }
): Promise<Metadata> {
  const supabase = publicSupabase()
  const { data: post } = await supabase
    .from('blog_posts')
    .select('title, excerpt, body, created_at, slug')
    .eq('slug', params.slug)
    .eq('published', true)
    .single()

  if (!post) return {}

  const description = post.excerpt || stripHtml(post.body)
  const url = `${SITE_URL}/journal/${post.slug}`

  return {
    title: post.title,
    description,
    alternates: {
      canonical: url,
    },
    openGraph: {
      title: post.title,
      description,
      url,
      type: 'article',
      publishedTime: post.created_at,
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description,
    },
  }
}

// Pre-render published posts at build time so search engines get fully-formed HTML immediately
export async function generateStaticParams() {
  const supabase = publicSupabase()
  const { data: posts } = await supabase
    .from('blog_posts')
    .select('slug')
    .eq('published', true)

  return (posts ?? []).map((post) => ({ slug: post.slug }))
}

export default async function BlogPostPage({ params }: { params: { slug: string } }) {
  const supabase = createClient()
  const { data: post } = await supabase
    .from('blog_posts')
    .select('*')
    .eq('slug', params.slug)
    .eq('published', true)
    .single()

  if (!post) notFound()

  const articleJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    datePublished: post.created_at,
    dateModified: post.created_at,
    author: { '@type': 'Organization', name: 'Salt Theory' },
    publisher: { '@type': 'Organization', name: 'Salt Theory', logo: { '@type': 'ImageObject', url: `${SITE_URL}/logo.png` } },
    mainEntityOfPage: `${SITE_URL}/journal/${post.slug}`,
    ...(post.excerpt ? { description: post.excerpt } : {}),
  }

  return (
    <>
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
    />
    <div className="min-h-screen bg-cream flex flex-col">
      
      <main className="flex-1 max-w-[720px] mx-auto w-full px-6 py-12">
        <Link href="/journal" className="text-[12px] font-bold text-muted hover:text-orange transition-colors mb-6 block">
          ← Back to blog
        </Link>

        <p className="text-[11px] font-bold uppercase tracking-[0.1em] text-muted mb-3">
          {new Date(post.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
        </p>
        <h1 className="font-serif text-[36px] md:text-[48px] text-ink mb-6 leading-tight">{post.title}</h1>

        <div
          className="max-w-none text-ink leading-relaxed
                     [&>h2]:font-serif [&>h2]:text-[26px] [&>h2]:mt-8 [&>h2]:mb-3 [&>h2]:text-ink
                     [&>p]:text-[15px] [&>p]:leading-[1.8] [&>p]:mb-4 [&>p]:text-ink
                     [&>ul]:text-[15px] [&>ul]:leading-[1.8] [&>ul]:mb-4 [&>ul]:pl-5 [&>ul]:list-disc
                     [&>ol]:text-[15px] [&>ol]:leading-[1.8] [&>ol]:mb-4 [&>ol]:pl-5 [&>ol]:list-decimal
                     [&>ul>li]:mb-1.5 [&>ol>li]:mb-1.5
                     [&>strong]:font-bold [&>strong]:text-ink"
          dangerouslySetInnerHTML={{ __html: post.body }}
        />

        {/* Newsletter CTA */}
        <div className="mt-12 bg-green rounded-[20px] p-8">
          <div className="grid md:grid-cols-2 gap-6 items-center">
            <div>
              <h2 className="font-serif text-[24px] text-white mb-2 leading-snug">
                Like this? Get more every week.
              </h2>
              <p className="text-[14px] text-white/60 leading-relaxed">
                Recipes, pricing tips, and food business insights — one email a week.
              </p>
            </div>
            <div>
              <NewsletterSignup dark />
              <p className="text-[11px] text-white/30 mt-2">Unsubscribe any time.</p>
            </div>
          </div>
        </div>

        {/* Try the tools */}
        <div className="mt-6 grid grid-cols-2 gap-4">
          <Link href="/auth/signup"
            className="card p-4 hover:-translate-y-1 hover:shadow-md transition-all border-t-2 border-t-orange">
            <p className="text-[11px] font-bold uppercase tracking-wide text-orange mb-1">Recipe Gennie</p>
            <p className="text-[13px] font-semibold text-ink mb-1">Generate any recipe</p>
            <p className="text-[11px] text-muted">Free — 5 recipes/month</p>
          </Link>
          <Link href="/auth/signup"
            className="card p-4 hover:-translate-y-1 hover:shadow-md transition-all border-t-2 border-t-green">
            <p className="text-[11px] font-bold uppercase tracking-wide text-green mb-1">Plate Profit</p>
            <p className="text-[13px] font-semibold text-ink mb-1">Calculate your margin</p>
            <p className="text-[11px] text-muted">Free — 3 dish costings</p>
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-ink py-8 mt-10">
        <div className="max-w-[900px] mx-auto px-6 flex flex-wrap justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            <Logo showName={false} size={32} />
            <span className="font-serif text-[16px] text-white">Salt Theory</span>
          </div>
          <div className="flex gap-5 text-[12px] text-white/40">
            <Link href="/journal" className="hover:text-white transition-colors">Journal</Link>
            <Link href="/contact" className="hover:text-white transition-colors">Contact</Link>
            <a href="https://instagram.com/salttheorylab" target="_blank" rel="noopener noreferrer"
              className="hover:text-white transition-colors">Instagram</a>
            <Link href="/auth/signup" className="hover:text-white transition-colors">Sign up free</Link>
          </div>
        </div>
        <div className="text-center text-[11px] text-white/25 mt-6">
          © 2026 Salt Theory · salttheorylab.com · contact@salttheorylab.com
        </div>
      </footer>
    </div>
    </>
  )
}
