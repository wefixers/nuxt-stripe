<script setup lang="ts">
import type { Ref } from 'vue'
import { defineExpose, inject, provide, shallowRef, watch } from 'vue'
import type { Stripe, StripeElements, StripeElementsOptions } from '@stripe/stripe-js'

const props = defineProps<{
  options?: StripeElementsOptions | null | undefined
}>()

const emit = defineEmits<{
  (event: 'elements', elements: StripeElements | null): void
  (event: 'error', error: unknown): void
}>()

const stripe = inject<Ref<Stripe | null>>('nuxt-stripe')

if (!stripe) {
  throw new Error('StripeElement must be used with useStripe')
}

const elements = shallowRef<StripeElements | null>(null)

// Provide a context to child components
provide('nuxt-stripe-elements', {
  stripe,
  elements,
})

watch(elements, (elements) => {
  emit('elements', elements)
}, {
  immediate: true,
})

watch(stripe, (stripe) => {
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

defineExpose({
  fetchUpdates(): Promise<{ error?: { message: string, status?: string } }> {
    if (!elements.value) {
      return Promise.resolve({ error: { message: 'Elements not initialized' } })
    }

    return elements.value.fetchUpdates()
  },
})
</script>

<template>
  <slot />
</template>
