import { headers } from "next/headers";
import { NextResponse } from "next/server";
import Stripe from "stripe";
import { stripe } from "@/lib/stripe";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: Request) {
    const body = await req.text();
    const signature = headers().get("Stripe-Signature") as string;
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    if (!webhookSecret) {
        return new NextResponse("Webhook secret not set", { status: 500 });
    }

    let event: Stripe.Event;

    try {
        event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (error: any) {
        return new NextResponse(`Webhook Error: ${error.message}`, { status: 400 });
    }

    const session = event.data.object as Stripe.Checkout.Session;
    const supabase = createClient();

    // Handle the event
    try {
        if (event.type === 'checkout.session.completed') {
            const subscriptionId = session.subscription as string;
            const customerId = session.customer as string;
            const userId = session.metadata?.userId;
            const planName = session.metadata?.planName;

            if (userId) {
                // Update user/company settings
                await supabase.from("company_settings").upsert({
                    user_id: userId,
                    subscription_status: 'active',
                    stripe_customer_id: customerId,
                    stripe_subscription_id: subscriptionId,
                    subscription_plan: planName,
                    updated_at: new Date().toISOString()
                }, { onConflict: 'user_id' });

                console.log(`[Stripe Webhook] Subscription activated for user ${userId}`);
            }
        }

        if (event.type === 'invoice.payment_succeeded') {
            const invoice = event.data.object as Stripe.Invoice;
            const subscriptionId = (invoice as any).subscription as string;

            // Retrieve subscription to get current period end if needed,
            // but for now keeping it active is enough.
            // Ideally we should sync period_end if we added that column.

            const { data: settings } = await supabase
                .from('company_settings')
                .select('user_id')
                .eq('stripe_subscription_id', subscriptionId)
                .single();

            if (settings) {
                await supabase.from("company_settings").update({
                    subscription_status: 'active',
                    updated_at: new Date().toISOString()
                }).eq('user_id', settings.user_id);
                console.log(`[Stripe Webhook] Invoice paid for user ${settings.user_id}`);
            }
        }

        if (event.type === 'customer.subscription.deleted') {
            const subscription = event.data.object as Stripe.Subscription;
            // Find user by stripe_subscription_id and cancel
            const { data: settings } = await supabase
                .from('company_settings')
                .select('user_id')
                .eq('stripe_subscription_id', subscription.id)
                .single();

            if (settings) {
                await supabase.from("company_settings").update({
                    subscription_status: 'canceled',
                    updated_at: new Date().toISOString()
                }).eq('user_id', settings.user_id);
                console.log(`[Stripe Webhook] Subscription canceled for user ${settings.user_id}`);
            }
        }

        if (event.type === 'customer.subscription.updated') {
            const subscription = event.data.object as Stripe.Subscription;

            const { data: settings } = await supabase
                .from('company_settings')
                .select('user_id')
                .eq('stripe_subscription_id', subscription.id)
                .single();

            if (settings) {
                await supabase.from("company_settings").update({
                    subscription_status: subscription.status, // maps 'active', 'past_due', etc. directly
                    updated_at: new Date().toISOString()
                }).eq('user_id', settings.user_id);
            }
        }

    } catch (error: any) {
        console.error(`[Webhook Handler Error] ${error.message}`);
        return new NextResponse(`Webhook Handler Error: ${error.message}`, { status: 500 });
    }

    return new NextResponse(null, { status: 200 });
}
