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
  <div class="container">
    <button @click="checkout">
      Checkout useNuxtApp()
    </button>

    <button @click="checkoutWithComposables">
      Checkout useNuxtApp()
    </button>
  </div>
</template>

<style scoped>
.container {
  display: flex;
  gap: 16px;
}
</style>
