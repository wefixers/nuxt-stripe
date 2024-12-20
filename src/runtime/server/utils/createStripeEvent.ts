import { Stripe } from 'stripe'
import type { H3Event } from 'h3'
import { getHeader, readRawBody } from 'h3'

import { useStripe } from './useStripe'

import { useRuntimeConfig } from '#imports'

export interface CreateStripeEventOptions {
  webhookSecret?: string
  stripe?: Stripe
}

/**
 * Constructs and verifies the signature of an Event from the provided details.
 *
 * ### Example:
 * ```ts
 * export default eventHandler(async (e) => {
 *  const event = await createStripeEvent(e)
 *   switch (event.type) {
 *    ...
 *   }
 * })
 * ```
 */
export async function createStripeEvent(event: H3Event, options?: CreateStripeEventOptions): Promise<Stripe.Event> {
  const stripe = options?.stripe || useStripe()

  const runtimeConfig = useRuntimeConfig()

  const webhookSecret = options?.webhookSecret || runtimeConfig.stripe.webhook.secret

  // Get the stripe signature from the header
  const signature = getHeader(event, 'stripe-signature')

  // Read the raw body
  const payload = await readRawBody(event, 'utf-8')

  if (!globalThis.crypto) {
    // Construct the event
    return stripe.webhooks.constructEvent(
      payload!,
      signature!,
      webhookSecret,
    )
  }

  // Construct the event
  return stripe.webhooks.constructEventAsync(
    payload!,
    signature!,
    webhookSecret,
    undefined,
    Stripe.createSubtleCryptoProvider(),
  )
}
