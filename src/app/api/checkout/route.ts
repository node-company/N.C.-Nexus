import { NextRequest, NextResponse } from "next/server";
import { stripe, getStripeCustomer } from "@/lib/stripe";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
    try {
        const { priceId, planName } = await req.json();

        // 1. Create a Customer
        const customer = await stripe.customers.create({
            description: 'Guest Customer via Custom Checkout',
        });

        // Check price type
        const price = await stripe.prices.retrieve(priceId);

        let clientSecret = "";
        let resourceId = "";

        if (price.type === 'recurring') {
            // SUBSCRIPTION FLOW
            const subscription = await stripe.subscriptions.create({
                customer: customer.id,
                items: [{ price: priceId }],
                payment_behavior: 'default_incomplete',
                payment_settings: {
                    save_default_payment_method: 'on_subscription',
                },
                expand: ['latest_invoice.payment_intent'],
                metadata: { planName: planName },
            });

            // @ts-ignore
            clientSecret = subscription.latest_invoice?.payment_intent?.client_secret;
            resourceId = subscription.id;

        } else {
            // ONE-TIME PAYMENT FLOW
            // Use automatic_payment_methods so only activated methods in Stripe Dashboard appear.
            // This prevents "invalid payment method" errors if Pix is not enabled in the account.
            const paymentIntent = await stripe.paymentIntents.create({
                amount: price.unit_amount!,
                currency: price.currency,
                customer: customer.id,
                automatic_payment_methods: { enabled: true },
                metadata: { planName: planName },
            });

            clientSecret = paymentIntent.client_secret!;
            resourceId = paymentIntent.id;
        }

        if (!clientSecret) {
            throw new Error("Failed to generate payment intent");
        }

        return NextResponse.json({
            clientSecret: clientSecret,
            resourceId: resourceId,
            customerId: customer.id
        });

    } catch (error: any) {
        console.error("[CHECKOUT_ERROR]", error);
        return new NextResponse(JSON.stringify({ error: error.message }), { status: 500 });
    }
}
