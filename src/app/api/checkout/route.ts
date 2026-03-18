import { NextRequest, NextResponse } from "next/server";
import { stripe, getStripeCustomer } from "@/lib/stripe";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
    try {
        const { priceId, planName, name, email, phone } = await req.json();

        // 1. Get current user
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();

        // 2. Identify or Create Customer
        let customer;
        
        // Use provided email/name if guest, or auth user if logged in
        const targetEmail = user?.email || email;
        const targetName = user?.user_metadata?.full_name || name || targetEmail;
        const targetUserId = user?.id || 'guest';

        if (targetEmail) {
            customer = await getStripeCustomer(targetEmail, targetUserId, targetName);
            
            // Always update phone to ensure the latest/correct one is used (forcing E.164)
            if (phone) {
                await stripe.customers.update(customer.id, { phone: phone });
            }

            // Sync with Supabase if logged in
            if (user && !user.user_metadata?.stripe_customer_id) {
                await supabase.auth.updateUser({
                    data: { stripe_customer_id: customer.id }
                });
            }
        } else {
            // Should not happen with current UI flow as email is required
            customer = await stripe.customers.create({
                description: 'Guest Customer via Embedded Checkout',
                name: targetName,
                phone: phone
            });
        }

        // Check price type
        const price = await stripe.prices.retrieve(priceId);

        // 3. Create Checkout Session for Embedded Mode
        const session = await stripe.checkout.sessions.create({
            ui_mode: 'embedded',
            line_items: [
                {
                    price: priceId,
                    quantity: 1,
                },
            ],
            mode: price.type === 'recurring' ? 'subscription' : 'payment',
            customer: customer.id,
            allow_promotion_codes: true,
            // Pre-fill email and name in Stripe UI if possible
            customer_update: {
                name: 'auto',
                address: 'auto'
            },
            phone_number_collection: {
                enabled: true // Always good to have Stripe double-check/collect phone
            },
            return_url: `${req.headers.get('origin')}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
            subscription_data: price.type === 'recurring' ? {
                trial_period_days: 7,
                metadata: {
                    planName,
                    userId: targetUserId
                }
            } : undefined,
            metadata: {
                planName,
                userId: targetUserId,
                customerPhone: phone || '' // Store provided phone in metadata too
            }
        });

        return NextResponse.json({
            clientSecret: session.client_secret,
            sessionId: session.id,
            customerId: customer.id
        });

    } catch (error: any) {
        console.error("[CHECKOUT_SESSION_ERROR]", error);
        return new NextResponse(JSON.stringify({ error: error.message }), { status: 500 });
    }
}
