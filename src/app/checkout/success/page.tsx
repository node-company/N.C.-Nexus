"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { CheckCircle, ArrowRight, User, Package, BarChart3, LayoutDashboard } from "lucide-react";

export default function CheckoutSuccessPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const sessionId = searchParams.get("session_id");
    const [timeLeft, setTimeLeft] = useState(10); // Auto-redirect countdown (optional)

    useEffect(() => {
        // Fire Purchase Pixel
        // @ts-ignore
        if (typeof window !== 'undefined' && window.fbq) {
            // @ts-ignore
            window.fbq('track', 'Purchase', { currency: "BRL", value: 0.00 }); // Value can be dynamic if passed
        }
    }, []);

    const handleGoDashboard = () => {
        router.push("/dashboard");
    };

    return (
        <div style={{
            minHeight: "100vh",
            background: "#111827",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "2rem",
            color: "white",
            textAlign: "center"
        }}>
            <div style={{
                background: "rgba(255, 255, 255, 0.03)",
                border: "1px solid rgba(255, 255, 255, 0.1)",
                borderRadius: "24px",
                padding: "3rem",
                maxWidth: "600px",
                width: "100%",
                backdropFilter: "blur(12px)",
                animation: "fadeIn 0.8s ease-out"
            }}>
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem' }}>
                    <div style={{
                        background: 'rgba(16, 185, 129, 0.2)',
                        padding: '1.5rem',
                        borderRadius: '50%',
                        animation: 'pulse 2s infinite'
                    }}>
                        <CheckCircle size={64} color="#10b981" />
                    </div>
                </div>

                <h1 style={{ fontSize: "2.5rem", fontWeight: 800, marginBottom: "1rem", background: "linear-gradient(to right, white, #10b981)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                    Assinatura Confirmada!
                </h1>

                <p style={{ fontSize: "1.125rem", color: "#d1d5db", marginBottom: "2.5rem" }}>
                    Bem-vindo ao nível PRO. Sua conta foi ativada com sucesso e todos os recursos já estão liberados.
                </p>

                <div style={{ textAlign: 'left', marginBottom: '2.5rem' }}>
                    <h3 style={{ fontSize: "1.25rem", fontWeight: 700, marginBottom: "1.5rem", color: "white" }}>
                        Próximos Passos:
                    </h3>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <StepItem
                            icon={<User size={20} color="#3b82f6" />}
                            title="Complete seu Perfil"
                            desc="Configure os dados da sua empresa no menu Ajustes."
                        />
                        <StepItem
                            icon={<Package size={20} color="#f59e0b" />}
                            title="Cadastre Produtos"
                            desc="Comece a popular seu estoque e serviços."
                        />
                        <StepItem
                            icon={<BarChart3 size={20} color="#ec4899" />}
                            title="Acompanhe Métricas"
                            desc="Veja seus lucros crescerem no Dashboard."
                        />
                    </div>
                </div>

                <Button
                    onClick={handleGoDashboard}
                    style={{
                        width: "100%",
                        height: "56px",
                        fontSize: "1.125rem",
                        fontWeight: 700,
                        background: "linear-gradient(90deg, #10b981, #059669)",
                        boxShadow: "0 4px 14px rgba(16, 185, 129, 0.4)",
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '12px'
                    }}
                >
                    <LayoutDashboard size={24} />
                    Acessar Meu Painel Agora
                </Button>
            </div>
        </div>
    );
}

function StepItem({ icon, title, desc }: { icon: any, title: string, desc: string }) {
    return (
        <div style={{
            display: 'flex',
            gap: '1rem',
            background: 'rgba(255,255,255,0.03)',
            padding: '1rem',
            borderRadius: '12px',
            border: '1px solid rgba(255,255,255,0.05)'
        }}>
            <div style={{ marginTop: '2px' }}>{icon}</div>
            <div>
                <strong style={{ display: 'block', color: 'white', marginBottom: '0.25rem' }}>{title}</strong>
                <span style={{ fontSize: '0.9rem', color: '#9ca3af' }}>{desc}</span>
            </div>
        </div>
    );
}
