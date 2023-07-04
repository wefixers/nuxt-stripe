<script setup lang="ts">
import { useNuxtApp } from '#app'

const { $stripe } = useNuxtApp()

async function checkout() {
  const stripe = await $stripe.createClient()

  const session = await $fetch('/api/createStripeSession', {
    method: 'POST',
  })

  await stripe.redirectToCheckout({
    sessionId: session.id,
  })
}
</script>

<template>
  <div>
    Nuxt module playground!

    <button @click="checkout">
      Checkout
    </button>
  </div>
</template>
