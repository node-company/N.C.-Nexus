import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { ReactNode } from "react";

export default async function VerifiedLayout({ children }: { children: ReactNode }) {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect("/login");
    }

    // 1. Check Company Settings for Subscription Status
    const { data: company } = await supabase
        .from("company_settings")
        .select("subscription_status, stripe_customer_id")
        .eq("user_id", user.id)
        .single();

    // 2. Simplistic Verification Logic
    // Allow: 'active', 'trialing'
    // Block: 'unpaid', 'canceled', 'past_due', or no record

    // Note: If it's an employee (sub-user), we need a different check logic
    // Usually employees don't have their own 'company_settings' but are linked to one.
    // Assuming for now this is the OWNER layout or we check 'employees' table first.

    // Let's check if it is an employee login first (if your app distinguishes purely by route/table)
    // If user is in 'employees' table, we need to check their COMPANY'S subscription.

    // For this MVP step, let's implement the Owner Check:
    if (company) {
        // Enforce both status AND presence of Stripe ID (unless you have 100% manual overrides)
        const hasValidStatus = ['active', 'trialing'].includes(company.subscription_status || '');
        const hasStripeId = !!company.stripe_customer_id;

        if (!hasValidStatus || !hasStripeId) {
            redirect("/subscription/pending");
        }
    } else {
        // If no company settings found, maybe they are an employee?
        // Let's double check if they act as an employee
        const { data: employee } = await supabase.from('employees').select('company_id').eq('auth_user_id', user.id).single();

        if (employee) {
            const { data: employerSettings } = await supabase
                .from("company_settings")
                .select("subscription_status, stripe_customer_id")
                .eq("user_id", employee.company_id)
                .single();

            if (employerSettings) {
                const hasValidStatus = ['active', 'trialing'].includes(employerSettings.subscription_status || '');
                const hasStripeId = !!employerSettings.stripe_customer_id;

                if (!hasValidStatus || !hasStripeId) {
                    redirect("/subscription/pending");
                }
            } else {
                // Not a valid company owner nor a valid employee
                redirect("/subscription/pending");
            }
        } else {
            // No company settings and not an employee record found
            redirect("/subscription/pending");
        }
    }

    return <>{children}</>;
}
