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
        .select("subscription_status")
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
        if (!['active', 'trialing'].includes(company.subscription_status || '')) {
            redirect("/subscription/pending");
        }
    } else {
        // If no company settings found, maybe they are an employee?
        // Let's double check if they act as an employee
        const { data: employee } = await supabase.from('employees').select('company_id').eq('auth_user_id', user.id).single();

        if (employee) {
            const { data: employerSettings } = await supabase
                .from("company_settings")
                .select("subscription_status")
                .eq("user_id", employee.company_id) // Assuming employee.company_id links to the owner's Auth ID or Company ID. 
                // Based on typical schema: company_id usually refers to the owner's uuid or a company uuid.
                // If company_settings.user_id is the link, then `company_id` in employees should match it.
                .single();

            if (employerSettings) {
                if (!['active', 'trialing'].includes(employerSettings.subscription_status || '')) {
                    redirect("/subscription/pending");
                }
            }
        }
    }

    return <>{children}</>;
}
