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

  if (!props.options) {
    return
  }

  try {
    if (props.options.clientSecret) {
      elements.value = stripe.elements(props.options)
    }
    else if (props.options.mode) {
      elements.value = stripe.elements(props.options)
    }
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

  if (!options) {
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
