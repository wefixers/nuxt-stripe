<script setup lang="ts">
import type { StripeElements, StripeElementsOptions } from '@stripe/stripe-js'
import { inject, provide, watch } from 'vue'

import type { StripeContext } from '../../types'

const props = defineProps<{
  options?: StripeElementsOptions
}>()

const emit = defineEmits<{
  (event: 'elements', elements: StripeElements | null): void
}>()

const context = inject<StripeContext>('nuxt-stripe-context')

if (!context) {
  throw new Error('StripeElements must be used with useStripe() context')
}

const { stripe, elements } = context

provide('nuxt-stripe-elements', elements)

// This watch() emit back the StripeElements
// it's intended to be used as convenience way to retrieve the StripeElements instance
watch(elements, (elements) => {
  emit('elements', elements || null)
}, {
  immediate: true,
})

function createElements() {
  // Stripe is not ready yet
  if (!stripe.value) {
    return
  }

  // Either `clientSecret` or `mode` are required to create the Stripe Elements instance
  if (!props.options || (!props.options.clientSecret && !props.options.mode)) {
    return
  }

  try {
    elements.value = stripe.value.elements(props.options as any)
  }
  catch (e) {
    console.error(e)
  }
}

watch(stripe, () => {
  createElements()
}, {
  immediate: true,
})

watch(() => props.options, (options) => {
  if (elements.value) {
    elements.value.update(options || {})
  }
  else {
    createElements()
  }
}, {
  immediate: true,
  deep: true,
})
</script>

<template>
  <slot />
</template>
