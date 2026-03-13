"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import { ArrowLeft, Save, User, Briefcase, DollarSign, Mail, Phone, Lock, Info } from "lucide-react";
import { useRouter } from "next/navigation";

export default function NewEmployeePage() {
    const router = useRouter();
    const supabase = createClient();
    const [loading, setLoading] = useState(false);
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
        can_sell: true,
        can_manage_products: false,
        can_view_reports: false,
        can_manage_settings: false
    });

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
        setLoading(true);
        setErrorMessage(null);

        try {
            const { data: { user }, error: authError } = await supabase.auth.getUser();

            if (authError || !user) throw new Error("Usuário não autenticado. Por favor, faça login novamente.");

            const salaryValue = formData.salary ? parseFloat(formData.salary.replace(',', '.')) : 0;
            const commissionValue = formData.commission_percentage ? parseFloat(formData.commission_percentage.replace(',', '.')) : 0;
            if (isNaN(salaryValue)) throw new Error("Salário inválido.");
            if (isNaN(commissionValue)) throw new Error("Comissão inválida.");

            // Insert using owner_id instead of user_id to match proper schema
            // We also save the permissions JSON
            const { error } = await supabase.from("employees").insert({
                owner_id: user.id, // Current user is the Owner
                name: formData.name,
                role: formData.role,
                email: formData.email,
                phone: formData.phone,
                salary: salaryValue,
                commission_percentage: commissionValue,
                active: formData.active,
                permissions: permissions
            });

            if (error) {
                console.error("Supabase Error:", error);
                throw new Error(error.message || "Erro ao inserir no banco de dados.");
            }

            router.push("/dashboard/employees");
            router.refresh();

        } catch (error: any) {
            console.error("Error saving employee:", error);
            setErrorMessage(error.message || "Ocorreu um erro desconhecido.");
        } finally {
            setLoading(false);
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

    return (
        <div style={{ 
            maxWidth: '800px', 
            margin: '0 auto', 
            paddingBottom: '5rem', 
            animation: 'fadeIn 0.5s ease',
            padding: '1rem',
            // @ts-ignore
            '--panel-padding': '2rem'
        }}>
            <style jsx>{`
                @media (max-width: 768px) {
                    div { --panel-padding: 1.25rem !important; }
                    .mobile-column { grid-template-columns: 1fr !important; gap: 1rem !important; }
                    .mobile-full-width { width: 100% !important; }
                }
            `}</style>

            <div style={{ marginBottom: '2.5rem' }}>
                <Link href="/dashboard/employees" style={{ display: 'inline-flex', alignItems: 'center', color: '#9ca3af', marginBottom: '1.25rem', textDecoration: 'none', fontSize: '0.9rem', transition: 'color 0.2s' }} onMouseOver={(e) => e.currentTarget.style.color = 'white'} onMouseOut={(e) => e.currentTarget.style.color = '#9ca3af'}>
                    <ArrowLeft size={16} style={{ marginRight: '0.5rem' }} /> Voltar para lista
                </Link>
                <h1 className="responsive-title" style={{ fontWeight: 800, color: 'white', margin: 0 }}>Novo Funcionário</h1>
            </div>

            {errorMessage && (
                <div style={{
                    background: 'rgba(220, 38, 38, 0.1)',
                    border: '1px solid rgba(220, 38, 38, 0.2)',
                    color: '#ef4444',
                    padding: '1rem',
                    borderRadius: '12px',
                    marginBottom: '1.5rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                }}>
                    <strong>Erro:</strong> {errorMessage}
                </div>
            )}

            <div style={{ ...glassStyle, marginBottom: '2rem', background: 'rgba(59, 130, 246, 0.05)', borderColor: 'rgba(59, 130, 246, 0.2)' }}>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <Info size={24} style={{ color: '#60a5fa', flexShrink: 0 }} />
                    <div>
                        <h4 style={{ color: '#60a5fa', margin: '0 0 0.5rem 0', fontSize: '1rem' }}>Acesso ao Sistema</h4>
                        <p style={{ color: '#d1d5db', fontSize: '0.9rem', lineHeight: '1.5', margin: 0 }}>
                            Para acessar o sistema, o funcionário deverá criar uma conta (Cadastre-se) utilizando o <strong>mesmo e-mail</strong> cadastrado abaixo.
                            O sistema irá vincular automaticamente a conta dele a esta permissão.
                        </p>
                    </div>
                </div>
            </div>

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

                <div className="mobile-column" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
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
                            inputMode="tel"
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

                <div className="mobile-column" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
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
                            inputMode="decimal"
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
                        inputMode="decimal"
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

                <div className="mobile-column" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                    <label style={checkboxStyle}>
                        <input
                            type="checkbox"
                            checked={permissions.can_sell}
                            onChange={() => togglePermission('can_sell')}
                            style={{ width: '20px', height: '20px', accentColor: 'var(--color-primary)' }}
                        />
                        <span style={{ color: 'white', fontSize: '0.95rem', fontWeight: 500 }}>Realizar Vendas (PDV)</span>
                    </label>

                    <label style={checkboxStyle}>
                        <input
                            type="checkbox"
                            checked={permissions.can_manage_products}
                            onChange={() => togglePermission('can_manage_products')}
                            style={{ width: '20px', height: '20px', accentColor: 'var(--color-primary)' }}
                        />
                        <span style={{ color: 'white', fontSize: '0.95rem', fontWeight: 500 }}>Gerenciar Produtos/Estoque</span>
                    </label>

                    <label style={checkboxStyle}>
                        <input
                            type="checkbox"
                            checked={permissions.can_view_reports}
                            onChange={() => togglePermission('can_view_reports')}
                            style={{ width: '20px', height: '20px', accentColor: 'var(--color-primary)' }}
                        />
                        <span style={{ color: 'white', fontSize: '0.95rem', fontWeight: 500 }}>Visualizar Relatórios</span>
                    </label>

                    <label style={checkboxStyle}>
                        <input
                            type="checkbox"
                            checked={permissions.can_manage_settings}
                            onChange={() => togglePermission('can_manage_settings')}
                            style={{ width: '20px', height: '20px', accentColor: 'var(--color-primary)' }}
                        />
                        <span style={{ color: 'white', fontSize: '0.95rem', fontWeight: 500 }}>Gerenciar Configurações</span>
                    </label>
                </div>

                <div style={inputGroupStyle}>
                    <label style={labelStyle}>Status</label>
                    <div style={{ display: 'flex', gap: '1rem' }}>
                        <button
                            type="button"
                            onClick={() => setFormData(prev => ({ ...prev, active: true }))}
                            style={{
                                flex: 1,
                                height: '48px',
                                padding: '0.5rem 1rem', borderRadius: '12px', border: '1px solid',
                                borderColor: formData.active ? 'var(--color-primary)' : 'rgba(255,255,255,0.1)',
                                background: formData.active ? 'rgba(16, 185, 129, 0.1)' : 'rgba(255,255,255,0.02)',
                                color: formData.active ? 'var(--color-primary)' : '#6b7280',
                                fontWeight: 600,
                                cursor: 'pointer',
                                transition: 'all 0.2s'
                            }}
                        >
                            Ativo
                        </button>
                        <button
                            type="button"
                            onClick={() => setFormData(prev => ({ ...prev, active: false }))}
                            style={{
                                flex: 1,
                                height: '48px',
                                padding: '0.5rem 1rem', borderRadius: '12px', border: '1px solid',
                                borderColor: !formData.active ? '#ef4444' : 'rgba(255,255,255,0.1)',
                                background: !formData.active ? 'rgba(239, 68, 68, 0.1)' : 'rgba(255,255,255,0.02)',
                                color: !formData.active ? '#ef4444' : '#6b7280',
                                fontWeight: 600,
                                cursor: 'pointer',
                                transition: 'all 0.2s'
                            }}
                        >
                            Inativo
                        </button>
                    </div>
                </div>

                <div style={{ marginTop: '3rem', display: 'flex', justifyContent: 'flex-end' }}>
                    <Button
                        type="submit"
                        disabled={loading}
                        className="mobile-full-width"
                        style={{
                            background: 'linear-gradient(90deg, var(--color-primary), var(--color-accent))',
                            border: 'none',
                            padding: '12px 32px',
                            height: '52px',
                            fontSize: '1rem',
                            fontWeight: 700,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '0.75rem',
                            borderRadius: '12px',
                            boxShadow: '0 4px 14px 0 rgba(0,0,0,0.3)',
                            opacity: loading ? 0.7 : 1,
                            transition: 'transform 0.2s ease'
                        }}
                    >
                        {loading ? "Salvando..." : <><Save size={20} /> Salvar Funcionário</>}
                    </Button>
                </div>
            </form>
        </div>
    );
}
