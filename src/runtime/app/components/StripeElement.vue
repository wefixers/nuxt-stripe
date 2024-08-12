<script setup lang="ts" generic="T extends StripeElementType">
import type { Ref } from 'vue'
import { inject, onBeforeUnmount, shallowRef, watch } from 'vue'

import type {
  Stripe,
  StripeAddressElement,
  StripeAddressElementChangeEvent,
  StripeAddressElementOptions,
  StripeAffirmMessageElement,
  StripeAffirmMessageElementOptions,
  StripeAfterpayClearpayMessageElement,
  StripeAfterpayClearpayMessageElementOptions,
  StripeAuBankAccountElement,
  StripeAuBankAccountElementChangeEvent,
  StripeAuBankAccountElementOptions,
  StripeCardCvcElement,
  StripeCardCvcElementChangeEvent,
  StripeCardCvcElementOptions,
  StripeCardElement,
  StripeCardElementChangeEvent,
  StripeCardElementOptions,
  StripeCardExpiryElement,
  StripeCardExpiryElementChangeEvent,
  StripeCardExpiryElementOptions,
  StripeCardNumberElement,
  StripeCardNumberElementChangeEvent,
  StripeCardNumberElementOptions,
  StripeElementBase,
  StripeElementType,
  StripeElements,
  StripeEpsBankElement,
  StripeEpsBankElementChangeEvent,
  StripeEpsBankElementOptions,
  StripeError,
  StripeExpressCheckoutElement,
  StripeExpressCheckoutElementOptions,
  StripeFpxBankElement,
  StripeFpxBankElementChangeEvent,
  StripeFpxBankElementOptions,
  StripeIbanElement,
  StripeIbanElementChangeEvent,
  StripeIbanElementOptions,
  StripeIdealBankElement,
  StripeIdealBankElementChangeEvent,
  StripeIdealBankElementOptions,
  StripeIssuingCardCopyButtonElement,
  StripeIssuingCardCopyButtonElementOptions,
  StripeIssuingCardCvcDisplayElement,
  StripeIssuingCardCvcDisplayElementOptions,
  StripeIssuingCardExpiryDisplayElement,
  StripeIssuingCardExpiryDisplayElementOptions,
  StripeIssuingCardNumberDisplayElement,
  StripeIssuingCardNumberDisplayElementOptions,
  StripeIssuingCardPinDisplayElement,
  StripeIssuingCardPinDisplayElementOptions,
  StripeLinkAuthenticationElement,
  StripeLinkAuthenticationElementChangeEvent,
  StripeLinkAuthenticationElementOptions,
  StripeP24BankElement,
  StripeP24BankElementChangeEvent,
  StripeP24BankElementOptions,
  StripePaymentElement,
  StripePaymentElementChangeEvent,
  StripePaymentElementOptions,
  StripePaymentMethodMessagingElement,
  StripePaymentMethodMessagingElementOptions,
  StripePaymentRequestButtonElement,
  StripePaymentRequestButtonElementOptions,
  StripeShippingAddressElement,
  StripeShippingAddressElementChangeEvent,
  StripeShippingAddressElementOptions,
} from '@stripe/stripe-js'

// This type map is very useful, we should export it
interface StripeTypeMap {
  address: {
    element: StripeAddressElement
    options: StripeAddressElementOptions
    change: StripeAddressElementChangeEvent
  }
  affirmMessage: {
    element: StripeAffirmMessageElement
    options: StripeAffirmMessageElementOptions
    change: never
  }
  afterpayClearpayMessage: {
    element: StripeAfterpayClearpayMessageElement
    options: StripeAfterpayClearpayMessageElementOptions
    change: never
  }
  auBankAccount: {
    element: StripeAuBankAccountElement
    options: StripeAuBankAccountElementOptions
    change: StripeAuBankAccountElementChangeEvent
  }
  card: {
    element: StripeCardElement
    options: StripeCardElementOptions
    change: StripeCardElementChangeEvent
  }
  cardNumber: {
    element: StripeCardNumberElement
    options: StripeCardNumberElementOptions
    change: StripeCardNumberElementChangeEvent
  }
  cardExpiry: {
    element: StripeCardExpiryElement
    options: StripeCardExpiryElementOptions
    change: StripeCardExpiryElementChangeEvent
  }
  cardCvc: {
    element: StripeCardCvcElement
    options: StripeCardCvcElementOptions
    change: StripeCardCvcElementChangeEvent
  }
  epsBank: {
    element: StripeEpsBankElement
    options: StripeEpsBankElementOptions
    change: StripeEpsBankElementChangeEvent
  }
  expressCheckout: {
    element: StripeExpressCheckoutElement
    options: StripeExpressCheckoutElementOptions
    change: never
  }
  fpxBank: {
    element: StripeFpxBankElement
    options: StripeFpxBankElementOptions
    change: StripeFpxBankElementChangeEvent
  }
  iban: {
    element: StripeIbanElement
    options: StripeIbanElementOptions
    change: StripeIbanElementChangeEvent
  }
  idealBank: {
    element: StripeIdealBankElement
    options: StripeIdealBankElementOptions
    change: StripeIdealBankElementChangeEvent
  }
  p24Bank: {
    element: StripeP24BankElement
    options: StripeP24BankElementOptions
    change: StripeP24BankElementChangeEvent
  }
  payment: {
    element: StripePaymentElement
    options: StripePaymentElementOptions
    change: StripePaymentElementChangeEvent
  }
  paymentMethodMessaging: {
    element: StripePaymentMethodMessagingElement
    options: StripePaymentMethodMessagingElementOptions
    change: never
  }
  paymentRequestButton: {
    element: StripePaymentRequestButtonElement
    options: StripePaymentRequestButtonElementOptions
    change: never
  }
  linkAuthentication: {
    element: StripeLinkAuthenticationElement
    options: StripeLinkAuthenticationElementOptions
    change: StripeLinkAuthenticationElementChangeEvent
  }
  shippingAddress: {
    element: StripeShippingAddressElement
    options: StripeShippingAddressElementOptions
    change: StripeShippingAddressElementChangeEvent
  }
  issuingCardNumberDisplay: {
    element: StripeIssuingCardNumberDisplayElement
    options: StripeIssuingCardNumberDisplayElementOptions
    change: never
  }
  issuingCardCvcDisplay: {
    element: StripeIssuingCardCvcDisplayElement
    options: StripeIssuingCardCvcDisplayElementOptions
    change: never
  }
  issuingCardExpiryDisplay: {
    element: StripeIssuingCardExpiryDisplayElement
    options: StripeIssuingCardExpiryDisplayElementOptions
    change: never
  }
  issuingCardPinDisplay: {
    element: StripeIssuingCardPinDisplayElement
    options: StripeIssuingCardPinDisplayElementOptions
    change: never
  }
  issuingCardCopyButton: {
    element: StripeIssuingCardCopyButtonElement
    options: StripeIssuingCardCopyButtonElementOptions
    change: never
  }
}

