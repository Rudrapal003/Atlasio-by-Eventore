import { loadStripe } from '@stripe/stripe-js';

// VITE_STRIPE_PUBLISHABLE_KEY should be set in .env
// We fallback to a dummy key to prevent crashes if the user hasn't set it up yet.
const stripeKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || 'pk_test_dummy_key';

let stripePromise;

export const getStripe = () => {
  if (!stripePromise) {
    stripePromise = loadStripe(stripeKey);
  }
  return stripePromise;
};

// Simulated backend call to create a PaymentIntent
// In production, this would call a Supabase Edge Function to securely generate the intent
export const createPaymentIntent = async (amount, vendorStripeAccountId) => {
  console.log(`[Stripe Mock] Created PaymentIntent for $${amount} to account ${vendorStripeAccountId}`);
  
  // Return a mock client secret
  return {
    clientSecret: 'pi_mock_secret_12345',
    status: 'requires_payment_method'
  };
};
