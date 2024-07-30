export default stripeWebhookHandler(async (event) => {
  switch (event.type) {
    case 'payment_intent.succeeded': {
      //
    }
  }
})
