<script setup lang="ts">
import { useStripe } from '#imports'

const { createClient: createStripeClient } = useStripe()

async function checkout() {
  const session = await $fetch('/api/createStripeSession', {
    method: 'POST',
  })

  const stripe = await createStripeClient()
  await stripe.redirectToCheckout({
    sessionId: session.id,
  })
}
</script>

<template>
  <div>
    <button @click="checkout">
      Checkout
    </button>
  </div>
</template>
