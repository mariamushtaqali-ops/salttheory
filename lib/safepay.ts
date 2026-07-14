import { Safepay } from '@sfpy/node-sdk'
import { Environment } from '@sfpy/node-sdk/dist/utils/constants'

// Lazily construct the Safepay client on first use, rather than at module
// load time. Building it eagerly means a missing/misconfigured env var
// crashes the entire Next.js build (as happened before this fix) — every
// route and page, not just checkout. Lazy init means only requests that
// actually touch Safepay fail if config is missing, and they fail with a
// clear runtime error instead of taking down the whole deployment.
let _safepay: Safepay | null = null

export function getSafepay(): Safepay {
  if (_safepay) return _safepay

  const apiKey = process.env.SAFEPAY_API_KEY
  const v1Secret = process.env.SAFEPAY_V1_SECRET
  const webhookSecret = process.env.SAFEPAY_WEBHOOK_SECRET

  if (!apiKey || !v1Secret || !webhookSecret) {
    throw new Error(
      'Safepay is not configured — missing SAFEPAY_API_KEY, SAFEPAY_V1_SECRET, or SAFEPAY_WEBHOOK_SECRET'
    )
  }

  const env = process.env.SAFEPAY_ENVIRONMENT === 'production'
    ? Environment.Production
    : Environment.Sandbox

  _safepay = new Safepay({ environment: env, apiKey, v1Secret, webhookSecret })
  return _safepay
}

export const SAFEPAY_PRO_PLAN_ID = process.env.SAFEPAY_PRO_PLAN_ID!
