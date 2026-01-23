"use client";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import Link from "next/link";
import { Building2, Users } from "lucide-react";

export default function PortalPage() {
    return (
        <main style={{
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '2rem',
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
                width: '800px',
                height: '800px',
                background: 'radial-gradient(circle, rgba(59, 130, 246, 0.1) 0%, transparent 70%)',
                borderRadius: '50%',
                pointerEvents: 'none'
            }} />
            <div style={{
                position: 'absolute',
                bottom: '-20%',
                right: '-10%',
                width: '800px',
                height: '800px',
                background: 'radial-gradient(circle, rgba(16, 185, 129, 0.1) 0%, transparent 70%)',
                borderRadius: '50%',
                pointerEvents: 'none'
            }} />

            <div style={{ textAlign: 'center', marginBottom: '2rem', zIndex: 10 }}>
                {/* Logo */}
                <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'center' }}>
                    <div style={{
                        width: '450px',
                        height: 'auto',
                        maxWidth: '100%',
                        filter: 'drop-shadow(0 0 20px rgba(59, 130, 246, 0.3))'
                    }}>
                        <img
                            src="/nc-nexus-logo.png"
                            alt="NC Nexus Logo"
                            style={{ width: '100%', height: 'auto' }}
                        />
                    </div>
                </div>

                <p style={{ fontSize: '1.25rem', color: '#94a3b8', maxWidth: '600px', margin: '0 auto', marginTop: '1rem' }}>
                    Escolha como deseja acessar a plataforma.
                </p>
            </div>

            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                gap: '2rem',
                width: '100%',
                maxWidth: '900px',
                zIndex: 10
            }}>
                {/* Card Dono */}
                <Card style={{
                    padding: '2.5rem',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '1.5rem',
                    background: 'rgba(30, 41, 59, 0.6)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(59, 130, 246, 0.2)',
                    transition: 'transform 0.2s, border-color 0.2s',
                    cursor: 'pointer'
                }}
                    className="hover:scale-105 hover:border-blue-500"
                >
                    <div style={{
                        padding: '1.5rem',
                        borderRadius: '50%',
                        background: 'rgba(59, 130, 246, 0.1)',
                        color: '#60a5fa'
                    }}>
                        <Building2 size={48} />
                    </div>
                    <div style={{ textAlign: 'center' }}>
                        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'white', marginBottom: '0.5rem' }}>Sou Empreendedor</h2>
                        <p style={{ color: '#94a3b8' }}>Acesse sua empresa e gerencie tudo.</p>
                    </div>
                    <Link href="/login" style={{ width: '100%' }}>
                        <Button style={{
                            width: '100%',
                            background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                            border: 'none',
                            height: '50px',
                            fontSize: '1rem'
                        }}>
                            Entrar como Dono
                        </Button>
                    </Link>
                </Card>

                {/* Card Colaborador */}
                <Card style={{
                    padding: '2.5rem',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '1.5rem',
                    background: 'rgba(30, 41, 59, 0.6)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(16, 185, 129, 0.2)',
                    transition: 'transform 0.2s, border-color 0.2s',
                    cursor: 'pointer'
                }}
                    className="hover:scale-105 hover:border-emerald-500"
                >
                    <div style={{
                        padding: '1.5rem',
                        borderRadius: '50%',
                        background: 'rgba(16, 185, 129, 0.1)',
                        color: '#34d399'
                    }}>
                        <Users size={48} />
                    </div>
                    <div style={{ textAlign: 'center' }}>
                        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'white', marginBottom: '0.5rem' }}>Sou Colaborador</h2>
                        <p style={{ color: '#94a3b8' }}>Acesse o portal da sua equipe.</p>
                    </div>
                    <Link href="/employee/login" style={{ width: '100%' }}>
                        <Button style={{
                            width: '100%',
                            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                            border: 'none',
                            height: '50px',
                            fontSize: '1rem'
                        }}>
                            Entrar como Colaborador
                        </Button>
                    </Link>
                </Card>
            </div>
            <div style={{ marginTop: '3rem', zIndex: 10 }}>
                <p style={{ color: '#64748b', fontSize: '0.9rem' }}>
                    <Link href="/" style={{ color: '#94a3b8', textDecoration: 'underline' }}>
                        Voltar para a Página Inicial
                    </Link>
                </p>
            </div>
        </main>
    );
}
