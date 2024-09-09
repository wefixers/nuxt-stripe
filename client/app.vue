<script setup lang="ts">
import { watchImmediate } from '@vueuse/core'
import type { BirpcReturn } from 'birpc'
import type { Stripe } from 'stripe'
import { onDevtoolsClientConnected } from '@nuxt/devtools-kit/iframe-client'
import type { ClientFunctions, ServerFunctions } from '../src/rpc-types'

const events = ref<Stripe.Event[]>([])

const selectedEventId = ref<string | null>(null)
const selectedEvent = computed<Stripe.Event | undefined>(() =>
  events.value.find(event => event.id === selectedEventId.value),
)

watchImmediate(events, (events) => {
  if (events.length === 0) {
    selectedEventId.value = null
    return
  }

  if (events.find(event => event.id === selectedEventId.value)) {
    return
  }

  const mostRecentEvent = events.reduce((mostRecent, current) =>
    current.created > mostRecent.created ? current : mostRecent,
  )

  selectedEventId.value = mostRecentEvent?.id ?? null
})

const sortedEvents = computed(() =>
  events.value.toSorted((a, b) => b.created - a.created),
)

const latestEventDate = computed(() => {
  const ts = sortedEvents.value.reduce((acc, event) => Math.max(acc, event.created), 0)

  if (!ts) {
    return ''
  }

  return new Date(ts * 1000).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })
})

const filter = ref('')
const filteredEvents = computed(() => {
  const query = filter.value.trim().toLowerCase()

  if (!query) {
    return sortedEvents.value
  }

  return sortedEvents.value.filter(event =>
    event.id.toLowerCase().includes(query),
  )
})

let rpc: BirpcReturn<ServerFunctions, ClientFunctions> | undefined

onDevtoolsClientConnected(async (client) => {
  rpc = client.devtools.extendClientRpc<ServerFunctions, ClientFunctions>('nuxt-stripe-rpc', {
    stripeEvent(event) {
      // Add new event to the beginning of the list
      // Do not care too much about unshift performance here
      // Events are also sorted by created date
      // That does not matter, put the newest event at the top
      events.value.unshift(event)
    },
  })

  events.value = await rpc.getStripeEvents()
})

async function refresh() {
  if (rpc) {
    events.value = await rpc.getStripeEvents()
  }
}

function formatLocalTime(created: number) {
  const date = new Date(created * 1000)
  const formatter = new Intl.DateTimeFormat(undefined, {
    hour: 'numeric',
    minute: '2-digit',
    second: '2-digit',
  })

  return formatter.format(date)
}

const tabs = [
  { name: 'Webhooks', href: '#', current: true },
]
</script>

<template>
  <div class="flex flex-col h-full">
    <div>
      <nav class="flex border-b border-black/10 dark:border-white/10">
        <ul role="list" class="flex flex-none min-w-full px-2 text-sm font-bold leading-6 text-gray-400 gap-x-6">
          <li v-for="tab in tabs" :key="tab.name">
            <a :href="tab.href" class="relative block py-3" :class="tab.current ? 'text-indigo-400' : ''">
              <span>{{ tab.name }}</span>
              <span aria-hidden="true" class="absolute inset-x-0 h-px -bottom-px" :class="[tab.current ? 'bg-indigo-500' : 'bg-transparent']" />
            </a>
          </li>
        </ul>
      </nav>
    </div>

    <div class="p-2 border-b border-black/10 dark:border-white/10">
      <div class="relative rounded-md shadow-sm">
        <div class="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="text-gray-400 size-5" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
          </svg>
        </div>
        <input v-model="filter" type="text" class="bg-transparent block w-full rounded-md border-0 py-1.5 pl-10 ring-1 ring-inset ring-gray-300 dark:ring-neutral-700 placeholder:text-gray-400 focus:ring-1 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6" placeholder="Find Event by ID...">
      </div>
    </div>

    <div class="flex-1 flex-shrink-0 h-full">
      <div class="grid h-full grid-cols-2 divide-x divide-neutral-100 dark:divide-white/10">
        <div class="size-full">
          <div class="p-2">
            <div class="flex items-center justify-between">
              <span class="text-sm font-semibold">
                {{ latestEventDate }}
              </span>
              <div>
                <button class="text-sm text-indigo-500" @click="refresh">
                  Refresh
                </button>
              </div>
            </div>

            <div class="mt-2 space-y-px">
              <div
                v-for="event in filteredEvents" :key="event.id"
                class="flex p-2 border rounded-lg"
                :class="selectedEventId === event.id ? 'border-indigo-500 cursor-default' : 'border-transparent cursor-pointer hover:bg-gray-400/10 dark:hover:bg-gray-300/10'"
                @click="selectedEventId = event.id"
              >
                <div class="flex-1">
                  <span class="text-sm font-semibold text-indigo-400">
                    {{ event.type }}
                  </span>
                </div>
                <div class="flex-shrink-0">
                  {{ formatLocalTime(event.created) }}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="relative">
          <div class="absolute inset-0 overflow-x-hidden overflow-y-auto">
            <div v-if="selectedEvent" class="flex flex-col p-2 size-full">
              <div>
                <div>
                  <span>Event details</span>
                </div>

                <EventDetails :event="selectedEvent" />
              </div>

              <div class="py-6">
                <div class="mb-2">
                  <span class="font-semibold">Event Data</span>
                </div>

                <EventData :event="selectedEvent" />

                <div class="h-[40px]" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
