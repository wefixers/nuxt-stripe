<script setup lang="ts">
import { useClipboard } from '@vueuse/core'
import type { Stripe } from 'stripe'

const props = defineProps<{
  event: Stripe.Event
}>()

// May 13, 2024, 12:45:11 PM
const originDate = computed(() => {
  const date = new Date(props.event.created * 1000)
  return date.toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    second: 'numeric',
  })
})

const { copy } = useClipboard()
function copyEventId() {
  copy(props.event.id)
}
</script>

<template>
  <div>
    <span class="text-base font-semibold dark:text-white">
      {{ event.type }}
    </span>

    <div>
      <div class="grid grid-cols-5">
        <div>Event ID</div>
        <div class="col-start-2 col-span-full">
          <button
            type="button"
            class="inline underline cursor-pointer select-text decoration-gray-600 hover:decoration-gray-300"
            @click="copyEventId"
          >
            {{ event.id }}
          </button>
        </div>
      </div>

      <div class="grid grid-cols-5">
        <div>Origin Date</div>
        <div class="col-start-2 col-span-full">
          <button
            type="button"
            class="inline cursor-default select-text"
          >
            {{ originDate }}
          </button>
        </div>
      </div>

      <div class="grid grid-cols-5">
        <div>API version</div>
        <div class="col-start-2 col-span-full">
          <button
            type="button"
            class="inline cursor-default select-text"
          >
            {{ event.api_version }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
