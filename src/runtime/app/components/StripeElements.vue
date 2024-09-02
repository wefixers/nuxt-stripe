<script setup lang="ts">
import { defineExpose, inject, provide, shallowRef, watch } from 'vue'
import type { StripeElements, StripeElementsOptions } from '@stripe/stripe-js'
import type { StripeContext, StripeElementsContext } from '../types'

const props = defineProps<{
  options?: StripeElementsOptions | null | undefined
}>()

const emit = defineEmits<{
  (event: 'elements', elements: StripeElements | null): void
  (event: 'error', error: unknown): void
}>()

const ctx = inject<StripeContext>('nuxt-stripe')

if (!ctx) {
  throw new Error('StripeElement must be used with useStripe')
}

const { stripe } = ctx

const elements = shallowRef<StripeElements | null>(null)

// Provide a context to child components
provide<StripeElementsContext>('nuxt-stripe-elements', {
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
