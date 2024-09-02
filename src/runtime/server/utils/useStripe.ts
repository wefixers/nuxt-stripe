import Stripe from 'stripe'
import { useRuntimeConfig } from '#imports'

let _stripe: Stripe | undefined

/**
 * Gets the {@link Stripe} runtime instance.
 *
 * This instance is created only once and recycled throughout the lifespan of the application.
 *
 * Note: this method is intended to be used the server-side only.
 *
 * If `fetch` is available in the global scope, it will be used as the default HTTP client.
 */
export function useStripe(): Stripe {
  if (_stripe) {
    return _stripe
  }

  const { stripe: { secret, options = {} } } = useRuntimeConfig()

  // see: https://nuxt.com/docs/guide/going-further/runtime-config#reading
  // On server-side, the entire runtime config is available, but it is read-only to avoid context sharing.
  // Copy the options to avoid mutating the runtime config.
  const config: Stripe.StripeConfig = {
    ...options,
  }

  // Note: The fetch api is pretty standard across major runtimes.
  // Setting it here will fix alot of issues with non Node runtimes.

  // Use the default fetch API as the HTTP client when fetch it is available globally.
  if (!config.httpClient && (globalThis as any).fetch) {
    config.httpClient = Stripe.createFetchHttpClient()
  }

  _stripe = new Stripe(secret, config)

  return _stripe
}
