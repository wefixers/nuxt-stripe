import type { StripeConstructorOptions } from '@stripe/stripe-js'
import type { Stripe } from 'stripe'
import type { Nuxt } from '@nuxt/schema'
import { addComponentsDir, addImportsDir, addServerImportsDir, createResolver, defineNuxtModule, useLogger } from '@nuxt/kit'
import { startSubprocess } from '@nuxt/devtools-kit'
import { joinURL } from 'ufo'
import defu from 'defu'

import { name, version } from '../package.json'

declare module '@nuxt/schema' {
  interface RuntimeConfig {
    /**
     * The Stripe server runtime options.
     */
    stripe: StripeModuleServerOptions
  }

  interface PublicRuntimeConfig {
    /**
     * The Stripe client runtime options.
     */
    stripe: StripeModuleClientOptions
  }
}

export interface StripeModuleClientOptions {
  /**
   * The Stripe publishable key, it is intended to be exposed to the users.
   * Use `NUXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` in the `.env` to set this key automatically.
   *
   * Check the official doc: {@link https://stripe.com/docs/keys#obtain-api-keys}
   */
  publishableKey: string

  /**
   * The Stripe client options.
   */
  options: StripeConstructorOptions
}

export interface StripeModuleServerOptions {
  /**
   * The Stripe secret key, it is intended to be kept secret.
   * Use `NUXT_STRIPE_SECRET` in the `.env` to set this key automatically.
   *
   * Check the official doc: {@link https://stripe.com/docs/keys#obtain-api-keys}
   */
  secret: string

  /**
   * The Stripe server options.
   */
  options: Stripe.StripeConfig

  /**
   * The Stripe webhook options.
   */
  webhook: {
    /**
     * The Stripe webhook secret, it is intended to be kept secret.
     * Use `NUXT_STRIP_WEBHOOK_SECRET` in the `.env` to set this key automatically.
     */
    secret: string
  }
}

export interface ModuleOptions {
  /**
   * The Stripe publishable key, it is intended to be exposed to the users.
   * Use `NUXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` in the `.env` to set this key automatically.
   *
   * Check the official doc: {@link https://stripe.com/docs/keys#obtain-api-keys}
   */
  publishableKey: string

  /**
   * The Stripe secret key, it is intended to be kept secret.
   * Use `NUXT_STRIPE_SECRET` in the `.env` to set this key automatically.
   *
   * Check the official doc: {@link https://stripe.com/docs/keys#obtain-api-keys}
   */
  secret: string

  /**
   * The Stripe webhook options.
   */
  webhook: Partial<{
    /**
     * The Stripe webhook secret, it is intended to be kept secret.
     * Use `NUXT_STRIP_WEBHOOK_SECRET` in the `.env` to set this key automatically.
     */
    secret: string

    /**
     * The Stripe CLI webhook listener path.
     * Set to `false` to disable this behavior.
     *
     * @default "/api/stripe/webhook"
     */
    listener: string | false
  }>

  /**
   * The Stripe client options.
   *
   * ### Note:
   * This object is available on the client-side, do not accidentally expose sensitive information.
   */
  client: Partial<{
    /**
     * The Stripe client options.
     */
    options: StripeConstructorOptions
  }>

  /**
   * The Stripe server options.
   */
  server: Partial<{
    /**
     * The Stripe server options.
     */
    options: Stripe.StripeConfig
  }>
}

export default defineNuxtModule<ModuleOptions>({
  meta: {
    name,
    version,
    configKey: 'stripe',
    compatibility: {
      nuxt: '>=3.0.0',
    },
  },
  defaults: {
    publishableKey: '',
    secret: '',
    webhook: {
      secret: '',
      listener: '/api/stripe/webhook',
    },
    client: {
      options: {},
    },
    server: {
      options: {},
    },
  },
  async setup(options, nuxt) {
    const logger = useLogger(name)

    logger.info(`\`${name}\` setup...`)

    // Runtime Public Config
    nuxt.options.runtimeConfig.public.stripe = defu(
      nuxt.options.runtimeConfig.public.stripe,
      {
        publishableKey: options.publishableKey,
        options: options.client.options,
      },
    )

    // Runtime Config
    nuxt.options.runtimeConfig.stripe = defu(
      nuxt.options.runtimeConfig.stripe,
      {
        secret: options.secret,
        options: options.server.options,
        webhook: {
          secret: options.webhook.secret,
        },
      },
    )

    const resolver = createResolver(import.meta.url)

    addComponentsDir({
      path: resolver.resolve('./runtime/app/components'),
      pathPrefix: false,
      prefix: '',
      global: true,
    })

    addImportsDir(
      resolver.resolve('./runtime/app/composables'),
    )

    addServerImportsDir(
      resolver.resolve('./runtime/server/utils'),
    )

    // run the stripe CLI only in development
    if (nuxt.options.dev && options.webhook.listener !== false) {
      startStripeWebhookListener(nuxt, options, (event) => {
        // Just print the test webhook secret
        // This info is printed in .dev only
        if (event.startsWith('Your webhook signing secret')) {
          logger.info.raw(event)
        }
      })
    }

    logger.success(`\`${name}\` setup done`)
  },
})

interface StripeWebhookEventHandler {
  (data: string): void
}

function startStripeWebhookListener(nuxt: Nuxt, options: ModuleOptions, handler?: StripeWebhookEventHandler) {
  // Stripe CLI want a full URL to the webhook listener
  const origin = `http://localhost:${nuxt.options.devServer.port}`

  const webhookPath = joinURL(origin, options.webhook.listener || '/api/stripe/webhook')

  // The secret is either provided in the module options or resolved by Nuxt in the runtime config
  const stripeSecret = options.secret || nuxt.options.runtimeConfig.stripe.secret

  // see: https://docs.stripe.com/cli/listen
  const { getProcess } = startSubprocess(
    {
      command: 'stripe',
      args: [
        'listen',
        '--api-key',
        stripeSecret,
        '--forward-to',
        webhookPath,
        '--format',
        'JSON',
      ],
    },
    {
      id: 'nuxt-stripe-cli',
      name: 'Stripe CLI',
      icon: 'simple-icons:stripe',
    },
    nuxt,
  )

  const process = getProcess()

  process.stdout!.on('data', (data) => {
    // The data might be a buffer, convert it to string
    data = data.toString()

    // Depending on the buffer size and the platform (Windows \r madness),
    // we might get multiple lines in a single output
    const parts: string[] = data
      .split('\n')
      .map((part: string) => part.trim())
      .filter(Boolean)

    for (const data of parts) {
      if (data.startsWith('{')) {
        let payload = data
        try {
          payload = JSON.parse(data)
        }
        catch {
          //
        }

        handler?.(payload)
      }
    }
  })

  process.stderr!.on('data', (data) => {
    // Clean up the webhook signing secret from the logs
    const ws = data.toString().match(/Your webhook signing secret is (\S+)/)?.[1]

    if (ws) {
      handler?.(`Your webhook signing secret is \`${ws}\``)
    }
  })
}
