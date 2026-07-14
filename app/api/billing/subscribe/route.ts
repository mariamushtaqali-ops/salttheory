import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getSafepay, SAFEPAY_PRO_PLAN_ID } from '@/lib/safepay'

export async function POST(req: NextRequest) {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
    }

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL!

    // `reference` is how the webhook will know which Salt Theory user this
    // subscription belongs to — Safepay echoes it back on every webhook event.
    const url = await getSafepay().checkout.createSubscription({
      planId: SAFEPAY_PRO_PLAN_ID,
      reference: user.id,
      redirectUrl: `${siteUrl}/account?upgraded=1`,
      cancelUrl: `${siteUrl}/account?upgrade_cancelled=1`,
    })

    return NextResponse.json({ url })
  } catch (e: any) {
    console.error('Safepay subscribe error:', e?.message || e)
    return NextResponse.json({ error: 'Could not start checkout' }, { status: 500 })
  }
}
