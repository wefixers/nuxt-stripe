<script setup lang="ts">
import { useNuxtApp } from '#app'
import { useStripe } from '#imports'

const { createClient: createStripeClient } = useStripe()
const { $stripe } = useNuxtApp()

async function checkout() {
  const session = await $fetch('/api/createStripeSession', {
    method: 'POST',
  })

  const stripe = await $stripe.createClient()
  await stripe.redirectToCheckout({
    sessionId: session.id,
  })
}

async function checkoutWithComposables() {
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
