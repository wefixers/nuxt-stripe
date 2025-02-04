import type { Stripe, StripeConstructorOptions } from '@stripe/stripe-js'
import type { Ref } from 'vue'
import type { StripeContext } from '../types'
import { useRuntimeConfig } from '#imports'
import { loadStripe } from '@stripe/stripe-js/pure'
import { computed, provide, shallowRef, toRaw, unref, watch } from 'vue'

// import { name, version } from '../../../../package.json' assert { type: 'json' }
const name = '@fixers/nuxt-stripe'
const version = '4.0.0'

type MaybeRef<T> = T | Ref<T>
type Optional<T> = MaybeRef<T | null | undefined>

export interface UseStripeOptions extends StripeConstructorOptions {
  /**
   * Override the runtime configured publishable key.
   */
  publishableKey?: string
}

/**
 * Use Stripe.
 */
export function useStripe(options?: Optional<UseStripeOptions>): Ref<Stripe | null> {
  const stripeConfig = useRuntimeConfig().public.stripe

  /**
   * The actual Stripe instance.
   */
  const stripe = shallowRef<Stripe | null>(null)

  /**
   * The options to initialize the Stripe instance with.
   */
  const stripeOptions = computed<UseStripeOptions>(() => {
    const rawOptions = {
      // Merge runtime config options with the provided options
      ...stripeConfig?.options,
      ...toRaw(unref(options)),
    }

    rawOptions.publishableKey ||= stripeConfig?.publishableKey

    return rawOptions
  })

  /**
   * An hash key to determine if the Stripe instance should be reloaded.
   *
   * This hash is necessary, otherwise we run the risk of invalidating the Stripe instance,
   * even when the options haven't changed.
   *
   * We need to avoid triggering a ref update since components will re-render flashing the UI.
   */
  const hashKey = computed(() => {
    return `${
      stripeOptions.value.publishableKey || ''
    }-${
      stripeOptions.value.apiVersion || ''
    }-${
      stripeOptions.value.apiVersion || ''
    }-${
      stripeOptions.value.locale || ''
    }-${
      // Sort any string array to ensure the hash is consistent
      // Copy the array to avoid mutating the original
      stripeOptions.value.betas?.filter(Boolean).map(x => String(x)).sort().join(',') || ''
    }`
  })

  watch(hashKey, async () => {
    const { publishableKey, ...options } = stripeOptions.value

    // No publishable key
    if (!publishableKey) {
      return
    }

    try {
      const stripeInstance = await loadStripe(
        publishableKey,
        options,
      )

      // null is returned on server-side only
      if (!stripeInstance) {
        return
      }

      // Register the app info
      // This helps Stripe improve their services and debugging
      stripeInstance.registerAppInfo({
        name,
        version,
        url: 'https://nuxt-stripe.fixers.dev',
      })

      stripe.value = stripeInstance
    }
    catch {
      // TODO: we might want to either log or dont even catch the error
    }
  }, {
    immediate: true,
  })

  // Provide the Stripe instance to children components and composables
  provide<StripeContext>('nuxt-stripe', {
    stripe,
  })

  return stripe
}
