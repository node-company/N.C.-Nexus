import { NextRequest, NextResponse } from "next/server";
import { stripe, getStripeCustomer } from "@/lib/stripe";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
    try {
        const { priceId, planName } = await req.json();
        const supabase = createClient();

        const { data: { user } } = await supabase.auth.getUser();

        if (!user || !user.email) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const customer = await getStripeCustomer(user.email, user.id, user.user_metadata.name || "Cliente");

        const session = await stripe.checkout.sessions.create({
            customer: customer.id,
            mode: 'subscription',
            payment_method_types: ['card'],
            line_items: [
                {
                    price: priceId,
                    quantity: 1,
                },
            ],
            success_url: `${process.env.NEXT_PUBLIC_APP_URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/?canceled=true`,
            metadata: {
                userId: user.id,
                planName: planName
            }
        });

        return NextResponse.json({ url: session.url });

    } catch (error) {
        console.error("[CHECKOUT_ERROR]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
