"use client";

import { useEffect, useState, FormEvent, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { loadStripe } from "@stripe/stripe-js";
import {
    Elements,
    PaymentElement,
    useStripe,
    useElements
} from "@stripe/react-stripe-js";
import { Loader2, CheckCircle2, ShieldCheck, ArrowLeft, Lock } from "lucide-react";
import Link from "next/link";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

const PLANS = {
    'Mensal': {
        price: 'R$ 47',
        period: '/mês',
        features: ['Acesso Completo ao Sistema', 'Suporte Prioritário', 'Sem Fidelidade', 'Cancelamento a qualquer momento']
    },
    'Anual': {
        price: 'R$ 297',
        period: '/ano',
        features: ['Acesso Completo ao Sistema', 'Economia de 47%', 'Suporte VIP via WhatsApp', 'Treinamento Exclusivo para Equipe'],
        highlight: true
    },
    'Semestral': {
        price: 'R$ 197',
        period: '/semestre',
        features: ['Acesso Completo ao Sistema', 'Economia de 30%', 'Suporte Prioritário']
    }
};

function CheckoutForm({ planName, customerId }: { planName: string, customerId: string | null }) {
    const stripe = useStripe();
    const elements = useElements();
    const [message, setMessage] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [email, setEmail] = useState("");
    const [name, setName] = useState("");
    const [phone, setPhone] = useState("");

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();

        if (!stripe || !elements) {
            return;
        }

        setIsLoading(true);

        // 1. Update Customer Data in Stripe Backend
        if (customerId && email) {
            try {
                await fetch('/api/checkout/update-customer', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        customerId,
                        email,
                        name,
                        phone
                    })
                });
            } catch (err) {
                console.error("Failed to update customer data", err);
                // Continue anyway to avoid blocking payment
            }
        }

        const { error } = await stripe.confirmPayment({
            elements,
            confirmParams: {
                // Return URL for success page
                return_url: `${window.location.origin}/checkout/success?email_contact=${encodeURIComponent(email)}`,
                payment_method_data: {
                    billing_details: {
                        name: name,
                        email: email,
                        phone: phone
                    }
                }
            },
        });

        if (error) {
            if (error.type === "card_error" || error.type === "validation_error") {
                setMessage(error.message || "Ocorreu um erro desconhecido.");
            } else {
                setMessage("Ocorreu um erro inesperado.");
            }
        }

        setIsLoading(false);
    };

    return (
        <form onSubmit={handleSubmit} style={{ padding: '2rem' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Lock size={20} color="#00FF7F" />
                Dados do Pagamento
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginBottom: '1.5rem' }}>
                <div>
                    <label style={{ display: 'block', fontSize: '0.9rem', color: '#cbd5e1', marginBottom: '0.5rem' }}>Nome Completo</label>
                    <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Seu nome"
                        style={{
                            width: '100%',
                            padding: '12px',
                            borderRadius: '8px',
                            border: '1px solid rgba(255,255,255,0.1)',
                            background: '#30313d',
                            color: 'white',
                            fontSize: '1rem'
                        }}
                    />
                </div>

                <div>
                    <label style={{ display: 'block', fontSize: '0.9rem', color: '#cbd5e1', marginBottom: '0.5rem' }}>Telefone / WhatsApp</label>
                    <input
                        type="tel"
                        required
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="(00) 00000-0000"
                        style={{
                            width: '100%',
                            padding: '12px',
                            borderRadius: '8px',
                            border: '1px solid rgba(255,255,255,0.1)',
                            background: '#30313d',
                            color: 'white',
                            fontSize: '1rem'
                        }}
                    />
                </div>

                <div>
                    <label style={{ display: 'block', fontSize: '0.9rem', color: '#cbd5e1', marginBottom: '0.5rem' }}>Seu E-mail</label>
                    <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="seu@email.com"
                        style={{
                            width: '100%',
                            padding: '12px',
                            borderRadius: '8px',
                            border: '1px solid rgba(255,255,255,0.1)',
                            background: '#30313d',
                            color: 'white',
                            fontSize: '1rem'
                        }}
                    />
                </div>
            </div>

            <PaymentElement
                id="payment-element"
                options={{
                    layout: "tabs",
                }}
            />

            <div style={{ marginTop: '2rem' }}>
                <button
                    disabled={isLoading || !stripe || !elements || !email}
                    id="submit"
                    style={{
                        width: '100%',
                        padding: '1rem',
                        background: isLoading ? '#334155' : '#00FF7F',
                        color: isLoading ? '#94a3b8' : '#020617',
                        fontWeight: 700,
                        fontSize: '1rem',
                        borderRadius: '8px',
                        border: 'none',
                        cursor: isLoading ? 'not-allowed' : 'pointer',
                        transition: 'all 0.2s',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.5rem'
                    }}
                >
                    {isLoading ? (
                        <>
                            <Loader2 className="animate-spin" size={20} />
                            Processando...
                        </>
                    ) : (
                        `Assinar Plano ${planName}`
                    )}
                </button>
            </div>

            {message && (
                <div style={{ marginTop: '1rem', color: '#ef4444', background: 'rgba(239, 68, 68, 0.1)', padding: '1rem', borderRadius: '8px', fontSize: '0.9rem' }}>
                    {message}
                </div>
            )}

            <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
                <p style={{ fontSize: '0.75rem', color: '#64748b', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                    <Lock size={12} /> Seus dados estão criptografados e seguros.
                </p>
            </div>
        </form>
    );
}

function CheckoutContent() {
    const searchParams = useSearchParams();
    const planName = searchParams.get("plan");
    const [clientSecret, setClientSecret] = useState<string | null>(null);
    const [customerId, setCustomerId] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const selectedPlan = planName && PLANS[planName as keyof typeof PLANS] ? PLANS[planName as keyof typeof PLANS] : null;

    useEffect(() => {
        if (!planName) return;

        const getPriceId = (name: string) => {
            switch (name) {
                // Use Environment Variables for Price IDs (Prod/Test agnostic)
                case 'Anual': return process.env.NEXT_PUBLIC_PRICE_ID_ANNUAL || 'price_1StdIeH9xysmTmT9d0o3PDCS';
                case 'Mensal': return process.env.NEXT_PUBLIC_PRICE_ID_MONTHLY || 'price_1StdJlH9xysmTmT9ySfwMjOq';
                case 'Semestral': return process.env.NEXT_PUBLIC_PRICE_ID_SEMIANNUAL || 'price_1StdJVH9xysmTmT95lE4FKR4';
                default: return null;
            }
        }

        const priceId = getPriceId(planName);

        if (!priceId) {
            setError("Plano inválido ou não encontrado.");
            return;
        }

        console.log("Criando assinatura para:", planName);

        fetch("/api/checkout", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ priceId, planName }),
        })
            .then((res) => {
                if (!res.ok) {
                    return res.json().then(json => { throw new Error(json.error || "Falha na API") });
                }
                return res.json();
            })
            .then((data) => {
                if (data.clientSecret) {
                    setClientSecret(data.clientSecret);
                    setCustomerId(data.customerId);
                } else {
                    setError("Falha ao iniciar pagamento.");
                }
            })
            .catch((err) => {
                console.error(err);
                setError(err.message || "Erro ao conectar com o servidor.");
            });
    }, [planName]);

    if (!planName || !selectedPlan) {
        return (
            <div style={{ background: '#0f172a', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'white', fontFamily: 'var(--font-main)' }}>
                <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1rem' }}>Plano não encontrado</h1>
                <Link href="/" style={{ color: '#00FF7F', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <ArrowLeft size={20} /> Voltar para a página inicial
                </Link>
            </div>
        );
    }

    return (
        <div style={{ background: '#0B1121', minHeight: '100vh', color: 'white', fontFamily: 'var(--font-main)', position: 'relative', overflowX: 'hidden' }}>

            {/* Background Ambience */}
            <div style={{ position: 'fixed', top: '-10%', left: '-10%', width: '500px', height: '500px', background: 'rgba(37, 99, 235, 0.1)', borderRadius: '50%', filter: 'blur(120px)', pointerEvents: 'none' }} />
            <div style={{ position: 'fixed', bottom: '-10%', right: '-10%', width: '500px', height: '500px', background: 'rgba(0, 255, 127, 0.05)', borderRadius: '50%', filter: 'blur(120px)', pointerEvents: 'none' }} />

            <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem 1rem', position: 'relative', zIndex: 10 }}>

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

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '4rem', alignItems: 'start' }}>

                    {/* Left Column: Plan Summary (SAME AS BEFORE) */}
                    <div style={{ animation: 'fadeInLeft 0.7s ease-out' }}>
                        <div style={{ marginBottom: '2rem' }}>
                            <h1 style={{ fontSize: '2.5rem', fontWeight: 900, marginBottom: '0.5rem', lineHeight: 1.1 }}>
                                Finalize sua <span style={{ color: '#00FF7F' }}>Assinatura</span>
                            </h1>
                            <p style={{ fontSize: '1.2rem', color: '#94a3b8' }}>
                                Você está a um passo de transformar a gestão da sua empresa.
                            </p>
                        </div>

                        <div style={{
                            background: selectedPlan.highlight ? '#1e293b' : 'rgba(30, 41, 59, 0.5)',
                            borderRadius: '24px',
                            padding: '2rem',
                            border: selectedPlan.highlight ? '1px solid rgba(0, 255, 127, 0.3)' : '1px solid rgba(255,255,255,0.05)',
                            position: 'relative',
                            boxShadow: selectedPlan.highlight ? '0 0 40px -10px rgba(0,255,127,0.15)' : 'none'
                        }}>
                            {selectedPlan.highlight && (
                                <div style={{ position: 'absolute', top: 0, right: 0, background: '#00FF7F', color: 'black', fontSize: '0.75rem', fontWeight: 700, padding: '0.25rem 0.75rem', borderRadius: '0 24px 0 12px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                    Melhor Escolha
                                </div>
                            )}

                            <h3 style={{ fontSize: '1.25rem', color: '#94a3b8', fontWeight: 500, marginBottom: '0.5rem' }}>Plano Selecionado</h3>
                            <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem', marginBottom: '1.5rem' }}>
                                <span style={{ fontSize: '2.25rem', fontWeight: 700, color: 'white' }}>{planName}</span>
                                <span style={{ fontSize: '1.5rem', fontWeight: 700, color: selectedPlan.highlight ? '#00FF7F' : '#cbd5e1' }}>
                                    {selectedPlan.price}
                                </span>
                                <span style={{ color: '#64748b' }}>{selectedPlan.period}</span>
                            </div>

                            <div style={{ width: '100%', height: '1px', background: 'rgba(255,255,255,0.1)', marginBottom: '1.5rem' }} />

                            <ul style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem' }}>
                                {selectedPlan.features.map((feature, i) => (
                                    <li key={i} style={{ display: 'flex', alignItems: 'start', gap: '0.75rem', color: '#cbd5e1' }}>
                                        <CheckCircle2 color={selectedPlan.highlight ? "#00FF7F" : "#64748b"} size={20} style={{ minWidth: '20px' }} />
                                        <span style={{ lineHeight: 1.4 }}>{feature}</span>
                                    </li>
                                ))}
                            </ul>

                            <div style={{ background: 'rgba(15, 23, 42, 0.5)', borderRadius: '12px', padding: '1rem', display: 'flex', alignItems: 'center', gap: '1rem', border: '1px solid rgba(255,255,255,0.05)' }}>
                                <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(0, 255, 127, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <ShieldCheck size={20} color="#00FF7F" />
                                </div>
                                <div>
                                    <h4 style={{ fontWeight: 600, fontSize: '0.9rem', color: 'white' }}>Garantia de 7 Dias</h4>
                                    <p style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Satisfação garantida ou seu dinheiro de volta.</p>
                                </div>
                            </div>
                        </div>

                        <div style={{ marginTop: '2rem', display: 'flex', alignItems: 'center', gap: '0.5rem', opacity: 0.6, filter: 'grayscale(1)', transition: 'all 0.3s' }}>
                            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Powered by</span>
                            <div style={{ height: '20px', padding: '0 8px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700, fontFamily: 'serif', fontStyle: 'italic', fontSize: '0.8rem' }}>Stripe</div>
                        </div>
                    </div>

                    {/* Right Column: Checkout Form (UPDATED) */}
                    <div style={{
                        background: '#1e293b',
                        borderRadius: '24px',
                        border: '1px solid rgba(255,255,255,0.05)',
                        boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)',
                        overflow: 'hidden',
                        animation: 'fadeInRight 0.7s ease-out 0.2s backwards'
                    }}>
                        {error ? (
                            <div style={{ padding: '3rem', textAlign: 'center', color: '#f87171', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                <div style={{ width: '64px', height: '64px', background: 'rgba(248, 113, 113, 0.1)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
                                    <Lock size={32} />
                                </div>
                                <p style={{ fontSize: '1.2rem', fontWeight: 600, marginBottom: '0.5rem' }}>{error}</p>
                                <button onClick={() => window.location.reload()} style={{ padding: '0.75rem 1.5rem', background: '#334155', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}>Tentar novamente</button>
                            </div>
                        ) : clientSecret ? (
                            <Elements stripe={stripePromise} options={{
                                clientSecret,
                                appearance: {
                                    theme: 'night',
                                    variables: {
                                        colorPrimary: '#00FF7F',
                                        colorBackground: '#1e293b',
                                        colorText: '#ffffff',
                                        borderRadius: '8px'
                                    }
                                }
                            }}>
                                <CheckoutForm planName={planName} customerId={customerId} />
                            </Elements>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '500px' }}>
                                <div style={{ position: 'relative' }}>
                                    <Loader2 className="animate-spin" size={48} color="#00FF7F" />
                                </div>
                                <p style={{ color: '#94a3b8', fontWeight: 500, marginTop: '1.5rem' }}>Preparando ambiente seguro...</p>
                            </div>
                        )}
                    </div>

                </div>
            </div>
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
