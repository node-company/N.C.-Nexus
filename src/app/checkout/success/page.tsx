"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { CheckCircle2, Building2, Lock, ArrowRight } from "lucide-react";

function CheckoutSuccessContent() {
    const [loading, setLoading] = useState(true);
    const [verifying, setVerifying] = useState(true);
    const [sessionData, setSessionData] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);
    const [formError, setFormError] = useState<string | null>(null);
    const searchParams = useSearchParams();
    const router = useRouter();
    const supabase = createClient();

    // Support both new (PaymentIntent) and old (Session) flows
    const sessionId = searchParams.get('session_id');
    const paymentIntentId = searchParams.get('payment_intent');
    const emailContact = searchParams.get('email_contact');

    useEffect(() => {
        if (!sessionId && !paymentIntentId) {
            router.push('/');
            return;
        }

        // Verify Session Backend
        const verifyPayment = async () => {
            try {
                const res = await fetch('/api/checkout/verify', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        sessionId,
                        paymentIntentId
                    })
                });

                if (!res.ok) throw new Error('Falha na validação do pagamento');

                const data = await res.json();

                // Allow 'processing' status for async payments (like slips/boletos if used someday)
                if (data.status !== 'complete' && data.status !== 'paid' && data.status !== 'succeeded') {
                    // Check if it's strictly failed
                    if (data.status === 'requires_payment_method') {
                        throw new Error('Pagamento não concluído. Tente novamente.');
                    }
                }

                setSessionData(data);
            } catch (err: any) {
                console.error(err);
                setError(err.message || 'Erro ao verificar pagamento');
            } finally {
                setVerifying(false);
                setLoading(false);
            }
        };

        verifyPayment();
    }, [sessionId, paymentIntentId, router]);

    const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        setFormError(null);

        const formData = new FormData(e.currentTarget);
        const password = formData.get("password") as string;
        const confirmPassword = formData.get("confirmPassword") as string;
        const companyName = formData.get("companyName") as string;

        // Use email from URL param as primary fallback if backend didn't return one (common in guest payment intents without strict customer expansion)
        const finalEmail = sessionData?.customer_email || emailContact;

        if (!finalEmail) {
            setFormError("E-mail não encontrado. Entre em contato com o suporte.");
            setLoading(false);
            return;
        }

        if (password !== confirmPassword) {
            setFormError("As senhas não coincidem");
            setLoading(false);
            return;
        }

        try {
            // 1. Create Supabase Auth User
            const { data: authData, error: authError } = await supabase.auth.signUp({
                email: finalEmail,
                password,
                options: {
                    data: {
                        company_name: companyName,
                        stripe_customer_id: sessionData.customer,
                        subscription_status: 'active', // Initial status
                        subscription_plan: sessionData.metadata?.planName || 'monthly'
                    }
                }
            });

            if (authError) {
                console.error("Supabase Auth Error:", authError);
                if (authError.message === "User already registered" || authError.status === 422 || authError.message.includes("already registered")) {
                    throw new Error("Este e-mail já possui uma conta. Por favor, faça login em vez de cadastrar.");
                }
                throw authError;
            }

            // Check for Supabase "fake success" (security feature which returns success for existing emails but empty identities)
            if (authData.user && authData.user.identities && authData.user.identities.length === 0) {
                throw new Error("Este e-mail já está cadastrado. Por favor, acesse a tela de login.");
            }

            alert("Conta criada com sucesso!");
            router.push("/dashboard"); // Direct to dashboard

        } catch (err: any) {
            console.error("Erro no cadastro:", err);
            setFormError(err.message || "Erro ao criar conta.");
        } finally {
            setLoading(false);
        }
    };

    if (verifying) {
        return (
            <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full animate-spin"></div>
                    <p>Verificando pagamento...</p>
                </div>
            </div>
        );
    }

    if (error || !sessionData) {
        return (
            <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white">
                <div className="bg-slate-900 p-8 rounded-xl border border-red-500/20 max-w-md text-center">
                    <h1 className="text-xl font-bold text-red-500 mb-2">Algo deu errado</h1>
                    <p className="text-slate-400 mb-4">{error}</p>
                    <Button onClick={() => router.push('/')} variant="outline">Voltar para Início</Button>
                </div>
            </div>
        );
    }

    return (
        <Card style={{
            maxWidth: '500px',
            width: '100%',
            padding: '2.5rem',
            backdropFilter: 'blur(20px)',
            background: 'rgba(30, 41, 59, 0.7)',
            border: '1px solid rgba(0, 255, 127, 0.2)',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
        }}>
            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                <div style={{
                    background: 'rgba(0, 255, 127, 0.1)',
                    width: '64px',
                    height: '64px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 1.5rem',
                    color: '#00FF7F'
                }}>
                    <CheckCircle2 size={32} />
                </div>
                <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: 'white', marginBottom: '0.5rem' }}>
                    Pagamento Confirmado!
                </h1>
                <p style={{ color: '#94a3b8' }}>
                    Agora, finalize seu cadastro para acessar o <b>NC Nexus</b>.
                </p>
            </div>

            <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

                <div style={{ background: 'rgba(255,255,255,0.05)', padding: '1rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
                    <label style={{ fontSize: '0.8rem', color: '#64748b', display: 'block', marginBottom: '0.25rem' }}>E-mail do Assinante</label>
                    <div style={{ color: 'white', fontWeight: 600 }}>{sessionData?.customer_email || searchParams.get('email_contact')}</div>
                    <input type="hidden" name="email" value={sessionData?.customer_email || searchParams.get('email_contact') || ''} />
                </div>

                <Input
                    label="Nome da Empresa"
                    name="companyName"
                    type="text"
                    placeholder="Ex: Minha Loja Inc"
                    required
                    icon={<Building2 size={18} />}
                    style={{ background: 'rgba(15, 23, 42, 0.5)' }}
                />

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <Input
                        label="Senha de Acesso"
                        name="password"
                        type="password"
                        placeholder="••••••••"
                        required
                        style={{ background: 'rgba(15, 23, 42, 0.5)' }}
                    />
                    <Input
                        label="Confirmar Senha"
                        name="confirmPassword"
                        type="password"
                        placeholder="••••••••"
                        required
                        style={{ background: 'rgba(15, 23, 42, 0.5)' }}
                    />
                </div>

                {formError && <div style={{ color: '#f87171', fontSize: '0.875rem', textAlign: 'center' }}>{formError}</div>}

                <Button
                    type="submit"
                    disabled={loading}
                    style={{
                        marginTop: '1rem',
                        background: '#00FF7F',
                        color: '#000',
                        fontWeight: 700,
                        border: 'none',
                        height: '48px'
                    }}
                >
                    {loading ? 'Criando conta...' : 'Finalizar e Acessar >>'}
                </Button>

                <div style={{ textAlign: 'center', marginTop: '0.5rem' }}>
                    <button
                        type="button"
                        onClick={() => router.push('/')}
                        style={{
                            background: 'transparent',
                            border: 'none',
                            color: '#64748b',
                            fontSize: '0.9rem',
                            cursor: 'pointer',
                            textDecoration: 'underline'
                        }}
                    >
                        Voltar para o Início
                    </button>
                </div>
            </form>
        </Card>
    )
}

export default function CheckoutSuccessPage() {
    return (
        <main style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '2rem',
            background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
        }}>
            <Suspense fallback={
                <div className="flex flex-col items-center gap-4 text-white">
                    <div className="w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full animate-spin"></div>
                    <p>Carregando...</p>
                </div>
            }>
                <CheckoutSuccessContent />
            </Suspense>
        </main>
    );
}
