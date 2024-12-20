<script setup lang="ts" generic="T extends ConnectElementTagName">
import type { ConnectElementTagName, ConnectHTMLElementRecord, StripeConnectInstance } from '@stripe/connect-js'
import type { StripeConnectContext } from '../types'
import { inject, shallowRef, watch } from 'vue'

const { type } = defineProps<{
  type: T
}>()

const ctx = inject<StripeConnectContext>('nuxt-stripe-connect')

if (!ctx) {
  throw new Error('StripeConnectElement must be used with useStripeConnect')
}

const { stripeConnect } = ctx

const element = shallowRef<ConnectHTMLElementRecord[T]>()
const elementRef = shallowRef<HTMLElement>()

function setup() {
  if (!stripeConnect.value) {
    return
  }

  if (!element.value) {
    element.value = stripeConnect.value.create(type)
  }

  if (elementRef.value) {
    while (elementRef.value.firstChild) {
      elementRef.value.removeChild(elementRef.value.firstChild)
    }
    elementRef.value.appendChild(element.value)

    // elementRef.value.replaceChildren(element.value)
  }
}

watch([stripeConnect, element, elementRef], setup, { immediate: true })
</script>

<template>
  <div ref="elementRef" />
</template>
