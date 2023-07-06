import { useNuxtApp } from '#app'

/**
 * Use Stripe.
 *
 * ### Example:
 * ```ts
 * const { createClient: createStripeClient } = useStripe()
 *
 * const stripe = await createStripeClient()
 *
 * await stripe.redirectToCheckout({
 *   sessionId: session.id,
 * })
 * ```
 */
export const useStripe = () => useNuxtApp().$stripe
