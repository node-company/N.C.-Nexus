"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { loadStripe } from "@stripe/stripe-js";
import {
    EmbeddedCheckoutProvider,
    EmbeddedCheckout
} from "@stripe/react-stripe-js";
import { Loader2, CheckCircle2, ShieldCheck, ArrowLeft, Lock, User, Phone, Mail } from "lucide-react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

// Initialize Stripe lazily
let stripePromise: Promise<any> | null = null;
const getStripe = () => {
    if (!stripePromise && process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY) {
        stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);
    }
    return stripePromise;
};

const PLANS = {
    'Mensal': {
        monthlyPrice: 'R$ 47,00',
        billingText: 'Cobrado todo mês',
        priceId: process.env.NEXT_PUBLIC_PRICE_ID_MONTHLY || 'price_1SsETSQYiTd3I0XU9tgGdH6b',
        features: ['Acesso Completo ao Sistema', 'Suporte Prioritário', 'Sem Fidelidade', 'Cancelamento a qualquer momento'],
        highlight: false
    },
    'Anual': {
        monthlyPrice: 'R$ 24,75',
        billingText: 'R$ 297,00 cobrado anualmente',
        priceId: process.env.NEXT_PUBLIC_PRICE_ID_ANNUAL || 'price_1SsETSQYiTd3I0XU7lK1QOoH',
        features: ['Acesso Completo ao Sistema', 'Economia de 47%', 'Suporte VIP via WhatsApp', 'Treinamento Exclusivo para Equipe'],
        highlight: true
    },
    'Semestral': {
        monthlyPrice: 'R$ 32,83',
        billingText: 'R$ 197,00 cobrado semestralmente',
        priceId: process.env.NEXT_PUBLIC_PRICE_ID_SEMIANNUAL || 'price_1SsETSQYiTd3I0XU4MfkPYtU',
        features: ['Acesso Completo ao Sistema', 'Economia de 30%', 'Suporte Prioritário'],
        highlight: false
    }
};

function CheckoutContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const planName = searchParams.get("plan") || "Anual";

    const [clientSecret, setClientSecret] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    // Form State
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("+55 ");
    const [showCheckout, setShowCheckout] = useState(false);

    // Fetch user for pre-filling
    useEffect(() => {
        const supabase = createClient();
        supabase.auth.getUser().then(({ data: { user } }) => {
            if (user) {
                setEmail(user.email || "");
                setName(user.user_metadata?.full_name || "");
            }
        });
    }, []);

    // Simple phone mask for Brazil: +55 (XX) XXXXX-XXXX
    const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let value = e.target.value;
        
        // If they try to delete the prefix completely, put it back
        if (!value.startsWith("+55")) {
            value = "+55 " + value.replace(/\D/g, "");
        }

        // Extract only digits after +55
        const digits = value.slice(4).replace(/\D/g, "");
        
        let formatted = "+55 ";
        if (digits.length > 0) {
            formatted += "(" + digits.slice(0, 2);
        }
        if (digits.length > 2) {
            formatted += ") " + digits.slice(2, 7);
        }
        if (digits.length > 7) {
            formatted += "-" + digits.slice(7, 11);
        }
        
        setPhone(formatted);
    };

    const selectedPlan = PLANS[planName as keyof typeof PLANS] || PLANS['Anual'];

    // Function to handle plan switch
    const handlePlanChange = (newPlan: string) => {
        setClientSecret(null);
        setShowCheckout(false);
        router.replace(`/checkout?plan=${newPlan}`, { scroll: false });
    };

    const handleStartCheckout = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        try {
            // Clean phone to E.164 format (+5527999887766)
            const cleanPhone = "+" + phone.replace(/\D/g, "");

            const res = await fetch("/api/checkout", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ 
                    priceId: selectedPlan.priceId, 
                    planName,
                    name,
                    email,
                    phone: cleanPhone
                }),
            });

            if (!res.ok) {
                const json = await res.json();
                throw new Error(json.error || "Falha ao iniciar checkout");
            }

            const data = await res.json();
            if (data.clientSecret) {
                setClientSecret(data.clientSecret);
                setShowCheckout(true);
            } else {
                throw new Error("Resposta inválida do servidor");
            }
        } catch (err: any) {
            console.error(err);
            setError(err.message || "Erro ao conectar com o servidor.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div style={{ background: '#0B1121', minHeight: '100vh', color: 'white', position: 'relative', overflowX: 'hidden' }}>

            {/* Background Ambience */}
            <div style={{ position: 'fixed', top: '-10%', left: '-10%', width: '500px', height: '500px', background: 'rgba(37, 99, 235, 0.1)', borderRadius: '50%', filter: 'blur(120px)', pointerEvents: 'none' }} />
            <div style={{ position: 'fixed', bottom: '-10%', right: '-10%', width: '500px', height: '500px', background: 'rgba(0, 255, 127, 0.05)', borderRadius: '50%', filter: 'blur(120px)', pointerEvents: 'none' }} />

            <div style={{ maxWidth: '1240px', margin: '0 auto', padding: '2rem 1rem', position: 'relative', zIndex: 10 }}>

                {/* Header */}
                <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem' }}>
                    <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#94a3b8', textDecoration: 'none' }}>
                        <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#1e293b', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <ArrowLeft size={20} />
                        </div>
                        <span style={{ fontWeight: 500 }}>Voltar</span>
                    </Link>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#64748b', fontSize: '0.9rem' }}>
                        <Lock size={14} color="#00FF7F" />
                        Ambiente 100% Seguro
                    </div>
                </header>

                <div className="checkout-layout" style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 450px) 1fr', gap: '3rem', alignItems: 'start' }}>

                    {/* Left Column: Plan Summary */}
                    <div style={{ animation: 'fadeInLeft 0.7s ease-out' }}>
                        <div style={{ marginBottom: '2rem' }}>
                            <h1 style={{ fontSize: '2.5rem', fontWeight: 900, marginBottom: '0.5rem', lineHeight: 1.1 }}>
                                Finalize sua <span style={{ color: '#00FF7F' }}>Assinatura</span>
                            </h1>
                            <p style={{ fontSize: '1.1rem', color: '#94a3b8' }}>
                                Comece agora com 7 dias grátis.
                            </p>
                        </div>

                        {/* Plan Switcher */}
                        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', background: '#1e293b', padding: '0.5rem', borderRadius: '0.75rem', border: '1px solid rgba(255,255,255,0.05)' }}>
                            {Object.keys(PLANS).map((p) => {
                                const isActive = planName === p;
                                return (
                                    <button
                                        key={p}
                                        onClick={() => handlePlanChange(p)}
                                        style={{
                                            flex: 1,
                                            padding: '0.75rem',
                                            borderRadius: '0.5rem',
                                            border: 'none',
                                            background: isActive ? '#00FF7F' : 'transparent',
                                            color: isActive ? '#020617' : '#94a3b8',
                                            fontWeight: 700,
                                            cursor: 'pointer',
                                            transition: 'all 0.2s',
                                            fontSize: '0.9rem'
                                        }}
                                    >
                                        {p}
                                    </button>
                                )
                            })}
                        </div>

                        <div style={{
                            background: 'rgba(30, 41, 59, 0.5)',
                            borderRadius: '24px',
                            padding: '2rem',
                            border: '1px solid rgba(255,255,255,0.05)',
                        }}>
                            <h3 style={{ fontSize: '1rem', color: '#94a3b8', fontWeight: 500, marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Você escolheu o plano</h3>
                            <h2 style={{ fontSize: '2.5rem', fontWeight: 800, color: 'white', marginBottom: '0.5rem' }}>{planName}</h2>
                            <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.4rem', marginBottom: '1rem' }}>
                                <span style={{ fontSize: '2rem', fontWeight: 800, color: '#00FF7F' }}>{selectedPlan.monthlyPrice}</span>
                                <span style={{ color: '#94a3b8' }}>/mês</span>
                            </div>
                            <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '1.5rem' }}>{selectedPlan.billingText}</p>

                            <div style={{ width: '100%', height: '1px', background: 'rgba(255,255,255,0.1)', marginBottom: '1.5rem' }} />

                            <ul style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                {selectedPlan.features.map((feature, i) => (
                                    <li key={i} style={{ display: 'flex', alignItems: 'start', gap: '0.75rem', color: '#cbd5e1', fontSize: '0.95rem' }}>
                                        <CheckCircle2 color="#00FF7F" size={18} style={{ minWidth: '18px', marginTop: '3px' }} />
                                        <span>{feature}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>

                    {/* Right Column: Flow */}
                    <div style={{
                        background: '#1e293b',
                        borderRadius: '24px',
                        border: '1px solid rgba(255,255,255,0.05)',
                        boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)',
                        minHeight: '600px',
                        overflow: 'hidden'
                    }}>
                        {!showCheckout ? (
                            <form onSubmit={handleStartCheckout} style={{ padding: '2.5rem' }}>
                                <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                    <Lock size={24} color="#00FF7F" />
                                    Seus Dados
                                </h2>

                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '0.9rem', color: '#94a3b8', marginBottom: '0.5rem' }}>Nome Completo</label>
                                        <div style={{ position: 'relative' }}>
                                            <User size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
                                            <input
                                                type="text"
                                                required
                                                value={name}
                                                onChange={(e) => setName(e.target.value)}
                                                placeholder="Seu nome"
                                                style={{ width: '100%', padding: '12px 12px 12px 40px', borderRadius: '12px', background: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }}
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label style={{ display: 'block', fontSize: '0.9rem', color: '#94a3b8', marginBottom: '0.5rem' }}>Telefone / WhatsApp</label>
                                        <div style={{ position: 'relative' }}>
                                            <div style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                <span style={{ fontSize: '1.1rem', filter: 'saturate(1.5)' }}>🇧🇷</span>
                                                <Phone size={16} style={{ color: '#64748b' }} />
                                            </div>
                                            <input
                                                type="tel"
                                                required
                                                value={phone}
                                                onChange={handlePhoneChange}
                                                placeholder="+55 (00) 00000-0000"
                                                style={{ width: '100%', padding: '12px 12px 12px 56px', borderRadius: '12px', background: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }}
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label style={{ display: 'block', fontSize: '0.9rem', color: '#94a3b8', marginBottom: '0.5rem' }}>Seu Melhor E-mail</label>
                                        <div style={{ position: 'relative' }}>
                                            <Mail size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
                                            <input
                                                type="email"
                                                required
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                placeholder="seu@email.com"
                                                style={{ width: '100%', padding: '12px 12px 12px 40px', borderRadius: '12px', background: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }}
                                            />
                                        </div>
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={isLoading}
                                        style={{
                                            marginTop: '1rem',
                                            padding: '1rem',
                                            background: '#00FF7F',
                                            color: '#020617',
                                            borderRadius: '12px',
                                            fontWeight: 800,
                                            border: 'none',
                                            cursor: isLoading ? 'not-allowed' : 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            gap: '0.5rem',
                                            fontSize: '1rem',
                                            transition: 'transform 0.2s'
                                        }}
                                    >
                                        {isLoading ? <Loader2 className="animate-spin" size={20} /> : 'Ir para Pagamento >>'}
                                    </button>
                                </div>

                                {error && (
                                    <p style={{ color: '#f87171', fontSize: '0.9rem', marginTop: '1rem', textAlign: 'center' }}>{error}</p>
                                )}

                                <p style={{ marginTop: '2rem', textAlign: 'center', fontSize: '0.8rem', color: '#64748b' }}>
                                    Ao clicar em prosseguir, você concorda com nossos termos.
                                </p>
                            </form>
                        ) : clientSecret ? (
                            <div style={{ position: 'relative' }}>
                                <button 
                                    onClick={() => setShowCheckout(false)}
                                    style={{ position: 'absolute', top: '1rem', left: '1rem', zIndex: 50, background: 'rgba(255,255,255,0.05)', border: 'none', color: 'white', padding: '0.5rem', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem' }}
                                >
                                    <ArrowLeft size={14} /> Alterar dados
                                </button>
                                <EmbeddedCheckoutProvider stripe={getStripe()} options={{ clientSecret }}>
                                    <EmbeddedCheckout />
                                </EmbeddedCheckoutProvider>
                            </div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '600px' }}>
                                <Loader2 className="animate-spin" size={48} color="#00FF7F" />
                                <p style={{ color: '#94a3b8', marginTop: '1.5rem' }}>Iniciando ambiente seguro...</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* WhatsApp Support Button */}
            <div style={{ position: 'fixed', bottom: '2rem', right: '2rem', zIndex: 100, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.4rem' }}>
                <a
                    href={`https://wa.me/5527992617000?text=${encodeURIComponent('Olá! Vim pelo site do Nexus e gostaria de saber mais sobre o sistema. Podem me ajudar?')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                        background: '#25D366',
                        color: 'white',
                        width: '64px',
                        height: '64px',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 10px 25px -3px rgba(37, 211, 102, 0.4)',
                        cursor: 'pointer',
                        transition: 'transform 0.2s',
                        textDecoration: 'none'
                    }}
                >
                    <svg viewBox="0 0 24 24" width="30" height="30" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg>
                </a>
                <span style={{ background: '#25D366', color: 'white', fontSize: '0.6rem', fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase', padding: '0.15rem 0.5rem', borderRadius: '99px' }}>Suporte</span>
            </div>

            <style jsx global>{`
                @keyframes fadeInLeft {
                    from { opacity: 0; transform: translateX(-30px); }
                    to { opacity: 1; transform: translateX(0); }
                }
                @media (max-width: 968px) {
                    .checkout-layout {
                        grid-template-columns: 1fr !important;
                        gap: 2rem !important;
                    }
                }
            `}</style>
        </div>
    );
}

export default function CheckoutPage() {
    return (
        <Suspense fallback={
            <div style={{ minHeight: '100vh', background: '#0B1121', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
                <Loader2 className="animate-spin" size={48} color="#00FF7F" />
            </div>
        }>
            <CheckoutContent />
        </Suspense>
    );
}
