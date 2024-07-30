<script setup lang="ts">
import type {
  StripeError,
  StripePaymentElement,
  StripePaymentElementChangeEvent,
  StripePaymentElementOptions,
} from '@stripe/stripe-js'

import StripeElement from './StripeElement.vue'

defineProps<{
  options?: StripePaymentElementOptions
}>()

const emit = defineEmits<{
  (event: 'element', element: StripePaymentElement | null): void
  (event: 'change', data: StripePaymentElementChangeEvent): void
  (event: 'ready', data: { elementType: 'payment' }): void
  (event: 'focus', data: { elementType: 'payment' }): void
  (event: 'blur', data: { elementType: 'payment' }): void
  (event: 'escape', data: { elementType: 'payment' }): void
  (event: 'loaderror', data: { elementType: 'payment', error: StripeError }): void
  (event: 'loaderstart', data: { elementType: 'payment' }): void
}>()
</script>

<template>
  <StripeElement
    type="payment"
    :options="options"
    @element="emit('element', $event)"
    @change="emit('change', $event)"
    @ready="emit('ready', $event)"
    @focus="emit('focus', $event)"
    @blur="emit('blur', $event)"
    @escape="emit('escape', $event)"
    @loaderror="emit('loaderror', $event)"
    @loaderstart="emit('loaderstart', $event)"
  />
</template>
