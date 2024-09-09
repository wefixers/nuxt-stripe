import { eventHandler } from 'h3'

const stripe = useStripe()

export default eventHandler(async (event) => {
  const returnUrl = String(new URL('/', getRequestURL(event, { xForwardedHost: true })))

  const intent = await stripe.paymentIntents.create({
    amount: 1000,
    currency: 'usd',
    automatic_payment_methods: {
      enabled: true,
    },
  })

  return {
    clientSecret: intent.client_secret,
    returnUrl,
  }
})
