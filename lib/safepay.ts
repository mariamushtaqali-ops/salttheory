import { Safepay } from '@sfpy/node-sdk'
import { Environment } from '@sfpy/node-sdk/dist/utils/constants'

// Single shared Safepay client, configured from env vars.
// SAFEPAY_ENVIRONMENT should be 'sandbox' while testing, 'production' once live.
const env = process.env.SAFEPAY_ENVIRONMENT === 'production'
  ? Environment.Production
  : Environment.Sandbox

export const safepay = new Safepay({
  environment: env,
  apiKey: process.env.SAFEPAY_API_KEY!,
  v1Secret: process.env.SAFEPAY_V1_SECRET!,
  webhookSecret: process.env.SAFEPAY_WEBHOOK_SECRET!,
})

export const SAFEPAY_PRO_PLAN_ID = process.env.SAFEPAY_PRO_PLAN_ID!
