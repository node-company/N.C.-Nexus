import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";

export async function POST(req: NextRequest) {
    try {
        const { sessionId } = await req.json();

        if (!sessionId) {
            return new NextResponse("Missing Session ID", { status: 400 });
        }

        const session = await stripe.checkout.sessions.retrieve(sessionId);

        if (!session) {
            return new NextResponse("Session not found", { status: 404 });
        }

        return NextResponse.json({
            status: session.payment_status, // 'paid' or 'unpaid'
            customer_email: session.customer_details?.email || session.customer_email || null,
            customer: session.customer,
            metadata: session.metadata
        });

    } catch (error) {
        console.error("[VERIFY_SESSION_ERROR]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
