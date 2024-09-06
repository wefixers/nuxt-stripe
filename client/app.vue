<script setup lang="ts">
import type { Stripe } from 'stripe'
import { onDevtoolsClientConnected } from '@nuxt/devtools-kit/iframe-client'
import type { ClientFunctions, ServerFunctions } from '../src/rpc-types'

const events = ref<Stripe.Event[]>([])
const sortedEvents = computed(() => events.value.toSorted((a, b) => b.created - a.created))

onDevtoolsClientConnected(async (client) => {
  const rpc = client.devtools.extendClientRpc<ServerFunctions, ClientFunctions>('nuxt-stripe-rpc', {
    stripeEvent(event) {
      events.value.push(event)
    },
  })

  events.value = await rpc.getStripeEvents()
})

function formatCreated(created: number) {
  const d = new Date(created * 1000)

  const date = d.toISOString().split('T')[0]
  const time = d.toTimeString().split(' ')[0]

  // 2024-09-02 09:43:53
  return `${date} ${time}`
}
</script>

<template>
  <div class="relative p-10 n-bg-base">
    <div class="space-y-sm">
      <NCard v-for="event in sortedEvents" :key="event.id" open>
        <details>
          <summary class="p2">
            <div class="text-sm mb-2 leading-1.2em tracking-wide inline">
              Event:
              {{ ' ' }}
              <span class="text-yellow6 dark:yellow5 solid">{{ event.type }}</span>
              {{ ' ' }}
              <span>({{ formatCreated(event.created) }})</span>
            </div>
          </summary>
          <div class="mt4 flex overflow-scroll">
            <Shiki
              as="div"
              lang="json"
              :code="JSON.stringify(event, null, 2)"
            />
          </div>
        </details>
      </NCard>
    </div>
  </div>
</template>

<style>
html.dark .shiki,
html.dark .shiki span {
  color: var(--shiki-dark) !important;
  background-color: var(--shiki-dark-bg) !important;
  /* Optional, if you also want font styles */
  font-style: var(--shiki-dark-font-style) !important;
  font-weight: var(--shiki-dark-font-weight) !important;
  text-decoration: var(--shiki-dark-text-decoration) !important;
}
</style>
