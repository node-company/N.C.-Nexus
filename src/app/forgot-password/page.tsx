"use client";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import Link from "next/link";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { ArrowLeft, Mail, CheckCircle } from "lucide-react";

export default function ForgotPasswordPage() {
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const supabase = createClient();

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        const formData = new FormData(e.currentTarget);
        const email = formData.get("email") as string;

        try {
            // Note: For this to work efficiently, a Reset Password Page url should be configured in Supabase
            // We will redirect them to a hypothetical /update-password page, or just let Supabase handle the magic link
            const { error } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: `${window.location.origin}/update-password`,
            });

            if (error) throw error;

            setSuccess(true);
        } catch (err: any) {
            setError(err.message || "Erro ao enviar email de recuperação.");
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
            background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
        }}>
            <Card
                style={{
                    maxWidth: '400px',
                    width: '100%',
                    padding: '2.5rem',
                    background: 'rgba(30, 41, 59, 0.7)',
                    backdropFilter: 'blur(20px)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                }}
            >
                {success ? (
                    <div style={{ textAlign: 'center' }}>
                        <div style={{
                            display: 'inline-flex',
                            padding: '1rem',
                            borderRadius: '50%',
                            background: 'rgba(16, 185, 129, 0.2)',
                            color: '#34d399',
                            marginBottom: '1.5rem'
                        }}>
                            <CheckCircle size={48} />
                        </div>
                        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1rem' }}>Verifique seu E-mail</h2>
                        <p style={{ color: '#94a3b8', marginBottom: '2rem' }}>
                            Enviamos um link de recuperação para o endereço informado.
                        </p>
                        <Link href="/login">
                            <Button style={{ width: '100%' }}>Voltar ao Login</Button>
                        </Link>
                    </div>
                ) : (
                    <>
                        <div style={{ marginBottom: '2rem', textAlign: 'center' }}>
                            <div style={{
                                display: 'flex',
                                justifyContent: 'center',
                                marginBottom: '1.5rem'
                            }}>
                                <div style={{ width: '280px', maxWidth: '100%', filter: 'drop-shadow(0 0 10px rgba(96, 165, 250, 0.3))' }}>
                                    <img src="/nc-nexus-logo.png" alt="NC Nexus" style={{ width: '100%' }} />
                                </div>
                            </div>
                            <Link
                                href="/login"
                                style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    color: '#94a3b8',
                                    fontSize: '0.875rem',
                                    marginBottom: '1.5rem',
                                    textDecoration: 'none'
                                }}
                            >
                                <ArrowLeft size={16} style={{ marginRight: '0.5rem' }} /> Voltar
                            </Link>
                            <h1 style={{ fontSize: '1.75rem', fontWeight: 700, marginBottom: '0.5rem' }}>Recuperar Senha</h1>
                            <p style={{ color: '#94a3b8' }}>
                                Digite seu e-mail para receber as instruções de redefinição.
                            </p>
                        </div>

                        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                            <Input
                                label="E-mail"
                                name="email"
                                type="email"
                                placeholder="seu@email.com"
                                required
                                icon={<Mail size={18} />}
                            />

                            {error && (
                                <div style={{
                                    color: '#f87171',
                                    fontSize: '0.875rem',
                                    textAlign: 'center',
                                    padding: '0.5rem',
                                    background: 'rgba(239, 68, 68, 0.1)',
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
                            >
                                Enviar Link
                            </Button>
                        </form>
                    </>
                )}
            </Card>
        </main>
    );
}
