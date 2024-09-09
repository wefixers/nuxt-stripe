import { existsSync } from 'node:fs'

import type { StripeConstructorOptions } from '@stripe/stripe-js'
import type { Stripe } from 'stripe'
import { addComponentsDir, addImportsDir, addServerImportsDir, createResolver, defineNuxtModule, useLogger, useNuxt } from '@nuxt/kit'
import { addCustomTab, extendServerRpc, onDevToolsInitialized, startSubprocess } from '@nuxt/devtools-kit'
import type { BirpcGroup } from 'birpc'
import { joinURL } from 'ufo'
import defu from 'defu'

import { name, version } from '../package.json'
import type { ClientFunctions, ServerFunctions } from './rpc-types'

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
    if (nuxt.options.dev) {
      const DEVTOOLS_UI_ROUTE = '/_stripe'
      const DEVTOOLS_UI_LOCAL_PORT = 3030

      const clientPath = resolver.resolve('./client')

      if (existsSync(clientPath)) {
        nuxt.hook('vite:serverCreated', async (server) => {
          const sirv = await import('sirv').then(r => r.default || r)
          server.middlewares.use(
            DEVTOOLS_UI_ROUTE,
            sirv(clientPath, { dev: true, single: true }),
          )
        })
      }
      else {
        nuxt.hook('vite:extendConfig', (config) => {
          config.server = config.server || {}
          config.server.proxy = config.server.proxy || {}
          config.server.proxy[DEVTOOLS_UI_ROUTE] = {
            target: `http://localhost:${DEVTOOLS_UI_LOCAL_PORT}${DEVTOOLS_UI_ROUTE}`,
            changeOrigin: true,
            followRedirects: true,
            rewrite: path => path.replace(DEVTOOLS_UI_ROUTE, ''),
          }
        })
      }

      addCustomTab({
        name: 'stripe',
        title: 'Stripe',
        icon: 'simple-icons:stripe',
        view: {
          type: 'iframe',
          src: DEVTOOLS_UI_ROUTE,
        },
      })

      const stripeEvents: Stripe.Event[] = []

      let rpc: BirpcGroup<ClientFunctions, ServerFunctions> | undefined

      onDevToolsInitialized(async () => {
        rpc = extendServerRpc<ClientFunctions, ServerFunctions>('nuxt-stripe-rpc', {
          getStripeEvents: () => stripeEvents,
        })
      })

      if (options.webhook.listener !== false) {
        startStripeWebhookListener({
          listener: options.webhook.listener,
          secret: options.webhook.secret,
          handler: (event) => {
            if (typeof event === 'string') {
              logger.info(event)
            }
            else {
              // unshift to put the newest event at the beginning of the list
              stripeEvents.unshift(event)

              rpc?.broadcast.stripeEvent(event)
            }
          },
        })
      }
    }

    logger.success(`\`${name}\` setup done`)
  },
})

interface StripeWebhookEventHandler {
  (data: string | Stripe.Event): void
}

interface StripeWebhookListenerOptions {
  listener?: string
  secret?: string
  handler?: StripeWebhookEventHandler
}

function startStripeWebhookListener(options: StripeWebhookListenerOptions) {
  const { handler } = options

  const nuxt = useNuxt()

  // Stripe CLI want a full URL to the webhook listener
  const origin = `http://localhost:${nuxt.options.devServer.port}`

  const webhookPath = joinURL(origin, options.listener || '/api/stripe/webhook')

  // The secret is either provided in the module options or resolved by Nuxt in the runtime config
  const stripeSecret = options.secret || nuxt.options.runtimeConfig.stripe.secret

  const { getProcess } = startSubprocess(
    {
      // see: https://docs.stripe.com/cli/listen
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
  )

  if (handler) {
    const process = getProcess()

    lineReader(process.stdout!, (line) => {
      if (line.startsWith('{')) {
        handler(JSON.parse(line))
      }
      else {
        handler(line)
      }
    })

    lineReader(process.stderr!, (line) => {
      // Clean up the webhook signing secret from the logs
      const ws = line.match(/Your webhook signing secret is (\S+)/)?.[1]

      handler(ws ? `Your webhook signing secret is \`${ws}\`` : line)
    })

    // Note for the reader:
    // We have to use a custom line reader as the Node.js readline requires use to pass in a input stream
    // which we do not have
    // The implementation is quite naive, trim and skipping empty lines
    // is just to prevent just from being read/parsed incorrectly

    /**
     * Provide a way to read a stream line by line.
     *
     * Line are trimmed and empty lines are ignored.
     */
    function lineReader(stream: NodeJS.ReadableStream, onLine: (line: string) => void) {
      let buffer = ''

      stream.on('data', (data) => {
        buffer += data.toString()

        let i

        // eslint-disable-next-line no-cond-assign
        while ((i = buffer.search(/\r?\n/)) >= 0) {
          const line = buffer.substring(0, i).trim()
          if (line.length > 0) {
            onLine(line)
          }
          buffer = buffer.substring(i + 1)
        }
      })

      stream.on('end', () => {
        if (buffer.length > 0) {
          const line = buffer.trim()
          if (line.length > 0) {
            onLine(line)
          }
        }
      })
    }
  }
}
