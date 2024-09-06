<script setup lang="ts">
import type * as Stripe from '@stripe/stripe-js'
import { StripeElements, StripePaymentElement } from '#components'
import { useStripe } from '#imports'

const stripeUse = useStripe()
const stripeElements = shallowRef<Stripe.StripeElements | null>(null)

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
  if (redirecting.value) {
    return
  }

  redirecting.value = true

  try {
    const session = await $fetch('/api/createStripeSession', {
      method: 'POST',
    })

    await stripeUse.value?.redirectToCheckout({
      sessionId: session.id,
    })
  }
  finally {
    redirecting.value = false
  }
}

async function handleSubmit() {
  const stripe = stripeUse.value
  const elements = stripeElements.value

  if (!stripe || !elements) {
    return
  }

  await elements.submit()

  const { clientSecret, returnUrl } = await $fetch('/api/payment/confirm', {
    method: 'post',
  })

  const paymentIntentResult = await stripe.confirmPayment({
    elements,
    clientSecret,
    redirect: 'if_required',
    confirmParams: {
      return_url: returnUrl,
    },
  })

  if (paymentIntentResult.error) {
    console.error(paymentIntentResult.error)
  }
  else {
    console.log(paymentIntentResult.paymentIntent)
  }
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
          <StripeElements :options="elementsOptions" @elements="e => stripeElements = e">
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
