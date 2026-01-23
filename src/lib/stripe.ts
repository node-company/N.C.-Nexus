import Stripe from 'stripe';

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_mock', {
    apiVersion: '2024-12-18.acacia',
    typescript: true,
});

export const getStripeCustomer = async (email: string, userId: string, name: string) => {
    // Check if customer exists would typically involve a DB query or Stripe Search
    // For simplicity, we create one if we don't have the ID stored locally.
    // In a real flow, we look up `stripe_customer_id` from our DB first.

    const customers = await stripe.customers.list({ email: email, limit: 1 });
    if (customers.data.length > 0) {
        return customers.data[0];
    }

    const customer = await stripe.customers.create({
        email,
        name,
        metadata: {
            userId: userId
        }
    });

    return customer;
};
