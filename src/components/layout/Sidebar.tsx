"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { usePermissions } from "@/hooks/usePermissions";

export function Sidebar() {
    const pathname = usePathname();
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
        { label: "Produtos", href: "/dashboard/products", icon: "📦", show: can_manage_products },
        { label: "Serviços", href: "/dashboard/services", icon: "🛠️", show: can_manage_products },
        { label: "Vendas", href: "/dashboard/sales", icon: "💰", show: can_sell },
        { label: "Estoque", href: "/dashboard/inventory", icon: "🏭", show: can_manage_products }, // Inventory usually goes with products
        { label: "Clientes", href: "/dashboard/clients", icon: "👥", show: true }, // Everyone usually can see clients? Or maybe 'can_sell'
        { label: "Financeiro", href: "/dashboard/financial", icon: "💵", show: can_view_reports }, // Using reports permission for now, or create new one
        { label: "Funcionários", href: "/dashboard/employees", icon: "👔", show: can_manage_settings }, // Restricted to settings managers
        { label: "Relatórios", href: "/dashboard/reports", icon: "📈", show: can_view_reports },
        { label: "Configurações", href: "/dashboard/settings", icon: "⚙️", show: can_manage_settings },
    ];

    if (loading) return null; // Or a skeleton

    return (
        <aside
            className="glass-panel"
            style={{
                width: "250px",
                height: "100vh",
                position: "fixed",
                left: 0,
                top: 0,
                display: "flex",
                flexDirection: "column",
                padding: "2rem 1rem",
                borderRadius: "0 var(--radius-md) var(--radius-md) 0",
                borderLeft: "none",
                zIndex: 50,
            }}
        >
            <div style={{ marginBottom: "2rem", paddingLeft: "0", display: 'flex', justifyContent: 'center' }}>
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

            <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '1rem' }}>
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
                        background: "transparent",
                        border: "none",
                        cursor: "pointer",
                        fontWeight: 500,
                        transition: "all 0.2s" // Added simple hover effect later or relies on glass panel
                    }}
                >
                    <span>🚪</span>
                    Sair
                </button>
            </div>
        </aside>
    );
}
