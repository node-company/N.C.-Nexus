"use client";

import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Loader2 } from "lucide-react";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { user, isLoading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!isLoading && !user) {
            router.push("/login");
            return;
        }

        if (user) {
            checkSubscription();
        }
    }, [user, isLoading, router]);

    const checkSubscription = async () => {
        // Skip check for now if just testing (or add logic to bypass locally)
        // return; 

        // import supabase client (must use createClientComponentClient in real app or allow passed client)
        // Here we rely on global or new client
        const { createClient } = require("@/lib/supabase/client");
        const supabase = createClient();

        const { data: settings } = await supabase.from('company_settings').select('subscription_status').single();

        // Simple Check: If status is 'canceled' or 'past_due' (and not null/trialing/active)
        // Just an example logic. You might want to allow 'trialing'.
        if (settings && (settings.subscription_status === 'canceled' || settings.subscription_status === 'past_due')) {
            // alert("Sua assinatura expirou. Renove para continuar.");
            // router.push("/#pricing"); // Redirect to pricing or specific renewal page
        }
    };

    if (isLoading) {
        return (
            <div style={{
                height: "100vh",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: "var(--color-background)",
                color: "var(--color-primary)"
            }}>
                <Loader2 className="animate-spin" size={48} />
            </div>
        );
    }

    if (!user) return null;

    return (
        <div style={{ minHeight: "100vh", background: "var(--color-background)" }}>
            <Sidebar />
            <div style={{ display: "flex", flexDirection: "column" }}>
                <Header />
                <main style={{
                    marginLeft: "250px",
                    padding: "0 2rem 2rem 2rem",
                    minHeight: "calc(100vh - 80px)"
                }}>
                    {children}
                </main>
            </div>
        </div>
    );
}
