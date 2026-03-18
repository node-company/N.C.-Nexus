import { headers } from "next/headers";
import { NextResponse } from "next/server";
import Stripe from "stripe";
import { stripe } from "@/lib/stripe";
import { createClient } from "@supabase/supabase-js";
import { resend } from "@/lib/resend";

// Create a Supabase client with the service role key only when needed
const getSupabaseAdmin = () => {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!url || !key) {
        throw new Error("Missing Supabase configuration (URL or Service Role Key)");
    }

    return createClient(url, key);
};

async function sendRecoveryEmail(email: string, planName: string | undefined, sessionId: string | undefined) {
    if (!email) return;

    let baseUrl = process.env.NEXT_PUBLIC_APP_URL || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000');
    
    // Ensure baseUrl is only the origin (no trailing slashes or subpaths like /register)
    try {
        const url = new URL(baseUrl);
        baseUrl = url.origin;
    } catch (e) {
        console.error("Invalid NEXT_PUBLIC_APP_URL", baseUrl);
    }

    let queryParams = `email_contact=${encodeURIComponent(email)}`;
    if (sessionId) {
        queryParams += `&session_id=${sessionId}`;
    }

    const link = `${baseUrl}/checkout/success?${queryParams}`;

    try {
        await resend.emails.send({
            from: 'N.C. Nexus <contato@nodecompany.com.br>',
            to: email,
            subject: 'Pagamento Confirmado! Finalize seu cadastro no Nexus',
            html: `
                <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #333; line-height: 1.6;">
                    <h1 style="color: #00FF7F;">Sua assinatura está ativa! 🚀</h1>
                    <p>Olá,</p>
                    <p>Recebemos a confirmação do seu pagamento para o plano <strong>${planName || 'Premium'}</strong> do N.C. Nexus.</p>
                    <p>Estamos muito felizes em ter você conosco! Para começar a gerenciar sua empresa, você só precisa finalizar seu cadastro criando uma senha.</p>
                    
                    <div style="text-align: center; margin: 35px 0;">
                        <a href="${link}" style="background-color: #00FF7F; color: #020617; padding: 16px 30px; text-decoration: none; font-weight: bold; border-radius: 12px; display: inline-block; font-size: 16px; box-shadow: 0 4px 6px rgba(0,255,127,0.2);">
                            Finalizar Meu Cadastro Agora
                        </a>
                    </div>
                    
                    <p style="font-size: 14px;">Se o botão acima não funcionar, copie e cole este link no seu navegador:</p>
                    <p style="background: #f4f4f4; padding: 12px; border-radius: 8px; font-size: 13px; word-break: break-all;">
                        <a href="${link}" style="color: #666;">${link}</a>
                    </p>
                    
                    <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;" />
                    <p style="font-size: 12px; color: #999; text-align: center;">
                        Se você já finalizou seu cadastro e já acessou o sistema, pode desconsiderar este e-mail.<br>
                        N.C. Nexus - Soluções para sua empresa.
                    </p>
                </div>
            `
        });
        console.log(`[Email Sent] Onboarding email sent to ${email}`);
    } catch (e) {
        console.error(`[Email Error] Failed to send email to ${email}`, e);
    }
}

async function updateSubscriptionStatus(
    customerId: string,
    subscriptionId: string | null,
    status: string,
    planName: string | null = null
) {
    try {
        const updateData: any = {
            subscription_status: status,
            updated_at: new Date().toISOString()
        };

        if (subscriptionId) updateData.stripe_subscription_id = subscriptionId;
        if (planName) updateData.subscription_plan = planName;

        const { error } = await getSupabaseAdmin()
            .from('company_settings')
            .update(updateData)
            .eq('stripe_customer_id', customerId);

        if (error) {
            console.error(`[DB Error] Failed to update status for customer ${customerId}:`, error);
        } else {
            console.log(`[DB Success] Updated status to ${status} for customer ${customerId}`);
        }
    } catch (e) {
        console.error(`[DB Exception]`, e);
    }
}

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

    try {
        // Handle the event
        switch (event.type) {
            case 'invoice.payment_succeeded': {
                const invoice = event.data.object as any;
                const customerId = invoice.customer as string;
                const subscriptionId = invoice.subscription as string;
                
                let planName = 'mensal';
                let status = 'active';

                if (subscriptionId) {
                    const sub = await stripe.subscriptions.retrieve(subscriptionId);
                    planName = sub.metadata?.planName || 'mensal';
                    status = sub.status; // Pode ser 'trialing' ou 'active'
                }

                await updateSubscriptionStatus(customerId, subscriptionId, status, planName);

                // Send recovery email if it's the first payment or manual trigger
                const email = invoice.customer_email || invoice.customer_name;
                const paymentIntentId = typeof invoice.payment_intent === 'string' 
                    ? invoice.payment_intent 
                    : (invoice.payment_intent as any)?.id;

                // No email here to avoid duplication with checkout.session.completed
                break;
            }

            case 'invoice.payment_failed': {
                const invoice = event.data.object as any;
                const customerId = invoice.customer as string;
                await updateSubscriptionStatus(customerId, invoice.subscription as string, 'past_due');
                break;
            }

            case 'customer.subscription.deleted': {
                const subscription = event.data.object as Stripe.Subscription;
                const customerId = subscription.customer as string;
                await updateSubscriptionStatus(customerId, subscription.id, 'canceled');
                break;
            }

            case 'customer.subscription.updated': {
                const subscription = event.data.object as Stripe.Subscription;
                const customerId = subscription.customer as string;
                const planName = subscription.metadata?.planName || null;
                await updateSubscriptionStatus(customerId, subscription.id, subscription.status, planName);
                break;
            }

            case 'checkout.session.completed': {
                const session = event.data.object as Stripe.Checkout.Session;
                const customerId = session.customer as string;
                const subscriptionId = session.subscription as string;
                const planName = session.metadata?.planName || 'Premium';
                const email = session.customer_details?.email || session.customer_email;

                console.log(`[Webhook] Checkout session completed for ${email}`);

                // 1. Update status in DB
                await updateSubscriptionStatus(customerId, subscriptionId, 'active', planName);

                // 2. Send email with verification link
                if (email) {
                    await sendRecoveryEmail(email, planName, session.id);
                }
                break;
            }

            case 'payment_intent.succeeded': {
                const paymentIntent = event.data.object as Stripe.PaymentIntent;
                const customerId = paymentIntent.customer as string;
                
                if (customerId) {
                    const planName = paymentIntent.metadata?.planName || 'mensal';
                    await updateSubscriptionStatus(customerId, null, 'active', planName);

                    // Fetch email to send recovery
                    let targetEmail = paymentIntent.receipt_email;
                    if (!targetEmail) {
                        const customer = await stripe.customers.retrieve(customerId);
                        if (!customer.deleted) {
                            targetEmail = (customer as Stripe.Customer).email;
                        }
                    }

                    // No email here to avoid duplication with checkout.session.completed
                }
                break;
            }
        }

    } catch (error: any) {
        console.error(`[Webhook Handler Error] ${error.message}`);
        return new NextResponse(`Webhook Handler Error: ${error.message}`, { status: 500 });
    }

    return new NextResponse(null, { status: 200 });
}
