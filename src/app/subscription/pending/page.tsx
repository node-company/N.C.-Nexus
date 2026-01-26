"use client";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { AlertTriangle, CreditCard, LogOut } from "lucide-react";

export default function SubscriptionPendingPage() {
    const router = useRouter();
    const supabase = createClient();

    const handleManageSubscription = async () => {
        // Redirecionar para o Checkout (Default: Anual)
        router.push("/checkout?plan=Anual");
    };

    const handleLogout = async () => {
        await supabase.auth.signOut();
        router.push("/login");
    };

    return (
        <main
            style={{
                minHeight: "100vh",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "2rem",
                background: "#0f172a",
                color: "white",
            }}
        >
            <Card
                style={{
                    maxWidth: "500px",
                    textAlign: "center",
                    padding: "3rem",
                    border: "1px solid rgba(239, 68, 68, 0.2)",
                    background: "rgba(30, 41, 59, 0.5)",
                }}
            >
                <div
                    style={{
                        background: "rgba(239, 68, 68, 0.1)",
                        width: "80px",
                        height: "80px",
                        borderRadius: "50%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        margin: "0 auto 2rem",
                        color: "#ef4444",
                    }}
                >
                    <AlertTriangle size={40} />
                </div>
                <h1 style={{ fontSize: "2rem", fontWeight: 700, marginBottom: "1rem" }}>
                    Acesso Suspenso
                </h1>
                <p style={{ color: "#94a3b8", fontSize: "1.1rem", marginBottom: "2rem", lineHeight: 1.6 }}>
                    Identificamos uma pendência na sua assinatura. Para continuar acessando o
                    NC Nexus e gerenciando sua empresa, por favor regularize seu pagamento.
                </p>

                <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                    <Button
                        onClick={handleManageSubscription}
                        size="lg"
                        style={{
                            background: "#ef4444",
                            border: "none",
                            fontWeight: 700,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: "0.5rem",
                        }}
                    >
                        <CreditCard size={20} />
                        Atualizar Pagamento Agora
                    </Button>

                    <Button
                        onClick={handleLogout}
                        variant="ghost"
                        style={{ color: "#94a3b8" }}
                    >
                        <LogOut size={18} style={{ marginRight: "8px" }} />
                        Sair da conta
                    </Button>
                </div>
            </Card>
        </main>
    );
}
