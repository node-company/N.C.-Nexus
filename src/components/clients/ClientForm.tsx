"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import { ArrowLeft, Save, Loader2, User, FileText, Phone, Mail, MapPin, CreditCard } from "lucide-react";
import Link from "next/link";

interface ClientFormProps {
    initialData?: {
        id?: string;
        name: string;
        email?: string;
        phone?: string;
        document?: string;
        address?: string;
        notes?: string;
        active?: boolean;
    };
    isEdit?: boolean;
}

export function ClientForm({ initialData, isEdit = false }: ClientFormProps) {
    const router = useRouter();
    const supabase = createClient();
    const [loading, setLoading] = useState(false);

    // Form States
    const [formData, setFormData] = useState({
        name: initialData?.name || "",
        email: initialData?.email || "",
        phone: initialData?.phone || "",
        document: initialData?.document || "",
        address: initialData?.address || "",
        notes: initialData?.notes || "",
        active: initialData?.active ?? true,
    });

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);

        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error("Usuário não autenticado");

            const clientData = {
                ...formData,
                user_id: user.id,
            };

            let error;
            if (isEdit && initialData?.id) {
                const { error: updateError } = await supabase
                    .from("clients")
                    .update(clientData)
                    .eq("id", initialData.id);
                error = updateError;
            } else {
                const { error: insertError } = await supabase
                    .from("clients")
                    .insert([clientData]);
                error = insertError;
            }

            if (error) throw error;
            router.push("/dashboard/clients");
            router.refresh();
        } catch (error) {
            console.error("Error saving client:", error);
            alert("Erro ao salvar cliente: " + (error as any).message);
        } finally {
            setLoading(false);
        }
    }

    // Styles
    const inputStyle = {
        background: 'rgba(255, 255, 255, 0.03)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: '8px',
        padding: '16px',
        color: 'white',
        width: '100%',
        fontSize: '1rem',
        outline: 'none',
        transition: 'all 0.2s',
        fontFamily: 'inherit'
    };

    const labelStyle = {
        display: 'block',
        fontSize: '0.75rem',
        fontWeight: 600,
        color: '#9ca3af', // gray-400
        textTransform: 'uppercase' as const,
        letterSpacing: '0.05em',
        marginBottom: '0.5rem'
    };

    return (
        <form onSubmit={handleSubmit} style={{ maxWidth: '1200px', margin: '0 auto', animation: 'fadeIn 0.5s ease', padding: '1rem' }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <Link href="/dashboard/clients">
                        <Button variant="ghost" size="sm" type="button" style={{ borderRadius: '50%', width: '40px', height: '40px', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <ArrowLeft size={20} />
                        </Button>
                    </Link>
                    <div>
                        <h1 style={{ fontSize: '1.875rem', fontWeight: 700, background: 'linear-gradient(to right, white, #9ca3af)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', margin: 0 }}>
                            {isEdit ? "Editar Cliente" : "Novo Cliente"}
                        </h1>
                        <p style={{ color: '#9ca3af', fontSize: '0.875rem', marginTop: '0.25rem' }}>
                            Gerencie as informações dos seus clientes.
                        </p>
                    </div>
                </div>
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                    <Link href="/dashboard/clients">
                        <Button variant="ghost" type="button" style={{ color: '#9ca3af' }}>Cancelar</Button>
                    </Link>
                    <Button type="submit" disabled={loading} style={{ minWidth: '140px', background: 'linear-gradient(90deg, var(--color-primary), var(--color-accent))' }}>
                        {loading ? <Loader2 className="animate-spin" size={20} /> : <><Save size={18} style={{ marginRight: '0.5rem' }} /> Salvar</>}
                    </Button>
                </div>
            </div>

            <div style={{ display: 'flex', gap: '2rem', flexDirection: 'row', flexWrap: 'wrap' }}>

                {/* Main Column */}
                <div style={{ flex: '2', minWidth: '300px', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

                    {/* Basic Info Panel */}
                    <div className="glass-panel" style={{ padding: '2rem', borderRadius: '16px', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        <h3 style={{ fontSize: '1.125rem', fontWeight: 600, color: 'white', display: 'flex', alignItems: 'center', gap: '0.5rem', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '1rem', margin: 0 }}>
                            <User size={18} style={{ color: 'var(--color-primary)' }} /> Dados Pessoais
                        </h3>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.5rem' }}>
                            <div>
                                <label style={labelStyle}>Nome Completo</label>
                                <input
                                    required
                                    type="text"
                                    style={{ ...inputStyle }}
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="Ex: João da Silva"
                                />
                            </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
                            <div>
                                <label style={labelStyle}>CPF / CNPJ</label>
                                <div style={{ position: 'relative' }}>
                                    <input
                                        type="text"
                                        style={{ ...inputStyle, paddingLeft: '3rem' }}
                                        value={formData.document}
                                        onChange={(e) => setFormData({ ...formData, document: e.target.value })}
                                        placeholder="000.000.000-00"
                                    />
                                    <CreditCard style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'gray' }} size={18} />
                                </div>
                            </div>
                            <div>
                                <label style={labelStyle}>Telefone / WhatsApp</label>
                                <div style={{ position: 'relative' }}>
                                    <input
                                        type="text"
                                        style={{ ...inputStyle, paddingLeft: '3rem' }}
                                        value={formData.phone}
                                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                        placeholder="(00) 00000-0000"
                                    />
                                    <Phone style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'gray' }} size={18} />
                                </div>
                            </div>
                        </div>

                        <div>
                            <label style={labelStyle}>Email</label>
                            <div style={{ position: 'relative' }}>
                                <input
                                    type="email"
                                    style={{ ...inputStyle, paddingLeft: '3rem' }}
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    placeholder="cliente@email.com"
                                />
                                <Mail style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'gray' }} size={18} />
                            </div>
                        </div>
                    </div>

                    <div className="glass-panel" style={{ padding: '2rem', borderRadius: '16px', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        <h3 style={{ fontSize: '1.125rem', fontWeight: 600, color: 'white', display: 'flex', alignItems: 'center', gap: '0.5rem', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '1rem', margin: 0 }}>
                            <FileText size={18} style={{ color: 'var(--color-accent)' }} /> Informações Adicionais
                        </h3>

                        <div>
                            <label style={labelStyle}>Endereço Completo</label>
                            <div style={{ position: 'relative' }}>
                                <textarea
                                    rows={2}
                                    style={{ ...inputStyle, resize: 'none', lineHeight: '1.6', paddingLeft: '3rem' }}
                                    value={formData.address}
                                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                    placeholder="Rua, Número, Bairro, Cidade..."
                                />
                                <MapPin style={{ position: 'absolute', left: '1rem', top: '1rem', color: '#4b5563' }} size={18} />
                            </div>
                        </div>

                        <div>
                            <label style={labelStyle}>Observações</label>
                            <textarea
                                rows={3}
                                style={{ ...inputStyle, resize: 'none', lineHeight: '1.6' }}
                                value={formData.notes}
                                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                placeholder="Histórico, preferências ou notas internas..."
                            />
                        </div>
                    </div>

                </div>
            </div>
        </form>
    );
}
