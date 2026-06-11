// Supabase Edge Function: stripe-checkout
// Handles split payments (Eventore takes 3%, Vendor gets 97%)
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import Stripe from 'https://esm.sh/stripe@12.0.0'

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') ?? '', {
  apiVersion: '2022-11-15',
})

serve(async (req) => {
  try {
    const { vendorStripeAccountId, amount, serviceTitle } = await req.json()

    // Calculate the 3% Eventore platform fee
    const platformFee = Math.round(amount * 0.03)

    // Create a PaymentIntent with the split payment setup
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount,
      currency: 'cad',
      description: `Eventore Booking: ${serviceTitle}`,
      application_fee_amount: platformFee,
      transfer_data: {
        destination: vendorStripeAccountId,
      },
    })

    return new Response(JSON.stringify({ clientSecret: paymentIntent.client_secret }), {
      headers: { 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})
