"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import { ArrowLeft, Save, User, Briefcase, DollarSign, Mail, Phone, Lock } from "lucide-react";
import { useRouter } from "next/navigation";

export default function EditEmployeePage({ params }: { params: { id: string } }) {
    const router = useRouter();
    const supabase = createClient();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        name: "",
        role: "",
        email: "",
        phone: "",
        salary: "",
        commission_percentage: "",
        active: true
    });

    const [permissions, setPermissions] = useState({
        can_sell: false,
        can_manage_products: false,
        can_view_reports: false,
        can_manage_settings: false
    });

    useEffect(() => {
        const fetchEmployee = async () => {
            try {
                const { data, error } = await supabase
                    .from("employees")
                    .select("*")
                    .eq("id", params.id)
                    .single();

                if (error) throw error;
                if (!data) throw new Error("Funcionário não encontrado");

                setFormData({
                    name: data.name,
                    role: data.role,
                    email: data.email || "",
                    phone: data.phone || "",
                    salary: data.salary ? data.salary.toString() : "",
                    commission_percentage: data.commission_percentage ? data.commission_percentage.toString() : "",
                    active: data.active
                });

                if (data.permissions) {
                    setPermissions({
                        can_sell: data.permissions.can_sell ?? false,
                        can_manage_products: data.permissions.can_manage_products ?? false,
                        can_view_reports: data.permissions.can_view_reports ?? false,
                        can_manage_settings: data.permissions.can_manage_settings ?? false
                    });
                } else {
                    // Default if no permissions set
                    setPermissions(prev => ({ ...prev, can_sell: true }));
                }

            } catch (error: any) {
                console.error("Error fetching employee:", error);
                setErrorMessage("Erro ao carregar dados do funcionário.");
            } finally {
                setLoading(false);
            }
        };

        fetchEmployee();
    }, [params.id]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errorMessage) setErrorMessage(null);
    };

    const togglePermission = (key: keyof typeof permissions) => {
        setPermissions(prev => ({ ...prev, [key]: !prev[key] }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setErrorMessage(null);

        try {
            const salaryValue = formData.salary ? parseFloat(formData.salary.replace(',', '.')) : 0;
            const commissionValue = formData.commission_percentage ? parseFloat(formData.commission_percentage.replace(',', '.')) : 0;
            if (isNaN(salaryValue)) throw new Error("Salário inválido.");
            if (isNaN(commissionValue)) throw new Error("Comissão inválida.");

            const { error } = await supabase
                .from("employees")
                .update({
                    name: formData.name,
                    role: formData.role,
                    email: formData.email,
                    phone: formData.phone,
                    salary: salaryValue,
                    commission_percentage: commissionValue,
                    active: formData.active,
                    permissions: permissions,
                    updated_at: new Date().toISOString()
                })
                .eq("id", params.id);

            if (error) throw error;

            router.push("/dashboard/employees");
            router.refresh();

        } catch (error: any) {
            console.error("Error updating employee:", error);
            setErrorMessage(error.message || "Erro ao atualizar funcionário.");
        } finally {
            setSaving(false);
        }
    };

    // Standardized Inline Styles
    const glassStyle = {
        background: 'rgba(255, 255, 255, 0.03)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        backdropFilter: 'blur(12px)',
        borderRadius: '16px',
        padding: '2rem'
    };

    const inputGroupStyle = {
        marginBottom: '1.5rem'
    };

    const labelStyle = {
        display: 'block',
        color: '#9ca3af',
        fontSize: '0.875rem',
        marginBottom: '0.5rem',
        fontWeight: 500
    };

    const inputStyle = {
        width: '100%',
        background: 'rgba(0, 0, 0, 0.2)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: '8px',
        padding: '0.75rem 1rem',
        color: 'white',
        fontSize: '1rem',
        outline: 'none',
        transition: 'border-color 0.2s'
    };

    const checkboxStyle = {
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        padding: '0.75rem',
        background: 'rgba(255,255,255,0.02)',
        borderRadius: '8px',
        border: '1px solid rgba(255,255,255,0.05)',
        cursor: 'pointer',
        transition: 'all 0.2s'
    };

    if (loading) return (
        <div style={{ padding: '4rem', textAlign: 'center', color: '#6b7280' }}>
            <div style={{ width: '3rem', height: '3rem', border: '3px solid rgba(255,255,255,0.1)', borderTopColor: 'var(--color-primary)', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 1rem auto' }}></div>
            Carregando...
        </div>
    );

    return (
        <div style={{ maxWidth: '800px', margin: '0 auto', paddingBottom: '4rem', animation: 'fadeIn 0.5s ease' }}>
            <div style={{ marginBottom: '2rem' }}>
                <Link href="/dashboard/employees" style={{ display: 'inline-flex', alignItems: 'center', color: '#9ca3af', marginBottom: '1rem', textDecoration: 'none', fontSize: '0.9rem' }}>
                    <ArrowLeft size={16} style={{ marginRight: '0.5rem' }} /> Voltar para lista
                </Link>
                <h1 style={{ fontSize: '2rem', fontWeight: 800, color: 'white', margin: 0 }}>Editar Funcionário</h1>
            </div>

            {errorMessage && (
                <div style={{
                    background: 'rgba(220, 38, 38, 0.1)',
                    border: '1px solid rgba(220, 38, 38, 0.2)',
                    color: '#ef4444',
                    padding: '1rem',
                    borderRadius: '12px',
                    marginBottom: '1.5rem'
                }}>
                    <strong>Erro:</strong> {errorMessage}
                </div>
            )}

            <form onSubmit={handleSubmit} style={glassStyle}>

                {/* Personal Info */}
                <h3 style={{ color: 'white', fontSize: '1.25rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <User size={20} style={{ color: 'var(--color-primary)' }} /> Dados Pessoais
                </h3>

                <div style={inputGroupStyle}>
                    <label style={labelStyle}>Nome Completo *</label>
                    <input
                        required
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        style={inputStyle}
                        placeholder="Ex: Maria Silva"
                    />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
                    <div>
                        <label style={labelStyle}><Mail size={14} style={{ display: 'inline', marginRight: '4px' }} /> Email de Acesso *</label>
                        <input
                            required
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            style={inputStyle}
                            placeholder="maria@exemplo.com"
                        />
                    </div>
                    <div>
                        <label style={labelStyle}><Phone size={14} style={{ display: 'inline', marginRight: '4px' }} /> Telefone/Whatsapp</label>
                        <input
                            type="text"
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                            style={inputStyle}
                            placeholder="(11) 99999-9999"
                        />
                    </div>
                </div>

                <div style={{ width: '100%', height: '1px', background: 'rgba(255,255,255,0.1)', margin: '2rem 0' }}></div>

                {/* Contract Info */}
                <h3 style={{ color: 'white', fontSize: '1.25rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Briefcase size={20} style={{ color: 'var(--color-primary)' }} /> Dados Contratuais
                </h3>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
                    <div>
                        <label style={labelStyle}>Cargo *</label>
                        <input
                            required
                            type="text"
                            name="role"
                            value={formData.role}
                            onChange={handleChange}
                            style={inputStyle}
                            placeholder="Ex: Vendedor"
                        />
                    </div>
                    <div>
                        <label style={labelStyle}><DollarSign size={14} style={{ display: 'inline', marginRight: '4px' }} /> Salário</label>
                        <input
                            type="number"
                            name="salary"
                            value={formData.salary}
                            onChange={handleChange}
                            style={inputStyle}
                            placeholder="0.00"
                            step="0.01"
                        />
                    </div>
                </div>

                <div style={inputGroupStyle}>
                    <label style={labelStyle}><DollarSign size={14} style={{ display: 'inline', marginRight: '4px' }} /> Comissão (%) - (Opcional)</label>
                    <input
                        type="number"
                        name="commission_percentage"
                        value={formData.commission_percentage}
                        onChange={handleChange}
                        style={inputStyle}
                        placeholder="Ex: 5"
                        step="0.1"
                        min="0"
                        max="100"
                    />
                </div>

                <div style={{ width: '100%', height: '1px', background: 'rgba(255,255,255,0.1)', margin: '2rem 0' }}></div>

                {/* Permissions */}
                <h3 style={{ color: 'white', fontSize: '1.25rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Lock size={20} style={{ color: 'var(--color-primary)' }} /> Permissões de Acesso
                </h3>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                    <label style={checkboxStyle}>
                        <input
                            type="checkbox"
                            checked={permissions.can_sell}
                            onChange={() => togglePermission('can_sell')}
                            style={{ width: '18px', height: '18px', accentColor: 'var(--color-primary)' }}
                        />
                        <span style={{ color: 'white', fontSize: '0.95rem' }}>Realizar Vendas (PDV)</span>
                    </label>

                    <label style={checkboxStyle}>
                        <input
                            type="checkbox"
                            checked={permissions.can_manage_products}
                            onChange={() => togglePermission('can_manage_products')}
                            style={{ width: '18px', height: '18px', accentColor: 'var(--color-primary)' }}
                        />
                        <span style={{ color: 'white', fontSize: '0.95rem' }}>Gerenciar Produtos/Estoque</span>
                    </label>

                    <label style={checkboxStyle}>
                        <input
                            type="checkbox"
                            checked={permissions.can_view_reports}
                            onChange={() => togglePermission('can_view_reports')}
                            style={{ width: '18px', height: '18px', accentColor: 'var(--color-primary)' }}
                        />
                        <span style={{ color: 'white', fontSize: '0.95rem' }}>Visualizar Relatórios</span>
                    </label>

                    <label style={checkboxStyle}>
                        <input
                            type="checkbox"
                            checked={permissions.can_manage_settings}
                            onChange={() => togglePermission('can_manage_settings')}
                            style={{ width: '18px', height: '18px', accentColor: 'var(--color-primary)' }}
                        />
                        <span style={{ color: 'white', fontSize: '0.95rem' }}>Gerenciar Configurações</span>
                    </label>
                </div>

                <div style={inputGroupStyle}>
                    <label style={labelStyle}>Status</label>
                    <div style={{ display: 'flex', gap: '1rem' }}>
                        <button
                            type="button"
                            onClick={() => setFormData(prev => ({ ...prev, active: true }))}
                            style={{
                                padding: '0.5rem 1rem', borderRadius: '8px', border: '1px solid',
                                borderColor: formData.active ? 'var(--color-primary)' : 'rgba(255,255,255,0.1)',
                                background: formData.active ? 'rgba(16, 185, 129, 0.1)' : 'transparent',
                                color: formData.active ? 'var(--color-primary)' : 'gray',
                                cursor: 'pointer'
                            }}
                        >
                            Ativo
                        </button>
                        <button
                            type="button"
                            onClick={() => setFormData(prev => ({ ...prev, active: false }))}
                            style={{
                                padding: '0.5rem 1rem', borderRadius: '8px', border: '1px solid',
                                borderColor: !formData.active ? '#ef4444' : 'rgba(255,255,255,0.1)',
                                background: !formData.active ? 'rgba(239, 68, 68, 0.1)' : 'transparent',
                                color: !formData.active ? '#ef4444' : 'gray',
                                cursor: 'pointer'
                            }}
                        >
                            Inativo
                        </button>
                    </div>
                </div>

                <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'flex-end' }}>
                    <Button
                        type="submit"
                        disabled={saving}
                        style={{
                            background: 'linear-gradient(90deg, var(--color-primary), var(--color-accent))',
                            border: 'none',
                            padding: '12px 32px',
                            fontSize: '1rem',
                            fontWeight: 600,
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            opacity: saving ? 0.7 : 1
                        }}
                    >
                        {saving ? "Salvando..." : <><Save size={20} /> Salvar Alterações</>}
                    </Button>
                </div>
            </form>
        </div>
    );
}