type inferElement<T> = T extends keyof StripeTypeMap ? StripeTypeMap[T]['element'] : StripeElementBase
type inferElementOptions<T> = T extends keyof StripeTypeMap ? StripeTypeMap[T]['options'] : object
type inferChangeEvent<T> = T extends keyof StripeTypeMap ? StripeTypeMap[T]['change'] : never

const props = defineProps<{
  type: T
  options?: inferElementOptions<T>
}>()

const emit = defineEmits<{
  (event: 'element', element: inferElement<T> | null): void
  (event: 'change', data: inferChangeEvent<T>): void
  (event: 'ready', data: { elementType: T }): void
  (event: 'focus', data: { elementType: T }): void
  (event: 'blur', data: { elementType: T }): void
  (event: 'escape', data: { elementType: T }): void
  (event: 'loaderror', data: { elementType: T, error: StripeError }): void
  (event: 'loaderstart', data: { elementType: T }): void
  (event: 'error', error: unknown): void
}>()

interface Ctx {
  stripe: Ref<Stripe | null | undefined>
  elements: Ref<StripeElements | null>
}

const ctx = inject<Ctx>('nuxt-stripe-elements')!

if (!ctx) {
  throw new Error('StripeElement must be used within StripeElements')
}

const elements = ctx.elements
const element = shallowRef<inferElement<T>>()
const elementRef = shallowRef<HTMLElement>()

function destroyElement() {
  try {
    element.value?.destroy()
  }
  catch (e) {
    emit('error', e)
  }

  element.value = undefined

  try {
    elements.value?.getElement(props.type as any)?.destroy()
  }
  catch (e) {
    emit('error', e)
  }
}

function createElement() {
  if (!elements.value) {
    return
  }

  element.value = elements.value.create(props.type as any, props.options as any) as unknown as inferElement<T>

  for (const event of [
    'change',
    'ready',
    'focus',
    'blur',
    'escape',
    'loaderror',
    'loaderstart',
  ]) {
    ;(element.value as any).on(event, (data: any) => emit(event as any, data))
  }

  // Mount the element if elementRef is available
  if (elementRef.value) {
    element.value.unmount()
    element.value.mount(elementRef.value)
  }
}

watch(elements, (elements) => {
  // Once the elements are undefined, destroy this element
  if (!elements) {
    destroyElement()
    return
  }

  destroyElement()
  createElement()
}, {
  immediate: true,
})

watch(element, (instance) => {
  emit('element', instance || null)

  if (!instance) {
    return
  }

  // Unmount if elementRef is not available
  if (!elementRef.value) {
    instance.unmount()
    return
  }

  instance.unmount()
  instance.mount(elementRef.value)
}, {
  immediate: true,
})

watch(elementRef, (el) => {
  // Do nothing if the element is not available
  if (!element.value) {
    return
  }

  if (el) {
    element.value.unmount()
    element.value.mount(el)
  }
  else {
    element.value.unmount()
  }
}, {
  immediate: true,
})

watch(() => props.type, () => {
  destroyElement()
  createElement()
}, {
  immediate: true,
})

watch(() => props.options, (options) => {
  if (element.value) {
    // Not all elements have the update method
    ;(element.value as any).update?.(options)
  }
}, {
  immediate: true,
  deep: true,
})

onBeforeUnmount(() => {
  destroyElement()
})

defineExpose({
  blur(): void {
    ;(element.value as StripeElementBase)?.blur?.()
  },
  clear(): void {
    ;(element.value as StripeElementBase)?.clear?.()
  },
  focus(): void {
    ;(element.value as StripeElementBase)?.focus?.()
  },
})
</script>

<template>
  <div ref="elementRef" />
</template>
