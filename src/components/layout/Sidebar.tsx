"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { createClient } from "@/lib/supabase/client";
import { usePermissions } from "@/hooks/usePermissions";

import { X } from "lucide-react";

export function Sidebar({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
    const pathname = usePathname();
    const { user } = useAuth();
    const {
        can_manage_products,
        can_sell,
        can_view_reports,
        can_manage_settings,
        loading
    } = usePermissions();

    const handleLogout = async () => {
        const supabase = createClient();
        await supabase.auth.signOut();
        // Redirect to main login page or landing page
        window.location.href = "/login";
    };

    const menuItems = [
        { label: "Visão Geral", href: "/dashboard", icon: "📊", show: true },
        { label: "Vendas", href: "/dashboard/sales", icon: "💰", show: can_sell },
        { label: "Produtos", href: "/dashboard/products", icon: "📦", show: can_manage_products },
        { label: "Serviços", href: "/dashboard/services", icon: "🛠️", show: can_manage_products },
        { label: "Calculadora", href: "/dashboard/calculator", icon: "🧮", show: can_manage_products },
        { label: "Estoque", href: "/dashboard/inventory", icon: "🏭", show: can_manage_products }, // Inventory usually goes with products
        { label: "Clientes", href: "/dashboard/clients", icon: "👥", show: true }, // Everyone usually can see clients? Or maybe 'can_sell'
        { label: "Financeiro", href: "/dashboard/financial", icon: "💵", show: can_view_reports }, // Using reports permission for now, or create new one
        { label: "Funcionários", href: "/dashboard/employees", icon: "👔", show: can_manage_settings }, // Restricted to settings managers
        { label: "Relatórios", href: "/dashboard/reports", icon: "📈", show: can_view_reports },
        { label: "Configurações", href: "/dashboard/settings", icon: "⚙️", show: can_manage_settings },
    ];

    if (loading) return null; // Or a skeleton

    return (
        <>
            {/* Mobile Overlay */}
            <div
                className={`dashboard-overlay ${isOpen ? "open" : ""}`}
                onClick={onClose}
            />

            <aside
                className={`dashboard-sidebar glass-panel ${isOpen ? "open" : ""}`}
                style={{
                    display: "flex",
                    flexDirection: "column",
                    padding: "2rem 1rem",
                    borderRadius: "0 var(--radius-md) var(--radius-md) 0",
                    borderLeft: "none",
                }}
            >
                <div style={{ marginBottom: "2rem", paddingLeft: "0", display: 'flex', justifyContent: 'center', position: 'relative' }}>

                    {/* Close Button (Mobile Only) */}
                    <button
                        onClick={onClose}
                        className="mobile-only"
                        style={{
                            position: 'absolute',
                            top: '-10px',
                            right: '-10px',
                            background: 'transparent',
                            border: 'none',
                            color: 'var(--color-text-muted)',
                            cursor: 'pointer'
                        }}
                    >
                        <X size={24} />
                    </button>

                    <div style={{ width: '220px', filter: 'brightness(1.1)' }}>
                        <img
                            src="/nc-nexus-logo.png"
                            alt="NC Nexus"
                            style={{ width: '100%', height: 'auto' }}
                        />
                    </div>
                </div>

                <nav style={{ display: "flex", flexDirection: "column", gap: "0.5rem", flex: 1 }}>
                    {menuItems.filter(item => item.show).map((item) => {
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                onClick={() => window.innerWidth < 768 && onClose()} // Auto-close on mobile nav
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "1rem",
                                    padding: "0.75rem 1rem",
                                    borderRadius: "var(--radius-sm)",
                                    color: isActive ? "white" : "var(--color-text-muted)",
                                    background: isActive ? "var(--color-primary-glow)" : "transparent",
                                    fontWeight: isActive ? 600 : 400,
                                    transition: "all 0.2s",
                                    border: isActive ? "1px solid var(--color-primary)" : "1px solid transparent",
                                }}
                            >
                                <span>{item.icon}</span>
                                {item.label}
                            </Link>
                        );
                    })}
                </nav>

                <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '1.5rem', marginTop: '1rem' }}>
                    <div style={{ padding: "0 1rem 1rem 1rem" }}>
                        <p style={{ fontSize: "0.875rem", fontWeight: 600, color: "var(--color-text-main)", overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {user?.email}
                        </p>
                        <p style={{ fontSize: "0.75rem", color: "var(--color-text-muted)" }}>
                            Administrador
                        </p>
                    </div>

                    <button
                        onClick={handleLogout}
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "1rem",
                            padding: "0.75rem 1rem",
                            width: "100%",
                            borderRadius: "var(--radius-sm)",
                            color: "#ef4444",
                            background: "rgba(239, 68, 68, 0.1)",
                            border: "1px solid rgba(239, 68, 68, 0.2)",
                            cursor: "pointer",
                            fontWeight: 500,
                            transition: "all 0.2s"
                        }}
                    >
                        <span>🚪</span>
                        Sair
                    </button>
                </div>
            </aside>
        </>
    );
}
