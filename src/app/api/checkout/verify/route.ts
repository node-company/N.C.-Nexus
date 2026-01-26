import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";

export async function POST(req: NextRequest) {
    try {
        const { sessionId, paymentIntentId } = await req.json();

        if (sessionId) {
            const session = await stripe.checkout.sessions.retrieve(sessionId);
            if (!session) return new NextResponse("Session not found", { status: 404 });

            return NextResponse.json({
                status: session.payment_status,
                customer_email: session.customer_details?.email || session.customer_email || null,
                customer: session.customer,
                metadata: session.metadata
            });
        }

        if (paymentIntentId) {
            const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
            if (!paymentIntent) return new NextResponse("Payment Intent not found", { status: 404 });

            // Retrieve customer to get email if needed, though we might pass it from frontend too.
            // But let's check if the customer object has it.
            let email = null;
            if (paymentIntent.customer) {
                const customer = await stripe.customers.retrieve(paymentIntent.customer as string);
                if (!('deleted' in customer)) {
                    email = customer.email;
                }
            }

            // Map payment_intent status to our expected status format
            const status = paymentIntent.status === 'succeeded' ? 'paid' : paymentIntent.status;

            return NextResponse.json({
                status: status,
                customer_email: email, // Might be null if guest, but we rely on frontend pass-through usually
                customer: paymentIntent.customer,
                metadata: paymentIntent.metadata
            });
        }

        return new NextResponse("Missing Session ID or Payment Intent ID", { status: 400 });

    } catch (error) {
        console.error("[VERIFY_ERROR]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
