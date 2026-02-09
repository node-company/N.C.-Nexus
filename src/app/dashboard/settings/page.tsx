"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import { Save, Building, Image as ImageIcon, MapPin, Mail, Phone, FileText, Globe, Link2, Check, Copy } from "lucide-react";
import { ImageUpload } from "@/components/ui/ImageUpload";
import { usePermissions } from "@/hooks/usePermissions";

interface CompanySettings {
    id?: string;
    name: string;
    cnpj: string;
    email: string;
    phone: string;
    address: string;
    logo_url: string;
    footer_text: string;
    subscription_status?: string;
    subscription_plan?: string;
    catalog_slug?: string;
    catalog_active?: boolean;
    whatsapp_number?: string;
}

export default function SettingsPage() {
    const supabase = createClient();
    const { can_manage_settings, loading: permissionsLoading } = usePermissions();

    if (!permissionsLoading && !can_manage_settings) {
        return (
            <div style={{ padding: '4rem', textAlign: 'center', color: '#6b7280' }}>
                <h2 style={{ color: 'white', marginBottom: '1rem' }}>Acesso Negado</h2>
                <p>Você não tem permissão para acessar as configurações.</p>
            </div>
        );
    }
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [tempImages, setTempImages] = useState<string[]>([]);
    const [originalLogo, setOriginalLogo] = useState("");
    const [settings, setSettings] = useState<CompanySettings>({
        name: "",
        cnpj: "",
        email: "",
        phone: "",
        address: "",
        logo_url: "",
        footer_text: "Obrigado pela preferência!",
        catalog_active: false,
        catalog_slug: "",
        whatsapp_number: ""
    });

    // Styles
    const glassStyle = {
        background: 'rgba(255, 255, 255, 0.03)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        backdropFilter: 'blur(12px)',
        borderRadius: '16px',
    };

    const inputStyle = {
        background: 'rgba(255, 255, 255, 0.05)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: '8px',
        padding: '12px',
        color: 'white',
        outline: 'none',
        fontSize: '1rem',
        width: '100%'
    };

    const labelStyle = {
        display: 'block',
        color: '#9ca3af',
        fontSize: '0.875rem',
        fontWeight: 600,
        marginBottom: '0.5rem',
        textTransform: 'uppercase' as const,
        letterSpacing: '0.05em'
    };

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase.from('company_settings').select('*').single();
            if (error && error.code !== 'PGRST116') { // Ignore "No rows found"
                console.error("Error fetching settings:", error);
            }
            if (data) {
                setSettings(data);
                setOriginalLogo(data.logo_url || "");
            }
        } catch (error) {
            console.error("Error:", error);
        } finally {
            setLoading(false);
        }
    };

    const deleteImageFromStorage = async (imageUrl: string) => {
        try {
            const fileName = imageUrl.split('/').pop();
            if (!fileName) return;
            const { error } = await supabase.storage.from("company-images").remove([fileName]);
            if (error) console.error("Error deleting image:", error);
            else console.log("Deleted image:", fileName);
        } catch (err) {
            console.error("Exception deleting image:", err);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error("No user");

            const payload = { ...settings, user_id: user.id };

            // Upsert based on user_id (unique constraint)
            const { error } = await supabase
                .from('company_settings')
                .upsert(payload, { onConflict: 'user_id' });

            if (error) throw error;

            // Cleanup Logic
            // 1. If logo changed, delete original
            if (originalLogo && originalLogo !== settings.logo_url) {
                await deleteImageFromStorage(originalLogo);
            }

            // 2. Cleanup unused temp images
            for (const tempUrl of tempImages) {
                if (tempUrl !== settings.logo_url) {
                    await deleteImageFromStorage(tempUrl);
                }
            }

            // Update original logo reference for next save
            setOriginalLogo(settings.logo_url);
            setTempImages([]); // Clear temp list

            alert("Configurações salvas com sucesso!");
        } catch (error: any) {
            console.error("Error saving settings:", error);
            alert("Erro ao salvar: " + error.message);
        } finally {
            setSaving(false);
        }
    };

    const handleManageSubscription = async () => {
        try {
            const response = await fetch("/api/portal", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include"
            });

            if (!response.ok) throw new Error("Erro ao abrir portal");

            const { url } = await response.json();
            window.location.href = url;
        } catch (error) {
            console.error(error);
            alert("Erro ao redirecionar para o portal de assinatura.");
        }
    };

    const handleSubscribe = async (planName: string, priceId: string) => {
        try {
            const response = await fetch("/api/checkout", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({
                    priceId: priceId,
                    planName: planName
                })
            });

            if (!response.ok) {
                if (response.status === 401) {
                    alert("Erro de autenticação. Faça login novamente.");
                    return;
                }
                throw new Error("Erro ao iniciar checkout");
            }

            const { url } = await response.json();
            window.location.href = url;

        } catch (error) {
            console.error(error);
            alert("Erro ao conectar com o pagamento.");
        }
    };

    if (loading) {
        return <div style={{ padding: '2rem', textAlign: 'center', color: '#9ca3af' }}>Carregando configurações...</div>;
    }

    return (
        <div style={{ maxWidth: "800px", margin: "0 auto", paddingBottom: "4rem", animation: 'fadeIn 0.6s ease' }}>
            <div style={{ marginBottom: "2rem" }}>
                <h1 style={{ fontSize: '2.25rem', fontWeight: 800, background: 'linear-gradient(to right, white, #9ca3af)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', margin: 0 }}>
                    Configurações da Empresa
                </h1>
                <p style={{ color: '#9ca3af', marginTop: '0.25rem' }}>Personalize seus documentos e recibos</p>
            </div>

            <div style={{ ...glassStyle, padding: '2rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

                    {/* Basic Info */}
                    <div style={{ paddingBottom: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                        <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'white', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Building size={20} color="#34d399" /> Informações Básicas
                        </h3>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                            <div>
                                <label style={labelStyle}>Nome da Empresa</label>
                                <input type="text" placeholder="Minha Loja Ltda" style={inputStyle} value={settings.name} onChange={e => setSettings({ ...settings, name: e.target.value })} />
                            </div>
                            <div>
                                <label style={labelStyle}>CNPJ / CPF</label>
                                <input type="text" placeholder="00.000.000/0001-00" style={inputStyle} value={settings.cnpj} onChange={e => setSettings({ ...settings, cnpj: e.target.value })} />
                            </div>
                        </div>
                    </div>

                    {/* Contact */}
                    <div style={{ paddingBottom: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                        <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'white', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <MapPin size={20} color="#3b82f6" /> Contato e Endereço
                        </h3>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                            <div>
                                <label style={labelStyle}>Email de Contato</label>
                                <div style={{ position: 'relative' }}>
                                    <Mail size={16} style={{ position: 'absolute', left: '12px', top: '14px', color: '#9ca3af' }} />
                                    <input type="email" placeholder="contato@empresa.com" style={{ ...inputStyle, paddingLeft: '36px' }} value={settings.email} onChange={e => setSettings({ ...settings, email: e.target.value })} />
                                </div>
                            </div>
                            <div>
                                <label style={labelStyle}>Telefone / WhatsApp</label>
                                <div style={{ position: 'relative' }}>
                                    <Phone size={16} style={{ position: 'absolute', left: '12px', top: '14px', color: '#9ca3af' }} />
                                    <input type="text" placeholder="(11) 99999-9999" style={{ ...inputStyle, paddingLeft: '36px' }} value={settings.phone} onChange={e => setSettings({ ...settings, phone: e.target.value })} />
                                </div>
                            </div>
                        </div>
                        <div>
                            <label style={labelStyle}>Endereço Completo</label>
                            <input type="text" placeholder="Rua das Flores, 123 - Centro, São Paulo - SP" style={inputStyle} value={settings.address} onChange={e => setSettings({ ...settings, address: e.target.value })} />
                        </div>
                    </div>

                    {/* Branding */}
                    <div style={{ paddingBottom: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                        <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'white', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <ImageIcon size={20} color="#ec4899" /> Marca & Logo
                        </h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            <label style={labelStyle}>Logo da Empresa</label>
                            <div style={{ maxWidth: '400px' }}>
                                <ImageUpload
                                    value={settings.logo_url}
                                    onChange={(url) => {
                                        setSettings(prev => ({ ...prev, logo_url: url }));
                                        if (url) setTempImages(prev => [...prev, url]);
                                    }}
                                    bucket="company-images"
                                />
                            </div>
                            <p style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '0.5rem' }}>
                                Este logo sairá nos recibos impressos e no cabeçalho.
                            </p>
                        </div>
                    </div>

                    {/* Subscription */}
                    <div style={{ paddingBottom: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                        <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'white', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ color: '#facc15' }}>★</span> Assinatura e Plano
                        </h3>
                        <div style={{
                            background: 'rgba(255,255,255,0.05)',
                            padding: '1.5rem',
                            borderRadius: '12px',
                            border: '1px solid rgba(255,255,255,0.05)',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center'
                        }}>
                            <div>
                                <div style={{ fontSize: '0.9rem', color: '#9ca3af', marginBottom: '0.25rem' }}>Plano Atual</div>
                                <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'white', textTransform: 'capitalize' }}>
                                    {settings.subscription_plan || "Gratuito / Trial"}
                                </div>
                                <div style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '6px',
                                    marginTop: '0.5rem',
                                    fontSize: '0.85rem',
                                    padding: '4px 12px',
                                    borderRadius: '99px',
                                    background: settings.subscription_status === 'active' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                                    color: settings.subscription_status === 'active' ? '#34d399' : '#f87171',
                                    fontWeight: 600
                                }}>
                                    Status: {settings.subscription_status === 'active' ? 'Ativo' : (settings.subscription_status || 'Inativo')}
                                </div>
                            </div>
                            {(settings.subscription_status === 'active' || settings.subscription_status === 'trialing') ? (
                                <Button
                                    onClick={handleManageSubscription}
                                    style={{
                                        background: 'white',
                                        color: 'black',
                                        fontWeight: 700,
                                        border: 'none'
                                    }}
                                >
                                    Gerenciar Assinatura
                                </Button>
                            ) : (
                                <div style={{ display: 'flex', gap: '1rem' }}>
                                    <Button
                                        onClick={() => handleSubscribe('Mensal', 'price_1QjYYYY')}
                                        style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.2)', color: 'white' }}
                                    >
                                        Mensal
                                    </Button>
                                    <Button
                                        onClick={() => handleSubscribe('Anual', 'price_1QjXXXX')}
                                        style={{ background: '#00FF7F', color: 'black', fontWeight: 700, border: 'none' }}
                                    >
                                        Anual
                                    </Button>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Public Catalog */}
                    <div style={{ paddingBottom: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'white', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <Globe size={20} color="#a78bfa" /> Catálogo Digital Público
                            </h3>
                            <button
                                onClick={() => setSettings(prev => ({ ...prev, catalog_active: !prev.catalog_active }))}
                                style={{
                                    background: settings.catalog_active ? '#34d399' : 'rgba(255,255,255,0.1)',
                                    border: 'none',
                                    padding: '6px 16px',
                                    borderRadius: '99px',
                                    color: settings.catalog_active ? 'black' : 'white',
                                    fontSize: '0.8rem',
                                    fontWeight: 700,
                                    cursor: 'pointer',
                                    transition: 'all 0.3s'
                                }}
                            >
                                {settings.catalog_active ? 'ATIVADO' : 'DESATIVADO'}
                            </button>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                            <div>
                                <label style={labelStyle}>Link do seu Catálogo (Slug)</label>
                                <div style={{ position: 'relative' }}>
                                    <span style={{ position: 'absolute', left: '12px', top: '14px', color: '#6b7280', fontSize: '0.9rem' }}>/catalog/</span>
                                    <input
                                        type="text"
                                        placeholder="nome-da-loja"
                                        style={{ ...inputStyle, paddingLeft: '80px' }}
                                        value={settings.catalog_slug || ""}
                                        onChange={e => setSettings({ ...settings, catalog_slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '') })}
                                    />
                                </div>
                                <p style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '0.5rem' }}>Use apenas letras, números e hífens.</p>
                            </div>
                            <div>
                                <label style={labelStyle}>WhatsApp Consultas</label>
                                <input
                                    type="text"
                                    placeholder="5511999999999"
                                    style={inputStyle}
                                    value={settings.whatsapp_number || ""}
                                    onChange={e => setSettings({ ...settings, whatsapp_number: e.target.value })}
                                />
                            </div>
                        </div>

                        {settings.catalog_active && settings.catalog_slug && (
                            <div style={{
                                background: 'rgba(167, 139, 250, 0.1)',
                                border: '1px dashed rgba(167, 139, 250, 0.3)',
                                borderRadius: '12px',
                                padding: '1rem',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between'
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <Link2 size={18} color="#a78bfa" />
                                    <span style={{ color: '#a78bfa', fontSize: '0.9rem', fontWeight: 600 }}>
                                        {window.location.protocol}//{window.location.host}/catalog/{settings.catalog_slug}
                                    </span>
                                </div>
                                <Button
                                    onClick={() => {
                                        const url = `${window.location.protocol}//${window.location.host}/catalog/${settings.catalog_slug}`;
                                        navigator.clipboard.writeText(url);
                                        alert("Link copiado!");
                                    }}
                                    style={{ background: 'rgba(167, 139, 250, 0.2)', color: '#a78bfa', border: 'none', padding: '6px 12px', fontSize: '0.8rem' }}
                                >
                                    <Copy size={14} style={{ marginRight: '4px' }} /> Copiar
                                </Button>
                            </div>
                        )}
                    </div>

                    {/* Documents */}
                    <div>
                        <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'white', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <FileText size={20} color="#f59e0b" /> Recibos e Orçamentos
                        </h3>
                        <div>
                            <label style={labelStyle}>Texto do Rodapé</label>
                            <input type="text" placeholder="Obrigado pela preferência!" style={inputStyle} value={settings.footer_text} onChange={e => setSettings({ ...settings, footer_text: e.target.value })} />
                            <p style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '0.5rem' }}>Aparece no final dos recibos impressos.</p>
                        </div>
                    </div>

                    <Button
                        onClick={handleSave}
                        disabled={saving}
                        style={{
                            width: '100%', marginTop: '1rem', height: '50px', fontSize: '1.1rem', fontWeight: 700,
                            background: 'linear-gradient(90deg, #10b981, #059669)', boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)'
                        }}
                    >
                        {saving ? "Salvando..." : (
                            <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <Save size={20} /> Salvar Configurações
                            </span>
                        )}
                    </Button>

                </div>
            </div>
        </div>
    );
}
