import Stripe from 'stripe'

import type { EventHandler, H3Event } from 'h3'
import { eventHandler, getHeader, getMethod, isMethod, readRawBody, setResponseStatus } from 'h3'

/**
 * Resolve the default Stripe secret from environment variables.
 *
 * Resolution order:
 * ```ts
 * `NUXT_STRIPE_SECRET` || `STRIPE_CLIENT_SECRET` || `STRIPE_SECRET`
 * ```
 */
export function defaultStripeSecret(): string {
  return process.env.NUXT_STRIPE_SECRET || process.env.STRIPE_CLIENT_SECRET || process.env.STRIPE_SECRET || ''
}

/**
 * Resolve the default Stripe webhook secret from environment variables.
 *
 * Resolution order:
 * ```ts
 * `NUXT_STRIPE_WEBHOOK_SECRET` || `STRIPE_WEBHOOK_SECRET`
 * ```
 */
export function defaultStripeWebhookSecret(): string {
  return process.env.NUXT_STRIPE_WEBHOOK_SECRET || process.env.STRIPE_WEBHOOK_SECRET || ''
}

export interface CreateStripeOptions {
  /**
   * @default
   * ```ts
   * // Nuxt has highest priority
   * process.env.NUXT_STRIPE_WEBHOOK_SECRET || process.env.STRIPE_WEBHOOK_SECRET
   * ```
   *
   * @see {@link defaultStripeWebhookSecret}
   */
  webhookSecret?: string

  /**
   * A stripe instance.
   *
   * When set, {@link apiKey} and {@link config} are ignored.
   */
  stripe?: Stripe

  /**
   * ### Note:
   * This field is not used if {@link stripe} is set.
   *
   * @default
   * ```ts
   * // Nuxt has highest priority
   * process.env.NUXT_STRIPE_SECRET || process.env.STRIPE_CLIENT_SECRET || process.env.STRIPE_SECRET
   * ```
   *
   * @see {@link defaultStripeSecret}
   */
  apiKey?: string

  /**
   * ### Note:
   * This field is not used if {@link stripe} is set.
   *
   * Default api version `2022-11-15`.
   */
  config?: Partial<Stripe.StripeConfig>
}

/**
 * Create a default stripe client, resolving missing properties from environment variables.
 */
export function createDefaultStripe(options?: CreateStripeOptions) {
  const webhookSecret = options?.webhookSecret || defaultStripeWebhookSecret()
  const stripe = options?.stripe || new Stripe(options?.apiKey || defaultStripeSecret(), {
    apiVersion: '2022-11-15',
    ...options?.config,
  })

  return {
    webhookSecret,
    stripe,
  }
}

export interface StripeEventOptions {
  endpointSecret: string
  stripe: Stripe
}

/**
 * Create a {@link Stripe.Event}.
 *
 * ### Note:
 * This method uses {@link readRawBody} and thus only accepts `POST`, `PUT`, `PATCH`, `DELETE` requests.
 *
 * ### Example:
 * ```ts
 * // create the event
 * await createStripeEvent(event, stripe, endpointSecret)
 * ```
 *
 * Optionally, you can check if a method is valid with:
 * ```ts
 * if (!isMethod(event, ['POST', 'PUT', 'PATCH', 'DELETE'])) {
 *  setResponseStatus(event, 400)
 *
 *  return `Unsupported Method: ${getMethod(event)}`
 * }
 * ```
 */
export async function createStripeEvent(event: H3Event, { stripe, endpointSecret }: StripeEventOptions): Promise<Stripe.Event> {
  // get the stripe signature from the header
  const sig = getHeader(event, 'stripe-signature')

  // read the raw body
  const payload = await readRawBody(event)

  // construct the event
  const stripeEvent = stripe.webhooks.constructEvent(payload!, sig!, endpointSecret)

  return stripeEvent
}

export interface StripeEventHandlerContext {
  /**
   * The event.
   */
  event: H3Event

  /**
   * The Stripe instance.
   *
   * This instance is created only once and recycled throughout the lifespan of the application.
   */
  stripe: Stripe

  /**
   * The Stripe Webhook event.
   */
  stripeEvent: Stripe.Event
}

export type StripeEventHandler = (context: StripeEventHandlerContext) => void | Promise<void>

export type StripeEventHandlerResult = {
  ok: true
  data: any
} | {
  ok: false
  message: string
}

/**
 * Create a Stripe webhook handler.
 *
 * Throw an exception to reject the webhook event, the exception message will be available in the Stripe dashboard.
 */
export function defineStripeWebhook(handler: StripeEventHandler, options?: CreateStripeOptions): EventHandler<StripeEventHandlerResult> {
  // NOTE: Stripe only sends webhooks from a specific set of IP: https://stripe.com/files/ips/ips_webhooks.txt
  // however, we do not enforce that as explained below.

  // Use a WAF (Web Application Firewall) to block incoming request to your specified webhook endpoint.
  // In serverless, you are charged for each invocation, and terminiate the request processing
  // earlier will not make a significative difference.
  // Regardless, a WAF is specifically design to protect your server from malicious attacks,
  // use the proper tool and don't hack yourself by hacking your code.
  // The list of Stripe IP can be found at the official documentation: https://stripe.com/docs/ips

  /**
   * The Stripe instance.
   */
  let stripe: Stripe

  /**
   * The Stripe webhook secret.
   */
  let webhookSecret: string

  return eventHandler<StripeEventHandlerResult>(async (event: H3Event) => {
    // Stripe allows for GET webhooks as well, we do not, reject all non-body requests
    if (!isMethod(event, ['POST', 'PUT', 'PATCH', 'DELETE'])) {
      setResponseStatus(event, 400)

      return {
        ok: false,
        message: `Unsupported Method: ${getMethod(event)}`,
      }
    }

    let result: any

    try {
      // create the Stripe instance, lazily
      if (!stripe) {
        const { stripe: defaultStripe, webhookSecret: defaultWebhookSecret } = createDefaultStripe(options)

        webhookSecret = defaultWebhookSecret
        stripe = defaultStripe
      }

      // construct the stripe event
      const stripeEvent = await createStripeEvent(event, {
        stripe,
        endpointSecret: webhookSecret,
      })

      // run the handler
      result = await handler({
        event,
        stripe,
        stripeEvent,
      })
    }
    catch (e: any) {
      // it is highly unlikely you want error in a webhook, log the error
      console.error(`Stripe Webhook Error: ${e}`)

      setResponseStatus(event, 400)
      return {
        ok: false,
        message: getErrorMessage(e),
      }
    }

    // signal back stripe we have processed the event
    return {
      ok: true,
      data: result,
    }
  })
}

/**
 * Extract the `message` property from an error.
 */
function getErrorMessage(e: any): string {
  if (typeof e === 'string') {
    return e || ''
  }

  if (typeof e.message === 'string') {
    return e.message || ''
  }

  return ''
}
