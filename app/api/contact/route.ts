import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  try {
    const { name, email, subject, message } = await req.json()
    if (!name || !email || !message) {
      return NextResponse.json({ error: 'Name, email and message required' }, { status: 400 })
    }

    // Save to Supabase for your records
    const supabase = createClient()
    await supabase.from('contact_messages').insert({ name, email, subject, message })

    // Forward to your email via a simple notification
    // For now we just save it — you'll see it in Supabase
    // Later you can add Resend/SendGrid here

    return NextResponse.json({ success: true })
  } catch (e: any) {
    console.error('Contact error:', e)
    return NextResponse.json({ error: 'Failed to send' }, { status: 500 })
  }
}
