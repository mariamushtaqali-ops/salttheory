import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })

    const { data: profile } = await supabase
      .from('profiles').select('is_admin').eq('id', user.id).single()
    if (!profile?.is_admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    const { title, slug, excerpt, body } = await req.json()
    if (!title || !slug || !body) {
      return NextResponse.json({ error: 'title, slug and body required' }, { status: 400 })
    }

    // Save — published true by default
    const { data: post, error } = await supabase
      .from('blog_posts')
      .insert({ title, slug, excerpt, body, published: true })
      .select().single()

    if (error) throw error

    // Auto-send to Beehiiv
    if (process.env.BEEHIIV_API_KEY && process.env.BEEHIIV_PUBLICATION_ID) {
      try {
        await fetch(
          `https://api.beehiiv.com/v2/publications/${process.env.BEEHIIV_PUBLICATION_ID}/posts`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${process.env.BEEHIIV_API_KEY}`,
            },
            body: JSON.stringify({
              title,
              subtitle: excerpt || '',
              content: body,
              status: 'confirmed',
              send_at: new Date().toISOString(),
            }),
          }
        )
      } catch (e) {
        console.error('Beehiiv send error:', e)
      }
    }

    return NextResponse.json({ success: true, post })
  } catch (e: any) {
    console.error('Blog post error:', e)
    return NextResponse.json({ error: e.message || 'Failed' }, { status: 500 })
  }
}
