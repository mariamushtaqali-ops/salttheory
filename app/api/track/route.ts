import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getAnonId } from '@/lib/anon'

export async function POST(req: NextRequest) {
  try {
    const { event, meta } = await req.json()
    if (!event) return NextResponse.json({ ok: false }, { status: 400 })

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    const anonId = getAnonId()

    await supabase.from('events').insert({
      event_name: event,
      user_id: user?.id ?? null,
      anon_id: anonId,
      meta: meta ?? null,
    })

    return NextResponse.json({ ok: true })
  } catch {
    // Tracking must never break the app — including if the `events`
    // table doesn't exist yet because the PR7 migration hasn't run.
    return NextResponse.json({ ok: true })
  }
}
