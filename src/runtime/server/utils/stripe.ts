import type { H3Event } from 'h3'
import { assertMethod, eventHandler, getHeader, readRawBody } from 'h3'

import Stripe from 'stripe'
import { useRuntimeConfig } from '#imports'

let _stripe: Stripe | undefined

export function useStripe(): Stripe {
  if (_stripe) {
    return _stripe
  }

  const { stripe: { secret, options } } = useRuntimeConfig()

  if (!options.httpClient && (globalThis as any).fetch) {
    options.httpClient = Stripe.createFetchHttpClient()
  }

  _stripe = new Stripe(secret, options)

  return _stripe
}

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

  // get the stripe signature from the header
  const sig = getHeader(event, 'stripe-signature') as string

  // read the raw body
  const payload = await readRawBody(event) as string

  // construct the event
  return stripe.webhooks.constructEvent(payload, sig, webhookSecret)
}

export interface StripeWebhookHandlerContext {
  /**
   * The event.
   */
  $event: H3Event

  /**
   * The Stripe instance.
   *
   * This instance is created only once and recycled throughout the lifespan of the application.
   */
  stripe: Stripe
}

export interface StripeWebhookHandler {
  (event: Stripe.Event, context: StripeWebhookHandlerContext): Promise<any> | any
}

/**
 * Create a {@link Stripe.Event}.
 *
 * ### Note:
 * This method uses {@link readRawBody} and thus only accepts `POST`, `PUT`, `PATCH`, `DELETE` requests.
 *
 * ### Example:
 * ```ts
 * export default stripeWebhookHandler(async (event) => {
 *  switch (event.type) {
 *    case 'payment_intent.succeeded': {
 *      //
 *    }
 *  }
 * })
 * ```
 */
export function stripeWebhookHandler(handler: StripeWebhookHandler) {
  return eventHandler<any>(async (e) => {
    assertMethod(e, ['POST', 'PUT', 'PATCH', 'DELETE'])

    const stripe = useStripe()
    const event = await createStripeEvent(e, {
      stripe,
    })

    const data = await handler(event, {
      stripe,
      $event: e,
    })

    return {
      ok: true,
      data,
    }
  })
}
