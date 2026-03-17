import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { createClient } from "@/lib/supabase/server";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";

export async function POST(req: Request) {
    try {
        // 1. Try Cookie Authentication first
        const supabase = createClient();
        let { data: { user }, error: authError } = await supabase.auth.getUser();

        // 2. Fallback: Try Authorization Header
        if (!user || authError) {
            const authHeader = req.headers.get('Authorization');
            if (authHeader) {
                const token = authHeader.replace('Bearer ', '');
                const supabaseFallback = createSupabaseClient(
                    process.env.NEXT_PUBLIC_SUPABASE_URL!,
                    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
                );
                const { data } = await supabaseFallback.auth.getUser(token);
                if (data.user) {
                    user = data.user;
                    authError = null; // Clear error since we found user
                    console.log("[PORTAL_DEBUG] User found via Header Token");
                }
            }
        }

        console.log("[PORTAL_DEBUG] Final User:", user?.id, "Error:", authError);

        if (!user || !user.email) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { data: settings } = await supabase
            .from('company_settings')
            .select('stripe_customer_id')
            .eq('user_id', user.id)
            .single();

        let customerId = settings?.stripe_customer_id || user.user_metadata?.stripe_customer_id;

        // 3. Fallback: Search by email if ID is missing
        if (!customerId) {
            console.log("[PORTAL_DEBUG] ID missing, searching by email:", user.email);
            const customers = await stripe.customers.list({ email: user.email, limit: 1 });
            
            if (customers.data.length > 0) {
                customerId = customers.data[0].id;
                console.log("[PORTAL_DEBUG] Customer found via email search:", customerId);

                // Proactively update the database and user metadata for future requests
                await supabase.auth.updateUser({
                    data: { stripe_customer_id: customerId }
                });

                await supabase
                    .from('company_settings')
                    .update({ stripe_customer_id: customerId })
                    .eq('user_id', user.id);
            }
        }

        if (!customerId) {
            return NextResponse.json({ error: "Nenhuma assinatura vinculada a este e-mail foi encontrada." }, { status: 404 });
        }

        const baseUrl = process.env.NEXT_PUBLIC_APP_URL || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000');

        const session = await stripe.billingPortal.sessions.create({
            customer: customerId,
            return_url: new URL('/dashboard/settings', baseUrl).toString(),
        });

        return NextResponse.json({ url: session.url });

    } catch (error: any) {
        console.error("[PORTAL_ERROR]", error);
        return new NextResponse(JSON.stringify({ error: error.message }), { status: 500 });
    }
}
