<script setup lang="ts">
import type * as Stripe from '@stripe/stripe-js'
import { StripeElements, StripePaymentElement } from '#components'
import { useStripe } from '#imports'

const stripe = useStripe()
const elements = useStripeElements()

const elementsOptions = ref<Stripe.StripeElementsOptions>({
  mode: 'payment',
  amount: 1000,
  currency: 'usd',
})

const paymentOptions = ref<Stripe.StripePaymentElementOptions>({
  layout: 'accordion',
})

const redirecting = ref(false)

async function checkout() {
  if (!stripe.value) {
    throw new Error('Stripe is not ready')
  }

  if (redirecting.value) {
    return
  }

  redirecting.value = true

  try {
    const session = await $fetch('/api/createStripeSession', {
      method: 'POST',
    })

    await stripe.value.redirectToCheckout({
      sessionId: session.id,
    })
  }
  finally {
    redirecting.value = false
  }
}

async function handleSubmit() {
  if (!stripe.value || !elements.value) {
    return
  }

  const elementsSubmitResult = await elements.value.submit()

  if (elementsSubmitResult.error) {
    console.error(elementsSubmitResult.error)
    return
  }

  const { clientSecret, returnUrl } = await $fetch('/api/payment/confirm', {
    method: 'post',
  })

  const paymentIntentResult = await stripe.value.confirmPayment({
    elements: elements.value,
    clientSecret,
    redirect: 'if_required',
    confirmParams: {
      return_url: returnUrl,
    },
  })

  if (paymentIntentResult.error) {
    console.error(paymentIntentResult.error)
    return
  }

  // eslint-disable-next-line no-alert
  alert('Payment successful 🎉🎉🎉')
}
</script>

<template>
  <div class="p-6">
    <div class="mx-auto max-w-screen-md">
      <button
        :disabled="redirecting"
        type="button"
        class="rounded-md bg-indigo-600 px-2.5 py-1.5 text-sm font-semibold text-white disabled:opacity-50"
        @click="checkout"
      >
        External to Checkout
      </button>

      <div class="py-4">
        <form @submit.prevent="handleSubmit">
          <StripeElements :options="elementsOptions">
            <StripePaymentElement :options="paymentOptions" />
          </StripeElements>

          <button
            type="submit"
            class="rounded-md bg-indigo-600 px-2.5 py-1.5 text-sm font-semibold text-white disabled:opacity-50"
          >
            Pay
          </button>
        </form>
      </div>
    </div>
  </div>
</template>
