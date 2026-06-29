import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  try {
    // Verify admin secret header
    const secret = req.headers.get('x-admin-secret')
    if (secret !== process.env.ADMIN_SECRET) {
      return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
    }

    const { userId, tier = 'pro' } = await req.json()
    if (!userId) return NextResponse.json({ error: 'userId required' }, { status: 400 })

    const supabase = createClient()

    const { error } = await supabase
      .from('profiles')
      .update({
        tier,
        billing_date: new Date().toISOString(),
        // Reset usage counts on upgrade
        recipe_count: 0,
        costing_count: 0,
      })
      .eq('id', userId)

    if (error) throw error

    return NextResponse.json({ success: true, userId, tier })
  } catch (e) {
    console.error('Upgrade error:', e)
    return NextResponse.json({ error: 'Upgrade failed' }, { status: 500 })
  }
}
