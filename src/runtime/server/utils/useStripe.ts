import Stripe from 'stripe'
import { useRuntimeConfig } from '#imports'

let _stripe: Stripe | undefined

/**
 * Gets the {@link Stripe} runtime instance.
 *
 * Note: this method is intended to be used in the server-side only.
 *
 * If `fetch` is available in the global scope, it will be used as the default HTTP client.
 */
export function useStripe(): Stripe {
  if (_stripe) {
    return _stripe
  }

  const { stripe: { secret, options = {} } } = useRuntimeConfig()

  // // Use the default fetch API as the HTTP client if it is available
  // if (!options.httpClient && (globalThis as any).fetch) {
  //   options.httpClient = Stripe.createFetchHttpClient()
  // }

  _stripe = new Stripe(secret, options)

  return _stripe
}
