"use client";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import Link from "next/link";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { Users, ArrowRight, Lock, Briefcase } from "lucide-react";

export default function EmployeeLoginPage() {
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
            // 1. Authenticate with Supabase Auth
            const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (authError) throw authError;

            // 2. Verify if user is actually an Employee
            // We check the 'employees' table. Note: RLS must allow the user to read their own entry.
            const { data: employeeData, error: employeeError } = await supabase
                .from('employees')
                .select('id, active')
                .eq('auth_id', authData.user.id)
                .single();

            if (employeeError || !employeeData) {
                // Not an employee or error fetching
                await supabase.auth.signOut();
                throw new Error("Esta conta não possui vínculo de colaborador ativo. Se você é um dono, acesse a Área do Empreendedor.");
            }

            if (!employeeData.active) {
                await supabase.auth.signOut();
                throw new Error("Seu acesso de colaborador foi desativado. Contate o administrador.");
            }

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
            background: 'linear-gradient(135deg, #064e3b 0%, #022c22 100%)', // Distinct Green/Teal theme for Employees
            position: 'relative',
            overflow: 'hidden'
        }}>
            {/* Background Effects */}
            <div style={{
                position: 'absolute',
                top: '-20%',
                right: '-10%',
                width: '600px',
                height: '600px',
                background: 'radial-gradient(circle, rgba(16, 185, 129, 0.15) 0%, transparent 70%)',
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
                    <h1 style={{
                        fontSize: '1.5rem',
                        fontWeight: 700,
                        marginBottom: '0.5rem',
                        color: 'white',
                        letterSpacing: '-0.025em'
                    }}>
                        Portal do Colaborador
                    </h1>
                    <p style={{ color: '#d1fae5', fontSize: '0.95rem', lineHeight: '1.5', opacity: 0.8 }}>
                        Acesso exclusivo para equipe <b>NC Nexus</b>.
                    </p>
                </div>

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                    <div>
                        <Input
                            label="E-mail"
                            name="email"
                            type="email"
                            placeholder="seu.nome@empresa.com"
                            required
                            style={{ background: 'rgba(6, 78, 59, 0.5)' }}
                        />
                    </div>
                    <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                            <label style={{ fontSize: '0.875rem', fontWeight: 500, color: '#ecfdf5' }}>Senha</label>
                            <Link
                                href="/forgot-password"
                                style={{ fontSize: '0.8rem', color: '#34d399', textDecoration: 'none' }}
                            >
                                Esqueceu a senha?
                            </Link>
                        </div>
                        <Input
                            name="password"
                            type="password"
                            placeholder="••••••••"
                            required
                            style={{ background: 'rgba(6, 78, 59, 0.5)' }}
                        />
                    </div>

                    {error && (
                        <div style={{
                            padding: '0.75rem',
                            borderRadius: '8px',
                            background: 'rgba(239, 68, 68, 0.2)',
                            border: '1px solid rgba(239, 68, 68, 0.3)',
                            color: '#fca5a5',
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
                            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                            border: 'none',
                            fontSize: '1rem',
                            fontWeight: 600,
                            padding: '0.875rem'
                        }}
                    >
                        Entrar na Equipe <ArrowRight size={18} style={{ marginLeft: '8px' }} />
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
                        <p style={{ fontSize: '0.9rem', color: '#d1fae5', opacity: 0.8, marginBottom: '0.5rem' }}>
                            Ainda não tem senha?{' '}
                            <Link href="/employee/join" style={{ color: '#34d399', fontWeight: 600, textDecoration: 'none' }}>
                                Primeiro Acesso
                            </Link>
                        </p>
                    </div>

                    <div style={{ textAlign: 'center' }}>
                        <Link
                            href="/login"
                            style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                                color: '#d1fae5',
                                fontSize: '0.85rem',
                                textDecoration: 'none',
                                padding: '0.5rem 1rem',
                                borderRadius: '99px',
                                background: 'rgba(255,255,255,0.03)',
                                transition: 'all 0.2s',
                                opacity: 0.8
                            }}
                        >
                            É o dono? Acesse a Área do Empreendedor
                        </Link>
                    </div>
                </div>
            </Card>
        </main>
    )
}
