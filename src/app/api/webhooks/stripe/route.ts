import { headers } from "next/headers";
import { NextResponse } from "next/server";
import Stripe from "stripe";
import { stripe } from "@/lib/stripe";
import { createClient } from "@/lib/supabase/server";
import { resend } from "@/lib/resend";

async function sendRecoveryEmail(email: string, userId: string | undefined, planName: string | undefined, paymentIntentId: string | undefined) {
    if (!email) return;

    // Construct the recovery link
    // Assuming the app is hosted, we need the base URL. In dev it's localhost.
    // Ideally use process.env.NEXT_PUBLIC_APP_URL
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000';

    // Check if we have a valid payment ID to allow verification on the page
    let queryParams = `email_contact=${encodeURIComponent(email)}`;
    if (paymentIntentId) {
        queryParams += `&payment_intent=${paymentIntentId}`;
    }

    const link = `${baseUrl}/checkout/success?${queryParams}`;

    try {
        await resend.emails.send({
            from: 'N.C. Nexus <onboarding@resend.dev>', // Update this if user has a domain
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

    const supabase = createClient();

    try {
        // SUBSCRIPTION FLOW (Invoice Paid)
        if (event.type === 'invoice.payment_succeeded') {
            const invoice = event.data.object as any; // Cast to any to avoid strict typing issues with subscription/customer_email
            const email = invoice.customer_email || invoice.customer_name; // fallback

            // Retrieve subscription for metadata
            let planName = 'Premium';
            if (invoice.subscription) {
                const sub = await stripe.subscriptions.retrieve(invoice.subscription as string);
                planName = sub.metadata?.planName || 'Premium';
            }

            const paymentIntentId = typeof invoice.payment_intent === 'string'
                ? invoice.payment_intent
                : (invoice.payment_intent as any)?.id;

            if (email) {
                await sendRecoveryEmail(email, undefined, planName, paymentIntentId);
            }

            // ... exiting logic for updating company_settings if needed
        }

        // ONE-TIME PAYMENT FLOW (PaymentIntent Succeeded)
        if (event.type === 'payment_intent.succeeded') {
            const paymentIntent = event.data.object as Stripe.PaymentIntent;
            const email = paymentIntent.receipt_email || (paymentIntent.payment_method as any)?.billing_details?.email; // Need to expand or check billing_details

            // Usually receipt_email is set if we updated the customer/PI
            // To be sure, we can fetch the customer if email is missing
            let targetEmail = email;

            if (!targetEmail && paymentIntent.customer) {
                const customer = await stripe.customers.retrieve(paymentIntent.customer as string);
                if (!customer.deleted) {
                    targetEmail = (customer as Stripe.Customer).email;
                }
            }

            const planName = paymentIntent.metadata?.planName;

            if (targetEmail) {
                await sendRecoveryEmail(targetEmail, undefined, planName, paymentIntent.id);
            }
        }

    } catch (error: any) {
        console.error(`[Webhook Handler Error] ${error.message}`);
        return new NextResponse(`Webhook Handler Error: ${error.message}`, { status: 500 });
    }

    return new NextResponse(null, { status: 200 });
}
