import type { H3Event } from 'h3'
import { assertMethod, eventHandler, readRawBody } from 'h3'

import type Stripe from 'stripe'

import { useStripe } from './useStripe'
import { createStripeEvent } from './createStripeEvent'

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
