import { eventHandler } from 'h3'

const stripe = useStripe()

export default eventHandler(async (event) => {
  const returnUrl = String(new URL('/', getRequestURL(event, { xForwardedHost: true })))

  const session = await stripe.checkout.sessions.create({
    success_url: returnUrl,
    locale: 'en',
    customer_email: 'test@email.com',
    payment_intent_data: {
      receipt_email: 'test@email.com',
    },
    mode: 'payment',
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: 'eur',
          unit_amount: 10.00 * 100,
          product_data: {
            name: 'Test Item (10 EUR)',
          },
        },
      },
    ],
  })

  return session
})
