# Nuxt Stripe

[![npm version][npm-version-src]][npm-version-href]
[![npm downloads][npm-downloads-src]][npm-downloads-href]
[![License][license-src]][license-href]
[![Nuxt][nuxt-src]][nuxt-href]

A Nuxt module for Stripe, with local webhook testing support out of the box.

- [✨ &nbsp;Release Notes](/CHANGELOG.md)

## Features

- ⛰ &nbsp;Use Stripe with Nuxt
- ⛰ &nbsp;Support local webhook testing out of the box.

## Quick Setup

1. Add `@fixers/nuxt-stripe` dependency to your project

```bash
# Using pnpm
pnpm add -D @fixers/nuxt-stripe

# Using yarn
yarn add --dev @fixers/nuxt-stripe

# Using npm
npm install --save-dev @fixers/nuxt-stripe
```

2. Add `@fixers/nuxt-stripe` to the `modules` section of `nuxt.config.ts`

```js
export default defineNuxtConfig({
  modules: [
    '@fixers/nuxt-stripe'
  ]
})
```

## Usage

> In SSR `createClient()` will return null, you are not supposed to use the client version of Stripe in a server context.

```ts
const { $stripe } = useNuxtApp()

async function checkout() {
  // create a Stripe client instance
  const stripe = await $stripe.createClient()

  // create a server side session as an example
  const session = await $fetch('/api/createStripeSession', {
    method: 'POST',
  })

  // redirect the user to the checkout
  await stripe.redirectToCheckout({
    sessionId: session.id,
  })
}
```

## Configuration

In your `.env`, add you Stripe Publishable Key (prefixed with `pk_`):

```env
NUXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_<...>"
```

Additionally, the library automatically use environment variable server-side when handling a Webhook.

Stripe API Key Secrets (pick one of the following):

```env
# Highest priority
NUXT_STRIPE_SECRET="sk_"

# or
STRIPE_CLIENT_SECRET="sk_"

# or
STRIPE_SECRET="sk_"
```

Stripe Webhook Secrets (pick one of the following):

```env
# Highest priority
NUXT_STRIPE_WEBHOOK_SECRET="whsec_"

# or
STRIPE_WEBHOOK_SECRET="whsec_"
```

All the module configuration:

```ts
// nuxt.config.ts
export default defineNuxtConfig({
  modules: ['@fixers/nuxt-stripe'],
  stripe: {
    publishableKey: 'pk_<...>',

    // default Stripe Client options
    client: {
      locale: 'en'
    },

    // customize the webhook path, false to disable local webhook testing
    webhookPath: 'api/stripe/webhook'
  }
})
```

> Note: you cannot configure the server side of Stripe through this module, this is to ensure your server side code does not depend on virtual module resolution.

## Webhook

> Do not attempt to manipulate the event, any value you return will be available in the Stripe dashboard in the form `{ ok: true, data: <your returned data> }`, you can always handle the Stripe webhook manually.

Create the file `api/server/webhook.ts`:

```ts
// api/server/webhook.ts

/// <reference types="../../../.nuxt/types/stripe.d.ts" />

import { defineStripeWebhook } from '#stripe'

/**
 * @param event - the H3 event
 * @param stipe - the Stripe instance
 * @param stripeEvent - the Stripe Webhook event
 */
export default defineStripeWebhook(({ event, stripe, stripeEvent }) => {
  switch (stripeEvent.type) {
    case 'payment_intent.succeeded': {
      //
    }
  }
})
```

If you want to manually create the Stripe instance but still want to use the module webhook handler:


```ts
// api/server/webhook.ts

/// <reference types="../../../.nuxt/types/stripe.d.ts" />

import { defineStripeWebhook } from '#stripe'

export default defineStripeWebhook(({ event, stripe, stripeEvent }) => {
  switch (stripeEvent.type) {
    case 'payment_intent.succeeded': {
      //
    }
  }
}, {
  webhookSecret: process.env.SOME_SECRET,
  stripe: new Stripe(process.env.SOME_API_SECRET, {
    apiVersion: '2022-11-15',
  })
})
```

## Stripe CLI

You need to install the Stripe CLI globally:

- [https://stripe.com/docs/stripe-cli](https://stripe.com/docs/stripe-cli#install)

Then login via:

```cmd
stripe login
```

Thats it, when launching `nuxt dev` the module will run the CLI allowing you to do local testing.

More info on the official Stripe doc: [https://stripe.com/docs/webhooks/test](https://stripe.com/docs/webhooks/test)

### Disable local webhook testing

```ts
// nuxt.config.ts
export default defineNuxtConfig({
  modules: ['@fixers/nuxt-stripe'],
  stripe: {
    webhookPath: false
  }
})
```

## Development

```bash
# Install dependencies
npm install

# Generate type stubs
npm run dev:prepare

# Develop with the playground
npm run dev

# Build the playground
npm run dev:build

# Run ESLint
npm run lint

# Run Vitest
npm run test
npm run test:watch

# Release new version
npm run release
```

<!-- Badges -->
[npm-version-src]: https://img.shields.io/npm/v/@fixers/nuxt-stripe/latest.svg?style=flat&colorA=18181B&colorB=28CF8D
[npm-version-href]: https://npmjs.com/package/@fixers/nuxt-stripe

[npm-downloads-src]: https://img.shields.io/npm/dm/@fixers/nuxt-stripe.svg?style=flat&colorA=18181B&colorB=28CF8D
[npm-downloads-href]: https://npmjs.com/package/@fixers/nuxt-stripe

[license-src]: https://img.shields.io/npm/l/@fixers/nuxt-stripe.svg?style=flat&colorA=18181B&colorB=28CF8D
[license-href]: https://npmjs.com/package/@fixers/nuxt-stripe

[nuxt-src]: https://img.shields.io/badge/Nuxt-18181B?logo=nuxt.js
[nuxt-href]: https://nuxt.com
