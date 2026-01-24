"use client";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import Link from "next/link";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { Rocket, ArrowRight, Building2, User } from "lucide-react";

export default function RegisterPage() {
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
        const confirmPassword = formData.get("confirmPassword") as string;
        const companyName = formData.get("companyName") as string;

        if (password !== confirmPassword) {
            setError("As senhas não coincidem");
            setLoading(false);
            return;
        }

        try {
            const { error } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        company_name: companyName,
                    },
                },
            });

            if (error) throw error;

            const searchParams = new URLSearchParams(window.location.search);
            const plan = searchParams.get("plan");

            alert("Cadastro realizado com sucesso! Você será redirecionado para o login.");
            router.push(plan ? `/login?plan=${plan}` : "/login");
        } catch (err: any) {
            console.error("Erro no cadastro:", err);
            setError(err.message || "Ocorreu um erro ao criar a conta.");
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
        }}>
            <Card
                style={{
                    maxWidth: '450px',
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
                    <h1 style={{ fontSize: '1.75rem', fontWeight: 700, marginBottom: '0.5rem', color: 'white' }}>Comece Grátis</h1>
                    <p style={{ color: '#94a3b8' }}>
                        Crie uma conta para sua empresa e organize tudo em um só lugar.
                    </p>
                </div>

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <Input
                        label="Nome da Empresa"
                        name="companyName"
                        type="text"
                        placeholder="Ex: Minha Loja Inc"
                        required
                        icon={<Building2 size={18} />}
                        style={{ background: 'rgba(15, 23, 42, 0.5)' }}
                    />
                    <Input
                        label="E-mail Comercial"
                        name="email"
                        type="email"
                        placeholder="seu@email.com"
                        required
                        icon={<User size={18} />}
                        style={{ background: 'rgba(15, 23, 42, 0.5)' }}
                    />
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <Input
                            label="Senha"
                            name="password"
                            type="password"
                            placeholder="••••••••"
                            required
                            style={{ background: 'rgba(15, 23, 42, 0.5)' }}
                        />
                        <Input
                            label="Confirmar"
                            name="confirmPassword"
                            type="password"
                            placeholder="••••••••"
                            required
                            style={{ background: 'rgba(15, 23, 42, 0.5)' }}
                        />
                    </div>

                    {error && (
                        <div style={{ color: '#f87171', fontSize: '0.875rem', textAlign: 'center' }}>
                            {error}
                        </div>
                    )}

                    <Button
                        type="submit"
                        variant="primary"
                        size="lg"
                        isLoading={loading}
                        style={{
                            marginTop: '0.5rem',
                            background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                            border: 'none'
                        }}
                    >
                        Criar Conta da Empresa <ArrowRight size={18} style={{ marginLeft: '8px' }} />
                    </Button>
                </form>

                <div style={{ textAlign: 'center', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '1.5rem' }}>
                    <p style={{ fontSize: '0.9rem', color: '#94a3b8' }}>
                        Já tem uma conta?{' '}
                        <Link href="/login" style={{ color: '#60a5fa', fontWeight: 600, textDecoration: 'none' }}>
                            Fazer Login
                        </Link>
                    </p>
                    <div style={{ marginTop: '1rem' }}>
                        <Link
                            href="/employee/login"
                            style={{ fontSize: '0.85rem', color: '#94a3b8', textDecoration: 'underline' }}
                        >
                            Sou funcionário e quero entrar na minha equipe
                        </Link>
                    </div>
                </div>
            </Card>
        </main>
    );
}
