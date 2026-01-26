import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";

export async function POST(req: NextRequest) {
    try {
        const { customerId, email, name, phone } = await req.json();

        if (!customerId || !email) {
            return new NextResponse("Missing customerId or email", { status: 400 });
        }

        await stripe.customers.update(customerId, {
            email: email,
            name: name,
            phone: phone
        });

        return NextResponse.json({ success: true });

    } catch (error: any) {
        console.error("[UPDATE_CUSTOMER_ERROR]", error);
        return new NextResponse(JSON.stringify({ error: error.message }), { status: 500 });
    }
}
