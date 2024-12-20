import type { IStripeConnectInitParams, IStripeConnectUpdateParams, StripeConnectInstance } from '@stripe/connect-js'
import type { Ref } from 'vue'
import type { StripeConnectContext } from '../types'
import { useRuntimeConfig } from '#imports'
import { loadConnectAndInitialize } from '@stripe/connect-js/pure'
import { computed, provide, shallowRef, toRaw, unref, watch } from 'vue'

type MaybeRef<T> = T | Ref<T>

export interface UseStripeConnectOptions extends Partial<IStripeConnectInitParams> {
  fetchClientSecret: () => Promise<string>
}

/**
 * Use Stripe Connect.
 */
export function useStripeConnect(options: MaybeRef<UseStripeConnectOptions>): Ref<StripeConnectInstance | null> {
  const stripeConfig = useRuntimeConfig().public.stripe

  /**
   * The actual Stripe Connect instance.
   */
  const stripeConnect = shallowRef<StripeConnectInstance | null>(null)

  const stripeConnectOptions = computed<IStripeConnectInitParams>(() => {
    return {
      publishableKey: stripeConfig.publishableKey,
      ...toRaw(unref(options)),
    }
  })

  watch(stripeConnectOptions, (options) => {
    if (stripeConnect.value) {
      stripeConnect.value.update(<IStripeConnectUpdateParams>{
        locale: options.locale,
        appearance: options.appearance,
      })

      return
    }

    // Check for SSR, we need this check as /pure do not support SSR...
    if (typeof window !== 'undefined' && window.document) {
      stripeConnect.value = loadConnectAndInitialize({
        ...options,
      })
    }
  }, {
    immediate: true,
    deep: true,
  })

  provide<StripeConnectContext>('nuxt-stripe-connect', {
    stripeConnect,
  })

  return stripeConnect
}
