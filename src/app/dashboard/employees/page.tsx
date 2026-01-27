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

    const headerCellStyle = {
        padding: '1.5rem 2rem',
        textAlign: 'left' as const,
        fontSize: '0.75rem',
        fontWeight: 700,
        color: '#9ca3af',
        textTransform: 'uppercase' as const,
        letterSpacing: '0.05em',
        borderBottom: '1px solid rgba(255,255,255,0.05)'
    };

    const cellStyle = {
        padding: '2rem 2rem',
        color: 'white',
        verticalAlign: 'middle'
    };

    return (
        <div style={{ maxWidth: '1400px', margin: '0 auto', paddingBottom: '4rem', animation: 'fadeIn 0.6s ease' }}>
            {/* Header Section */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                    <h1 style={{ fontSize: '2.5rem', fontWeight: 800, background: 'linear-gradient(to right, white, #9ca3af)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', margin: 0 }}>
                        Funcionários
                    </h1>
                    <p style={{ color: '#9ca3af', marginTop: '0.5rem', fontSize: '1rem' }}>Gerencie sua equipe.</p>
                </div>
                <Link href="/dashboard/employees/new">
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
                        Novo Funcionário
                    </Button>
                </Link>
            </div>

            {/* Search Bar */}
            <div style={{
                ...glassStyle,
                marginBottom: '2rem',
                padding: '1rem',
                display: 'flex',
                alignItems: 'center',
                maxWidth: '500px'
            }}>
                <Search style={{ color: '#9ca3af', marginRight: '1rem' }} size={20} />
                <input
                    type="text"
                    placeholder="Buscar por nome ou cargo..."
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
                    <p>Carregando funcionários...</p>
                </div>
            ) : (
                <div style={{ ...glassStyle, padding: 0, overflow: 'hidden' }}>
                    <div className="table-responsive">
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr>
                                    <th style={headerCellStyle}>Nome</th>
                                    <th style={headerCellStyle}>Cargo / Status</th>
                                    <th style={headerCellStyle}>Contato</th>
                                    <th style={{ ...headerCellStyle, textAlign: 'right' }}>Ações</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredEmployees.map((employee) => (
                                    <tr key={employee.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)', transition: 'background 0.2s' }}
                                        onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
                                        onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
                                    >
                                        <td style={cellStyle}>
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
                                        <td style={cellStyle}>
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
                                        <td style={cellStyle}>
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
                                        <td style={{ ...cellStyle, textAlign: 'right' }}>
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
                </div>
            )}
        </div>
    );
}
