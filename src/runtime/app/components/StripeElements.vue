<script setup lang="ts">
import type { Stripe, StripeElements, StripeElementsOptions } from '@stripe/stripe-js'
import { computed, provide, shallowRef, watch } from 'vue'

const props = defineProps<{
  stripe: Stripe | null | undefined
  options?: StripeElementsOptions
}>()

const emit = defineEmits<{
  (event: 'elements', elements: StripeElements | null): void
}>()

const stripe = computed(() => props.stripe || null)
const elements = shallowRef<StripeElements | null>(null)

watch(stripe, (stripe) => {
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
  catch {
    // TODO: Emit the error
  }
}, {
  immediate: true,
})

watch(elements, (elements) => {
  emit('elements', elements)
}, {
  immediate: true,
})

provide('nuxt-stripe-elements', {
  stripe,
  elements,
})
</script>

<template>
  <slot />
</template>
