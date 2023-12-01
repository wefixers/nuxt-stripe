import { eventHandler } from 'h3'
import Stripe from 'stripe'

import { env } from '../../env'

export default eventHandler(async () => {
  const stripe = new Stripe(env.STRIPE_CLIENT_SECRET, {
    apiVersion: '2023-10-16',
  })

  const session = await stripe.checkout.sessions.create({
    locale: 'it',
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
    success_url: 'http://localhost:3000/',
  })

  return session
})
