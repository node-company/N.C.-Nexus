import { NextRequest, NextResponse } from "next/server";
import { stripe, getStripeCustomer } from "@/lib/stripe";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
    try {
        const { priceId, planName } = await req.json();

        // Guest Checkout: No user auth check needed here.
        // We will create the user AFTER payment in /checkout/success

        const session = await stripe.checkout.sessions.create({
            mode: 'subscription',
            payment_method_types: ['card'],
            line_items: [
                {
                    price: priceId,
                    quantity: 1,
                },
            ],
            // Request email collection in checkout
            payment_method_collection: 'always',

            success_url: `${process.env.NEXT_PUBLIC_APP_URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/?canceled=true`,
            metadata: {
                planName: planName
                // userId is not known yet
            }
        });

        return NextResponse.json({ url: session.url });

    } catch (error) {
        console.error("[CHECKOUT_ERROR]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
