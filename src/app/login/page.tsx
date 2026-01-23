"use client";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import Link from "next/link";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { Building2, ArrowRight, Lock, Mail } from "lucide-react";

export default function LoginPage() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();
    const supabase = createClient();

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        const formData = new FormData(e.currentTarget);
        const email = formData.get("email") as string;
        const password = formData.get("password") as string;

        try {
            const { error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (error) throw error;

            router.push("/dashboard");
        } catch (err: any) {
            setError(err.message === "Invalid login credentials"
                ? "Email ou senha incorretos"
                : err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <main style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '2rem',
            background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
            position: 'relative',
            overflow: 'hidden'
        }}>
            {/* Background Effects */}
            <div style={{
                position: 'absolute',
                top: '-20%',
                left: '-10%',
                width: '600px',
                height: '600px',
                background: 'radial-gradient(circle, rgba(59, 130, 246, 0.15) 0%, transparent 70%)',
                borderRadius: '50%',
                pointerEvents: 'none'
            }} />
            <div style={{
                position: 'absolute',
                bottom: '-20%',
                right: '-10%',
                width: '600px',
                height: '600px',
                background: 'radial-gradient(circle, rgba(147, 51, 234, 0.15) 0%, transparent 70%)',
                borderRadius: '50%',
                pointerEvents: 'none'
            }} />

            <Card
                style={{
                    maxWidth: '420px',
                    width: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '2rem',
                    padding: '2.5rem',
                    backdropFilter: 'blur(20px)',
                    background: 'rgba(30, 41, 59, 0.7)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
                }}
            >
                <div style={{ textAlign: 'center' }}>
                    <div style={{
                        display: 'flex',
                        justifyContent: 'center',
                        marginBottom: '1.5rem'
                    }}>
                        <div style={{ width: '320px', maxWidth: '100%', filter: 'drop-shadow(0 0 10px rgba(96, 165, 250, 0.3))' }}>
                            <img src="/nc-nexus-logo.png" alt="NC Nexus" style={{ width: '100%' }} />
                        </div>
                    </div>
                    <h1 style={{
                        fontSize: '1.5rem',
                        fontWeight: 700,
                        marginBottom: '0.5rem',
                        color: 'white',
                        letterSpacing: '-0.025em'
                    }}>
                        Área do Empreendedor
                    </h1>
                    <p style={{ color: '#94a3b8', fontSize: '0.95rem', lineHeight: '1.5' }}>
                        Gerencie o <b>NC Nexus</b> com inteligência.
                    </p>
                </div>

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                    <div>
                        <Input
                            label="E-mail Corporativo"
                            name="email"
                            type="email"
                            placeholder="ex: contato@suaempresa.com"
                            required
                            style={{ background: 'rgba(15, 23, 42, 0.5)' }}
                        />
                    </div>
                    <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                            <label style={{ fontSize: '0.875rem', fontWeight: 500, color: '#e2e8f0' }}>Senha</label>
                            <Link
                                href="/forgot-password"
                                style={{ fontSize: '0.8rem', color: '#60a5fa', textDecoration: 'none' }}
                            >
                                Esqueceu a senha?
                            </Link>
                        </div>
                        <Input
                            name="password"
                            type="password"
                            placeholder="••••••••"
                            required
                            style={{ background: 'rgba(15, 23, 42, 0.5)' }}
                        />
                    </div>

                    {error && (
                        <div style={{
                            padding: '0.75rem',
                            borderRadius: '8px',
                            background: 'rgba(239, 68, 68, 0.1)',
                            border: '1px solid rgba(239, 68, 68, 0.2)',
                            color: '#f87171',
                            fontSize: '0.875rem',
                            textAlign: 'center'
                        }}>
                            {error}
                        </div>
                    )}

                    <Button
                        type="submit"
                        variant="primary"
                        size="lg"
                        isLoading={loading}
                        style={{
                            background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                            border: 'none',
                            fontSize: '1rem',
                            fontWeight: 600,
                            padding: '0.875rem'
                        }}
                    >
                        Acessar Painel <ArrowRight size={18} style={{ marginLeft: '8px' }} />
                    </Button>
                </form>

                <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '1rem',
                    borderTop: '1px solid rgba(255,255,255,0.05)',
                    paddingTop: '1.5rem'
                }}>
                    <div style={{ textAlign: 'center' }}>
                        <p style={{ fontSize: '0.9rem', color: '#94a3b8' }}>
                            Deseja criar uma nova empresa?{' '}
                            <Link href="/register" style={{ color: '#60a5fa', fontWeight: 600, textDecoration: 'none' }}>
                                Começar agora
                            </Link>
                        </p>
                    </div>

                    <div style={{ textAlign: 'center' }}>
                        <Link
                            href="/employee/login"
                            style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                                color: '#94a3b8',
                                fontSize: '0.85rem',
                                textDecoration: 'none',
                                padding: '0.5rem 1rem',
                                borderRadius: '99px',
                                background: 'rgba(255,255,255,0.03)',
                                transition: 'all 0.2s'
                            }}
                        >
                            É colaborador? Acesse o Portal da Equipe
                        </Link>
                    </div>
                </div>
            </Card>
        </main>
    );
}
