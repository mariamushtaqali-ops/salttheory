import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { isRateLimited, getClientIp } from '@/lib/rateLimit'

export async function POST(req: NextRequest) {
  try {
    const ip = getClientIp(req)
    if (await isRateLimited(`subscribe:${ip}`, 5, 60)) {
      return NextResponse.json({ error: 'Too many attempts — please try again in a bit' }, { status: 429 })
    }

    const { email, source = 'homepage' } = await req.json()
    if (!email) return NextResponse.json({ error: 'Email required' }, { status: 400 })

    const supabase = createClient()

    // Save to Supabase — ignore duplicate errors
    const { error: dbError } = await supabase
      .from('subscribers')
      .insert({ email, source })

    if (dbError && !dbError.message.includes('duplicate') && !dbError.code?.includes('23505')) {
      console.error('Supabase insert error:', dbError)
    }

    // Push to Beehiiv
    if (process.env.BEEHIIV_API_KEY && process.env.BEEHIIV_PUBLICATION_ID) {
      const beehiivRes = await fetch(
        `https://api.beehiiv.com/v2/publications/${process.env.BEEHIIV_PUBLICATION_ID}/subscriptions`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${process.env.BEEHIIV_API_KEY}`,
          },
          body: JSON.stringify({
            email,
            reactivate_existing: false,
            send_welcome_email: true,
            utm_source: source,
            utm_medium: 'organic',
          }),
        }
      )
      if (!beehiivRes.ok) {
        console.error('Beehiiv error:', await beehiivRes.text())
      }
    }

    return NextResponse.json({ success: true })
  } catch (e: any) {
    if (e?.code === '23505') {
      return NextResponse.json({ success: true })
    }
    console.error('Subscribe error:', e)
    return NextResponse.json({ error: 'Failed to subscribe' }, { status: 500 })
  }
}
