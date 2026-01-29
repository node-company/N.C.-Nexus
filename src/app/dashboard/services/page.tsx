"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import { Plus, Edit, Trash2, Search, Briefcase, Clock } from "lucide-react";
import { useRouter } from "next/navigation";

interface Service {
    id: string;
    name: string;
    description: string;
    price: number;
    duration_minutes: number;
    image_url?: string;
    active: boolean;
}

export default function ServicesPage() {
    const [services, setServices] = useState<Service[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const supabase = createClient();
    const router = useRouter();
    const can_manage_services = true;

    useEffect(() => {
        fetchServices();
    }, []);

    async function fetchServices() {
        try {
            const { data, error } = await supabase
                .from("services")
                .select("*")
                .order("created_at", { ascending: false });

            if (error) {
                if (error.code !== 'PGRST205') throw error;
            }
            setServices(data || []);
        } catch (error) {
            console.error("Error fetching services:", error);
        } finally {
            setLoading(false);
        }
    }

    async function handleDelete(id: string) {
        if (!confirm("Tem certeza que deseja excluir este serviço?")) return;

        try {
            const { error } = await supabase.from("services").delete().eq("id", id);
            if (error) throw error;
            setServices(services.filter((s) => s.id !== id));
        } catch (error) {
            console.error("Error deleting service:", error);
            alert("Erro ao excluir serviço");
        }
    }

    const filteredServices = services.filter(service =>
        service.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Standardized Inline Styles
    const glassStyle = {
        background: 'rgba(255, 255, 255, 0.03)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        backdropFilter: 'blur(12px)',
        borderRadius: '16px',
    };

    return (
        <div style={{ maxWidth: '1400px', margin: '0 auto', paddingBottom: '4rem', animation: 'fadeIn 0.6s ease' }}>
            {/* Header Section */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                    <h1 style={{ fontSize: '2.5rem', fontWeight: 800, background: 'linear-gradient(to right, white, #9ca3af)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', margin: 0 }}>
                        Serviços
                    </h1>
                    <p style={{ color: '#9ca3af', marginTop: '0.5rem', fontSize: '1rem' }}>Gerencie seu catálogo de serviços.</p>
                </div>
                {can_manage_services && (
                    <Link href="/dashboard/services/new">
                        <Button style={{
                            background: 'linear-gradient(90deg, var(--color-primary), var(--color-accent))',
                            border: 'none',
                            padding: '12px 24px',
                            height: 'auto',
                            fontSize: '1rem',
                            fontWeight: 600,
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            boxShadow: '0 4px 14px 0 rgba(0,0,0,0.3)'
                        }}>
                            <Plus size={20} />
                            Novo Serviço
                        </Button>
                    </Link>
                )}
            </div>

            {/* Search Bar */}
            <div style={{
                ...glassStyle,
                marginBottom: '2rem',
                padding: '1rem',
                display: 'flex',
                alignItems: 'center',
                width: '100%', // Added width: '100%'
                maxWidth: '500px'
            }}>
                <Search style={{ color: '#9ca3af', marginRight: '1rem' }} size={20} />
                <input
                    type="text"
                    placeholder="Buscar por nome ou descrição..."
                    style={{
                        background: 'transparent',
                        border: 'none',
                        outline: 'none',
                        color: 'white',
                        width: '100%',
                        fontSize: '1rem'
                    }}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            {/* Content Area */}
            {loading ? (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '5rem', color: '#6b7280' }}>
                    <div style={{ width: '3rem', height: '3rem', border: '3px solid rgba(255,255,255,0.1)', borderTopColor: 'var(--color-primary)', borderRadius: '50%', animation: 'spin 1s linear infinite', marginBottom: '1rem' }}></div>
                    <p>Carregando catálogo...</p>
                </div>
            ) : (
                <div style={{ ...glassStyle, padding: 0, overflow: 'hidden' }}>

                    {/* Desktop Table View */}
                    <div className="desktop-table-view desktop-only">
                        <div className="table-responsive">
                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                <thead>
                                    <tr>
                                        <th className="responsive-table-header">Serviço</th>
                                        <th className="responsive-table-header">Preço</th>
                                        <th className="responsive-table-header">Duração</th>
                                        <th className="responsive-table-header">Status</th>
                                        <th className="responsive-table-header" style={{ textAlign: 'right' }}>Ações</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredServices.map((service) => (
                                        <tr key={service.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)', transition: 'background 0.2s' }}
                                            onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
                                            onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
                                        >
                                            <td className="responsive-table-cell">
                                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                                                    <span style={{ fontSize: '1.25rem', fontWeight: 700, color: 'white' }}>{service.name}</span>
                                                    <span style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.4)', maxWidth: '300px', lineHeight: '1.4', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                                                        {service.description || "Sem descrição."}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="responsive-table-cell">
                                                <span style={{ fontFamily: 'monospace', fontSize: '1.25rem', fontWeight: 600, color: '#e5e7eb' }}>
                                                    {new Intl.NumberFormat("pt-BR", {
                                                        style: "currency",
                                                        currency: "BRL",
                                                    }).format(service.price)}
                                                </span>
                                            </td>
                                            <td className="responsive-table-cell">
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#d1d5db' }}>
                                                    <Clock size={16} />
                                                    <span>{service.duration_minutes} min</span>
                                                </div>
                                            </td>
                                            <td className="responsive-table-cell">
                                                <span style={{
                                                    padding: '6px 12px', borderRadius: '8px', fontSize: '0.85rem', fontWeight: 500,
                                                    background: service.active ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                                                    color: service.active ? '#34d399' : '#ef4444',
                                                    border: service.active ? '1px solid rgba(16, 185, 129, 0.2)' : '1px solid rgba(239, 68, 68, 0.2)'
                                                }}>
                                                    {service.active ? "Ativo" : "Inativo"}
                                                </span>
                                            </td>
                                            <td className="responsive-table-cell" style={{ textAlign: 'right' }}>
                                                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                                                    <Button
                                                        onClick={() => router.push(`/dashboard/services/${service.id}`)}
                                                        style={{ width: '40px', height: '40px', padding: 0, borderRadius: '8px', background: 'rgba(255,255,255,0.05)', color: '#d1d5db', border: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                                        title="Editar"
                                                    >
                                                        <Edit size={18} />
                                                    </Button>
                                                    <Button
                                                        onClick={() => handleDelete(service.id)}
                                                        style={{ width: '40px', height: '40px', padding: 0, borderRadius: '8px', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                                        title="Excluir"
                                                    >
                                                        <Trash2 size={18} />
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Mobile Card View */}
                    <div className="mobile-card-view mobile-only">
                        <div style={{ padding: '1rem' }}>
                            {filteredServices.map((service) => (
                                <div key={service.id} className="mobile-card">
                                    <div style={{ display: 'flex', gap: '1rem', marginBottom: '0.5rem', alignItems: 'center', justifyContent: 'space-between' }}>
                                        <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'white' }}>{service.name}</div>
                                        <div style={{
                                            fontSize: '0.85rem',
                                            padding: '2px 8px',
                                            borderRadius: '4px',
                                            background: service.active ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                                            color: service.active ? '#34d399' : '#ef4444'
                                        }}>
                                            {service.active ? "Ativo" : "Inativo"}
                                        </div>
                                    </div>
                                    <div style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.5)', marginBottom: '1rem', lineHeight: '1.4' }}>
                                        {service.description || "Sem descrição."}
                                    </div>

                                    <div className="mobile-card-row">
                                        <span className="mobile-card-label">Preço</span>
                                        <span className="mobile-card-value" style={{ fontFamily: 'monospace', fontSize: '1.1rem' }}>
                                            {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(service.price)}
                                        </span>
                                    </div>

                                    <div className="mobile-card-row">
                                        <span className="mobile-card-label">Duração</span>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'white' }}>
                                            <Clock size={16} />
                                            <span>{service.duration_minutes} min</span>
                                        </div>
                                    </div>

                                    <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                                        <Button
                                            onClick={() => router.push(`/dashboard/services/${service.id}`)}
                                            style={{ flex: 1, height: '36px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                                        >
                                            <Edit size={16} /> Editar
                                        </Button>
                                        <Button
                                            onClick={() => handleDelete(service.id)}
                                            style={{ flex: 1, height: '36px', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', color: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                                        >
                                            <Trash2 size={16} /> Excluir
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {filteredServices.length === 0 && (
                        <div style={{ padding: '4rem', textAlign: 'center' }}>
                            <div style={{ width: '4rem', height: '4rem', background: 'rgba(255,255,255,0.05)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem auto' }}>
                                <Briefcase style={{ color: '#4b5563' }} size={32} />
                            </div>
                            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'white', marginBottom: '0.5rem' }}>Nenhum serviço encontrado</h3>
                            <p style={{ color: '#9ca3af', marginBottom: '2rem' }}>Comece adicionando seu primeiro serviço.</p>
                            <Link href="/dashboard/services/new">
                                <Button style={{ background: 'transparent', border: '1px solid var(--color-primary)', color: 'var(--color-primary)' }}>
                                    Adicionar Serviço
                                </Button>
                            </Link>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
