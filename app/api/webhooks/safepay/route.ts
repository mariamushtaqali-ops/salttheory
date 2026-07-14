import { NextRequest, NextResponse } from 'next/server'
import { getSafepay } from '@/lib/safepay'
import { createAdminClient } from '@/lib/supabase/admin'

// NOTE: this webhook has been built from Safepay's official Node SDK source
// and its own test fixtures (the actual API docs site doesn't render statically),
// confirming the exact shape of a `payment:created` event. Safepay's exact event
// name(s) for subscription-specific lifecycle changes (renewal, cancellation,
// past-due) were NOT confirmed against real docs — only inferred. The first real
// webhook Safepay sends in sandbox testing should be checked against the logging
// below before relying on this in production. Do not skip that check.

export async function POST(req: NextRequest) {
  const rawBody = await req.text()
  let parsed: any
  try {
    parsed = JSON.parse(rawBody)
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const headers: Record<string, string> = {}
  req.headers.forEach((value, key) => { headers[key] = value })

  const isValid = getSafepay().verify.webhook({ body: parsed, headers })
  if (!isValid) {
    console.error('Safepay webhook: signature verification failed')
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
  }

  const event = parsed?.data
  console.log('Safepay webhook received:', JSON.stringify(event))

  const type = event?.type
  const notification = event?.notification

  // Successful payment (covers both the first subscription payment and
  // each recurring renewal charge — Safepay doesn't appear to have a
  // separate "subscription renewed" event distinct from the payment itself).
  if (type === 'payment:created' && notification?.state === 'PAID') {
    const reference: string | undefined =
      notification.reference || notification.metadata?.reference

    if (!reference) {
      console.error('Safepay webhook: no reference on paid notification, cannot match to a user', notification)
      return NextResponse.json({ received: true })
    }

    const admin = createAdminClient()
    const { data: profile, error: lookupError } = await admin
      .from('profiles')
      .select('id')
      .eq('id', reference)
      .single()

    if (lookupError || !profile) {
      console.error('Safepay webhook: no profile matching reference', reference, lookupError)
      return NextResponse.json({ received: true })
    }

    const { error: updateError } = await admin
      .from('profiles')
      .update({
        tier: 'pro',
        billing_date: new Date().toISOString(),
        recipe_count: 0,
        safepay_subscription_id: notification.tracker ?? null,
      })
      .eq('id', reference)

    if (updateError) {
      console.error('Safepay webhook: failed to upgrade profile', reference, updateError)
      return NextResponse.json({ error: 'Update failed' }, { status: 500 })
    }

    console.log('Safepay webhook: upgraded user to Pro', reference)
  } else {
    // Unrecognised or not-yet-handled event type — log it so we can see
    // real subscription lifecycle event names as Safepay sends them, but
    // still return 200 so Safepay doesn't keep retrying delivery.
    console.log('Safepay webhook: unhandled event type', type, notification?.state)
  }

  return NextResponse.json({ received: true })
}
