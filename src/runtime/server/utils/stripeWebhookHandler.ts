import type { H3Event } from 'h3'
import type Stripe from 'stripe'

import { assertMethod, eventHandler } from 'h3'

import { createStripeEvent } from './createStripeEvent'
import { useStripe } from './useStripe'

export interface StripeWebhookHandlerContext {
  /**
   * The {@link H3Event} event.
   */
  $event: H3Event

  /**
   * The {@link Stripe} instance.
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
  return eventHandler(async (e) => {
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
