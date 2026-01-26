import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: Request) {
    try {
        const supabase = createClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        console.log("[PORTAL_DEBUG] User:", user?.id, "Error:", authError);

        if (!user || !user.email) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { data: settings } = await supabase
            .from('company_settings')
            .select('stripe_customer_id')
            .eq('user_id', user.id)
            .single();

        if (!settings?.stripe_customer_id && !user.user_metadata?.stripe_customer_id) {
            return NextResponse.json({ error: "No customer ID found in settings or metadata" }, { status: 404 });
        }

        const customerId = settings?.stripe_customer_id || user.user_metadata?.stripe_customer_id;

        const baseUrl = process.env.NEXT_PUBLIC_APP_URL || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000');

        const session = await stripe.billingPortal.sessions.create({
            customer: customerId,
            return_url: `${baseUrl}/dashboard/settings`,
        });

        return NextResponse.json({ url: session.url });

    } catch (error: any) {
        console.error("[PORTAL_ERROR]", error);
        return new NextResponse(JSON.stringify({ error: error.message }), { status: 500 });
    }
}
