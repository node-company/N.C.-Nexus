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

async function sendRecoveryEmail(email: string, userId: string | undefined, planName: string | undefined, paymentIntentId: string | undefined) {
    if (!email) return;

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000');

    let queryParams = `email_contact=${encodeURIComponent(email)}`;
    if (paymentIntentId) {
        queryParams += `&payment_intent=${paymentIntentId}`;
    }

    const link = `${baseUrl}/checkout/success?${queryParams}`;

    try {
        await resend.emails.send({
            from: 'N.C. Nexus <onboarding@resend.dev>',
            to: email,
            subject: 'Pagamento Confirmado! Finalize seu cadastro',
            html: `
                <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
                    <h1>Pagamento Recebido! 🚀</h1>
                    <p>Olá,</p>
                    <p>Recebemos a confirmação do seu pagamento para o plano <strong>${planName || 'Premium'}</strong>.</p>
                    <p>Para acessar sua conta, você precisa definir sua senha e nome da empresa. Clique no botão abaixo para finalizar:</p>
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="${link}" style="background-color: #00FF7F; color: #000; padding: 15px 25px; text-decoration: none; font-weight: bold; border-radius: 5px; display: inline-block;">
                            Finalizar Cadastro Agora
                        </a>
                    </div>
                    <p>Se o botão não funcionar, copie e cole este link:</p>
                    <p><a href="${link}">${link}</a></p>
                    <hr />
                    <p style="font-size: 12px; color: #666;">Se você já finalizou seu cadastro, pode ignorar este e-mail.</p>
                </div>
            `
        });
        console.log(`[Email Sent] Recovery email sent to ${email}`);
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

                if (email) {
                    await sendRecoveryEmail(email, undefined, planName, paymentIntentId);
                }
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

                    if (targetEmail) {
                        await sendRecoveryEmail(targetEmail, undefined, planName, paymentIntent.id);
                    }
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
