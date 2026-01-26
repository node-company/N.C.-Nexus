import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: Request) {
    try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user || !user.email) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const { data: settings } = await supabase
            .from('company_settings')
            .select('stripe_customer_id')
            .eq('user_id', user.id)
            .single();

        if (!settings?.stripe_customer_id) {
            return new NextResponse("No customer ID found", { status: 404 });
        }

        const baseUrl = process.env.NEXT_PUBLIC_APP_URL || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000');

        const session = await stripe.billingPortal.sessions.create({
            customer: settings.stripe_customer_id,
            return_url: `${baseUrl}/dashboard/settings`,
        });

        return NextResponse.json({ url: session.url });

    } catch (error: any) {
        console.error("[PORTAL_ERROR]", error);
        return new NextResponse(JSON.stringify({ error: error.message }), { status: 500 });
    }
}
