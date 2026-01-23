"use client";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import Link from "next/link";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { UserPlus, ArrowRight, ShieldCheck } from "lucide-react";

export default function EmployeeJoinPage() {
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

        if (password !== confirmPassword) {
            setError("As senhas não coincidem");
            setLoading(false);
            return;
        }

        try {
            // Note: We don't check for 'employees' table existence here because of RLS (Anonymous users can't read).
            // We rely on the backend trigger to link the account.
            // If the user is NOT in the employees table, they will have a valid account but 
            // the 'Employee Login' page will reject them (as seen in my previous step implementation).

            const { error } = await supabase.auth.signUp({
                email,
                password,
            });

            if (error) throw error;

            alert("Cadastro de senha realizado! Você já pode acessar o portal.");
            router.push("/employee/login");
        } catch (err: any) {
            console.error("Erro no cadastro:", err);
            setError(err.message || "Ocorreu um erro ao definir sua senha.");
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
            background: 'linear-gradient(135deg, #064e3b 0%, #022c22 100%)',
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
                    background: 'rgba(6, 78, 59, 0.7)',
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
                        <div style={{ width: '320px', maxWidth: '100%', filter: 'drop-shadow(0 0 10px rgba(52, 211, 153, 0.3))' }}>
                            <img src="/nc-nexus-logo.png" alt="NC Nexus" style={{ width: '100%' }} />
                        </div>
                    </div>
                    <h1 style={{ fontSize: '1.75rem', fontWeight: 700, marginBottom: '0.5rem', color: 'white' }}>Primeiro Acesso</h1>
                    <p style={{ color: '#d1fae5', opacity: 0.8 }}>
                        Defina sua senha para acessar o painel da equipe.
                        <br />
                        <span style={{ fontSize: '0.8rem', color: '#6ee7b7' }}> (Use o e-mail onde recebeu o convite)</span>
                    </p>
                </div>

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <Input
                        label="E-mail"
                        name="email"
                        type="email"
                        placeholder="seu.email@exemplo.com"
                        required
                        style={{ background: 'rgba(6, 78, 59, 0.5)' }}
                    />
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <Input
                            label="Senha"
                            name="password"
                            type="password"
                            placeholder="••••••••"
                            required
                            style={{ background: 'rgba(6, 78, 59, 0.5)' }}
                        />
                        <Input
                            label="Confirmar"
                            name="confirmPassword"
                            type="password"
                            placeholder="••••••••"
                            required
                            style={{ background: 'rgba(6, 78, 59, 0.5)' }}
                        />
                    </div>

                    {error && (
                        <div style={{
                            color: '#fca5a5',
                            fontSize: '0.875rem',
                            textAlign: 'center',
                            background: 'rgba(220, 38, 38, 0.2)',
                            padding: '0.5rem',
                            borderRadius: '0.5rem'
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
                            marginTop: '0.5rem',
                            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                            border: 'none'
                        }}
                    >
                        Criar Minha Senha <ArrowRight size={18} style={{ marginLeft: '8px' }} />
                    </Button>
                </form>

                <div style={{ textAlign: 'center', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '1.5rem' }}>
                    <p style={{ fontSize: '0.9rem', color: '#d1fae5', opacity: 0.8 }}>
                        Já cadastrou sua senha?{' '}
                        <Link href="/employee/login" style={{ color: '#34d399', fontWeight: 600, textDecoration: 'none' }}>
                            Fazer Login
                        </Link>
                    </p>
                </div>
            </Card>
        </main>
    );
}
