<script setup lang="ts">
import type { StripeElementsOptions, StripePaymentElementOptions } from '@stripe/stripe-js'
import { useStripe } from '#imports'

const { stripe } = useStripe()

const elementsOptions = ref<StripeElementsOptions>({
  currency: 'usd',
  amount: 1000,
  mode: 'subscription',
})

const paymentOptions = ref<StripePaymentElementOptions>({
  layout: 'accordion',
})

const redirecting = ref(false)

async function checkout() {
  if (redirecting.value) {
    return
  }

  redirecting.value = true

  try {
    const session = await $fetch('/api/createStripeSession', {
      method: 'POST',
    })

    await stripe.value?.redirectToCheckout({
      sessionId: session.id,
    })
  }
  finally {
    redirecting.value = false
  }
}
</script>

<template>
  <div class="p-6">
    <div class="mx-auto max-w-screen-md">
      <button
        :disabled="redirecting"
        class="rounded-md bg-indigo-600 px-2.5 py-1.5 text-sm font-semibold text-white disabled:opacity-50"
        @click="checkout"
      >
        External to Checkout
      </button>

      <div class="py-4">
        <StripeElements :options="elementsOptions">
          <StripePaymentElement :options="paymentOptions" />
        </StripeElements>
      </div>
    </div>
  </div>
</template>
