"use client";

import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { user, isLoading } = useAuth();
    const router = useRouter();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    useEffect(() => {
        // ... existing auth check logic
        if (!isLoading && !user) {
            router.push("/login");
            return;
        }

        if (user) {
            checkSubscription();
        }
    }, [user, isLoading, router]);

    const checkSubscription = async () => {
        // ... existing checkSubscription logic (unchanged)
        // Skip check for now if just testing (or add logic to bypass locally)
        // return; 

        // import supabase client (must use createClientComponentClient in real app or allow passed client)
        const { createClient } = require("@/lib/supabase/client");
        const supabase = createClient();

        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { data: settings } = await supabase
                .from('company_settings')
                .select('subscription_status')
                .eq('user_id', user.id) // Ensure we filter by current user
                .maybeSingle();

            // Defines valid statuses
            const validStatuses = ['active', 'trialing'];

            // Block if settings is missing OR status is not valid
            // Note: If you want to allow a grace period (e.g. 'past_due'), add it to validStatuses.
            const currentStatus = settings?.subscription_status;

            if (!currentStatus || !validStatuses.includes(currentStatus)) {
                // Redirect to Pending Subscription Page
                if (!window.location.pathname.includes('/subscription/pending')) {
                    router.push("/subscription/pending");
                }
            }
        } catch (error) {
            console.error("Error checking subscription:", error);
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
        <div className="dashboard-layout">
            <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

            <div className="dashboard-main">
                <Header onMenuClick={() => setIsSidebarOpen(true)} />
                <main
                    className="dashboard-content"
                    style={{
                        padding: "0 2rem 2rem 2rem",
                        minHeight: "calc(100vh - 80px)"
                    }}
                >
                    {children}
                </main>
            </div>
        </div>
    );
}
