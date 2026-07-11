import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import NewsletterSignup from '@/components/ui/NewsletterSignup'

export const metadata = {
  title: 'Blog',
  description: 'Recipes, pricing tips, and food business insights for Pakistani food entrepreneurs — one post a week.',
  alternates: {
    canonical: '/journal',
  },
  openGraph: {
    title: 'Salt Theory Blog',
    description: 'Recipes, pricing tips, and food business insights for Pakistani food entrepreneurs — one post a week.',
    url: 'https://salttheorylab.com/journal',
    type: 'website',
  },
}

export default async function BlogPage() {
  const supabase = createClient()
  const { data: posts } = await supabase
    .from('blog_posts')
    .select('id, slug, title, excerpt, created_at')
    .eq('published', true)
    .order('created_at', { ascending: false })

  return (
    <>
      <main className="max-w-[860px] mx-auto px-6 py-12">
        <div className="mb-10">
          <div className="eyebrow mb-3">Salt Theory Blog</div>
          <h1 className="font-serif text-[40px] md:text-[52px] text-ink mb-4 leading-tight">
            Recipes, pricing & food business insights
          </h1>
          <p className="text-[15px] text-muted leading-relaxed max-w-[520px]">
            Practical content for home chefs, caterers, and food entrepreneurs. One post a week.
          </p>
        </div>

        {posts && posts.length > 0 ? (
          <div className="space-y-4">
            {posts.map(post => (
              <Link
                key={post.id}
                href={`/journal/${post.slug}`}
                className="block card p-6 hover:-translate-y-1 hover:shadow-md transition-all"
              >
                <p className="text-[11px] font-bold uppercase tracking-[0.1em] text-muted mb-2">
                  {new Date(post.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
                </p>
                <h2 className="font-serif text-[22px] text-ink mb-2 leading-snug">{post.title}</h2>
                {post.excerpt && <p className="text-[14px] text-muted leading-relaxed">{post.excerpt}</p>}
                <span className="inline-block mt-3 text-[12px] font-bold text-orange">Read more →</span>
              </Link>
            ))}
          </div>
        ) : (
          <div className="card border-dashed p-12 text-center">
            <p className="font-serif text-[22px] text-ink mb-2">Posts coming soon</p>
            <p className="text-[14px] text-muted">Subscribe to the newsletter to get notified.</p>
          </div>
        )}

        {/* Newsletter CTA */}
        <div className="mt-12 bg-green rounded-[20px] p-8 md:p-10">
          <div className="max-w-[480px]">
            <div className="eyebrow white mb-3">Weekly newsletter</div>
            <h2 className="font-serif text-[28px] text-white mb-3 leading-snug">
              Get recipes & pricing tips every week
            </h2>
            <p className="text-[14px] text-white/60 mb-6 leading-relaxed">
              One email a week — a seasonal recipe, a pricing tip for food businesses, and something worth reading.
            </p>
            <NewsletterSignup dark />
          </div>
        </div>
      </main>
    </>
  )
}
