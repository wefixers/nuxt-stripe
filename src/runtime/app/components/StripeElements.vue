<script setup lang="ts">
import type { Stripe, StripeElements, StripeElementsOptions } from '@stripe/stripe-js'
import { provide, shallowRef, watch } from 'vue'

const props = defineProps<{
  stripe: Stripe | null | undefined
  options?: StripeElementsOptions | null | undefined
}>()

const emit = defineEmits<{
  (event: 'elements', elements: StripeElements | null): void
  (event: 'error', error: unknown): void
}>()

const elements = shallowRef<StripeElements | null>(null)

// Provide a context to child components
provide('nuxt-stripe-elements', {
  stripe: props.stripe,
  elements,
})

watch(elements, (elements) => {
  emit('elements', elements)
}, {
  immediate: true,
})

watch(() => props.stripe, (stripe) => {
  if (!stripe) {
    return
  }

  // Either `clientSecret` or `mode` are required to create the Stripe Elements instance
  if (!props.options || (!props.options.clientSecret && !props.options.mode)) {
    return
  }

  try {
    elements.value = stripe.elements(props.options as any)
  }
  catch (e) {
    emit('error', e)
  }
}, {
  immediate: true,
})

watch(() => props.options, (options) => {
  if (!elements.value) {
    return
  }

  // Either `clientSecret` or `mode` are required to create the Stripe Elements instance
  if (!options || (!options.clientSecret && !options.mode)) {
    return
  }

  try {
    elements.value.update(options)
  }
  catch (e) {
    emit('error', e)
  }
}, {
  immediate: true,
  deep: true,
})
</script>

<template>
  <slot />
</template>
