"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import { Plus, Edit, Trash2, Search, User, Phone, MapPin, Briefcase, Mail } from "lucide-react";
import { useRouter } from "next/navigation";
import { usePermissions } from "@/hooks/usePermissions";

interface Employee {
    id: string;
    name: string;
    role: string;
    email?: string;
    phone?: string;
    salary?: number;
    active: boolean;
}

export default function EmployeesPage() {
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const supabase = createClient();
    const router = useRouter();
    const { can_manage_settings, loading: permissionsLoading } = usePermissions();

    useEffect(() => {
        if (!permissionsLoading && !can_manage_settings) {
            // Optional: Redirect
            // router.push("/dashboard");
        }
        fetchEmployees();
    }, [permissionsLoading, can_manage_settings]);

    if (!permissionsLoading && !can_manage_settings) {
        return (
            <div style={{ padding: '4rem', textAlign: 'center', color: '#6b7280' }}>
                <h2 style={{ color: 'white', marginBottom: '1rem' }}>Acesso Negado</h2>
                <p>Você não tem permissão para gerenciar funcionários.</p>
                <Link href="/dashboard">
                    <Button style={{ marginTop: '1rem', background: 'rgba(255,255,255,0.1)' }}>Voltar ao Painel</Button>
                </Link>
            </div>
        );
    }

    useEffect(() => {
        fetchEmployees();
    }, []);

    async function fetchEmployees() {
        try {
            const { data, error } = await supabase
                .from("employees")
                .select("*")
                .order("created_at", { ascending: false });

            if (data) setEmployees(data);
        } catch (error) {
            console.error("Error fetching employees:", error);
        } finally {
            setLoading(false);
        }
    }

    async function handleDelete(id: string) {
        if (!confirm("Tem certeza que deseja excluir este funcionário?")) return;

        try {
            const { error } = await supabase.from("employees").delete().eq("id", id);
            if (error) throw error;
            setEmployees(employees.filter((e) => e.id !== id));
        } catch (error) {
            console.error("Error deleting employee:", error);
            alert("Erro ao excluir funcionário");
        }
    }

    const filteredEmployees = employees.filter(employee =>
        employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        employee.role.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Standardized Inline Styles
    const glassStyle = {
        background: 'rgba(255, 255, 255, 0.03)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        backdropFilter: 'blur(12px)',
        borderRadius: '16px',
    };

    return (
        <div className="main-container" style={{ 
            width: '100%',
            maxWidth: '1200px', 
            margin: '0 auto', 
            paddingBottom: '5rem', 
            animation: 'fadeIn 0.6s ease',
            padding: '0', // Reset to 0, handle via dashboard-content
            boxSizing: 'border-box',
            // @ts-ignore
            '--panel-padding': '1.5rem'
        }}>
            <style jsx>{`
                * { box-sizing: border-box; }
                @media (max-width: 768px) {
                    .main-container { padding: 0 !important; overflow-x: hidden !important; }
                    div { --panel-padding: 1rem !important; }
                    .desktop-only { display: none !important; }
                    .mobile-full-width { width: 100% !important; margin-top: 1rem; }
                    .desktop-table-view { display: none !important; }
                    .mobile-card-view { 
                        display: block !important; 
                        width: auto !important;
                        padding: 0 0.5rem !important;
                        margin: 0 !important;
                    }
                    .search-container { 
                        width: auto !important;
                        margin: 0 0.5rem 2.5rem 0.5rem !important;
                    }
                    .mobile-card {
                        padding: 1rem !important;
                        width: 100% !important;
                        margin-bottom: 1rem !important;
                        box-sizing: border-box !important;
                    }
                }
                @media (min-width: 769px) {
                    .desktop-table-view { display: block !important; }
                    .mobile-card-view { display: none !important; }
                    .mobile-fab { display: none !important; }
                    .search-container { max-width: 500px !important; }
                }
            `}</style>

            {/* Header Section */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem', flexWrap: 'wrap', gap: '1rem', padding: '0 0.5rem' }}>
                <div style={{ flex: '1', minWidth: 0 }}>
                    <h1 className="responsive-title" style={{ fontWeight: 800, background: 'linear-gradient(to right, white, #9ca3af)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', margin: 0, lineHeight: 1.1 }}>
                        Funcionários
                    </h1>
                    <p style={{ color: '#9ca3af', marginTop: '0.25rem', fontSize: '1rem' }}>Gerencie sua equipe e permissões</p>
                </div>
                <Link href="/dashboard/employees/new" className="desktop-only">
                    <Button style={{
                        background: 'linear-gradient(90deg, var(--color-primary), var(--color-accent))',
                        border: 'none',
                        padding: '12px 24px',
                        height: '48px',
                        fontSize: '1rem',
                        fontWeight: 700,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        borderRadius: '12px',
                        boxShadow: '0 4px 14px 0 rgba(0,0,0,0.3)'
                    }}>
                        <Plus size={20} /> Novo Funcionário
                    </Button>
                </Link>
            </div>

            {/* Mobile FAB */}
            <Link href="/dashboard/employees/new" className="mobile-fab" style={{
                position: 'fixed', bottom: '2rem', right: '1.5rem', zIndex: 50,
                width: '60px', height: '60px', borderRadius: '50%',
                background: 'linear-gradient(135deg, var(--color-primary), var(--color-accent))',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 8px 32px rgba(0,0,0,0.4)', border: 'none', color: 'white'
            }}>
                <Plus size={28} />
            </Link>

            {/* Search Bar */}
            <div className="search-container" style={{
                ...glassStyle,
                marginBottom: '2.5rem',
                padding: '0.75rem 1.25rem',
                display: 'flex',
                alignItems: 'center',
                width: '100%',
                maxWidth: '500px',
                background: 'rgba(0,0,0,0.2)',
                boxSizing: 'border-box'
            }}>
                <Search style={{ color: '#9ca3af', marginRight: '0.75rem' }} size={18} />
                <input
                    type="text"
                    placeholder="Buscar por nome ou cargo..."
                    style={{
                        background: 'transparent',
                        border: 'none',
                        outline: 'none',
                        color: 'white',
                        flex: 1,
                        width: '0', // Allow flexbox to control width
                        minWidth: 0,
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
                    <p>Carregando funcionários...</p>
                </div>
            ) : (
                <div style={{ ...glassStyle, padding: 0, overflow: 'hidden' }}>

                    {/* Desktop Table View */}
                    <div className="desktop-table-view">
                        <div className="table-responsive">
                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                <thead>
                                    <tr>
                                        <th className="responsive-table-header">Nome</th>
                                        <th className="responsive-table-header">Cargo / Status</th>
                                        <th className="responsive-table-header">Contato</th>
                                        <th className="responsive-table-header" style={{ textAlign: 'right' }}>Ações</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredEmployees.map((employee) => (
                                        <tr key={employee.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)', transition: 'background 0.2s' }}
                                            onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
                                            onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
                                        >
                                            <td className="responsive-table-cell">
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                                                    <div style={{
                                                        width: '50px', height: '50px', borderRadius: '50%',
                                                        background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                                                        display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', flexShrink: 0
                                                    }}>
                                                        <span style={{ fontSize: '1.2rem', fontWeight: 700, color: 'white' }}>
                                                            {employee.name.charAt(0).toUpperCase()}
                                                        </span>
                                                    </div>
                                                    <span style={{ fontSize: '1.1rem', fontWeight: 600, color: 'white' }}>{employee.name}</span>
                                                </div>
                                            </td>
                                            <td className="responsive-table-cell">
                                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1rem', color: 'white' }}>
                                                        <Briefcase size={16} style={{ color: '#9ca3af' }} /> {employee.role}
                                                    </div>
                                                    <span style={{
                                                        fontSize: '0.75rem',
                                                        color: employee.active ? '#34d399' : '#ef4444',
                                                        background: employee.active ? 'rgba(52, 211, 153, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                                                        padding: '2px 8px', borderRadius: '4px', width: 'fit-content'
                                                    }}>
                                                        {employee.active ? 'Ativo' : 'Inativo'}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="responsive-table-cell">
                                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                                    {employee.email && (
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', color: '#d1d5db' }}>
                                                            <Mail size={14} style={{ color: '#4b5563' }} /> {employee.email}
                                                        </div>
                                                    )}
                                                    {employee.phone && (
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', color: '#d1d5db' }}>
                                                            <Phone size={14} style={{ color: '#4b5563' }} /> {employee.phone}
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="responsive-table-cell" style={{ textAlign: 'right' }}>
                                                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                                                    <Button
                                                        onClick={() => router.push(`/dashboard/employees/${employee.id}`)}
                                                        style={{ width: '40px', height: '40px', padding: 0, borderRadius: '8px', background: 'rgba(255,255,255,0.05)', color: '#d1d5db', border: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                                        title="Editar"
                                                    >
                                                        <Edit size={18} />
                                                    </Button>
                                                    <Button
                                                        onClick={() => handleDelete(employee.id)}
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

                    <div className="mobile-card-view">
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', width: '100%' }}>
                            {filteredEmployees.map((employee) => (
                                <div key={employee.id} className="mobile-card" style={{ 
                                    background: 'rgba(255, 255, 255, 0.02)', 
                                    border: '1px solid rgba(255, 255, 255, 0.05)', 
                                    borderRadius: '20px',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: '1.25rem',
                                    backdropFilter: 'blur(10px)',
                                    overflow: 'hidden'
                                }}>
                                    {/* Header: Avatar and Identity */}
                                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                                        <div style={{
                                            width: '56px', height: '56px', borderRadius: '50%',
                                            background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', flexShrink: 0
                                        }}>
                                            <span style={{ fontSize: '1.35rem', fontWeight: 800, color: 'white' }}>
                                                {employee.name.charAt(0).toUpperCase()}
                                            </span>
                                        </div>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', overflow: 'hidden' }}>
                                            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'white', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                {employee.name}
                                            </h3>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                <span style={{ fontSize: '0.85rem', color: '#9ca3af', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                    <Briefcase size={14} /> {employee.role}
                                                </span>
                                                <span style={{
                                                    fontSize: '0.65rem', padding: '2px 8px', borderRadius: '20px',
                                                    color: employee.active ? '#10b981' : '#ef4444',
                                                    background: employee.active ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                                                    border: '1px solid rgba(255,255,255,0.05)',
                                                    textTransform: 'uppercase', fontWeight: 800
                                                }}>
                                                    {employee.active ? 'Ativo' : 'Inativo'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Info Section */}
                                    <div style={{ 
                                        padding: '1rem', 
                                        background: 'rgba(0,0,0,0.2)', 
                                        borderRadius: '12px', 
                                        display: 'flex', 
                                        flexDirection: 'column', 
                                        gap: '0.75rem',
                                        border: '1px solid rgba(255,255,255,0.03)'
                                    }}>
                                        {employee.email && (
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.875rem', color: '#d1d5db' }}>
                                                <Mail size={16} style={{ color: '#6b7280', flexShrink: 0 }} /> 
                                                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', minWidth: 0 }}>{employee.email}</span>
                                            </div>
                                        )}
                                        {employee.phone && (
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.875rem', color: '#d1d5db' }}>
                                                <Phone size={16} style={{ color: '#6b7280', flexShrink: 0 }} /> {employee.phone}
                                            </div>
                                        )}
                                    </div>

                                    {/* Actions */}
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
                                        <button
                                            onClick={() => router.push(`/dashboard/employees/${employee.id}`)}
                                            style={{ 
                                                flex: '1',
                                                minWidth: '120px',
                                                padding: '0.85rem', 
                                                background: 'rgba(255, 255, 255, 0.05)', 
                                                border: '1px solid rgba(255, 255, 255, 0.1)', 
                                                color: 'white', 
                                                display: 'flex', 
                                                alignItems: 'center', 
                                                justifyContent: 'center', 
                                                gap: '8px', 
                                                borderRadius: '12px', 
                                                fontWeight: 700,
                                                fontSize: '0.9rem',
                                                cursor: 'pointer'
                                            }}
                                        >
                                            <Edit size={16} /> Editar
                                        </button>
                                        <button
                                            onClick={() => handleDelete(employee.id)}
                                            style={{ 
                                                flex: '1',
                                                minWidth: '120px',
                                                padding: '0.85rem', 
                                                background: 'rgba(239, 68, 68, 0.1)', 
                                                border: '1px solid rgba(239, 68, 68, 0.2)', 
                                                color: '#ef4444', 
                                                display: 'flex', 
                                                alignItems: 'center', 
                                                justifyContent: 'center', 
                                                gap: '8px', 
                                                borderRadius: '12px', 
                                                fontWeight: 700,
                                                fontSize: '0.9rem',
                                                cursor: 'pointer'
                                            }}
                                        >
                                            <Trash2 size={16} /> Excluir
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {filteredEmployees.length === 0 && (
                        <div style={{ padding: '4rem', textAlign: 'center' }}>
                            <div style={{ width: '4rem', height: '4rem', background: 'rgba(255,255,255,0.05)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem auto' }}>
                                <User style={{ color: '#4b5563' }} size={32} />
                            </div>
                            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'white', marginBottom: '0.5rem' }}>Nenhum funcionário encontrado</h3>
                            <Link href="/dashboard/employees/new">
                                <Button style={{ background: 'transparent', border: '1px solid var(--color-primary)', color: 'var(--color-primary)' }}>
                                    Adicionar Funcionário
                                </Button>
                            </Link>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
