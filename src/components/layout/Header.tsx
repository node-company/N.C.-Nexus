"use client";

import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/Button";

export function Header() {
    const { user, signOut } = useAuth();

    return (
        <header
            className="glass-panel"
            style={{
                height: "80px",
                display: "flex",
                alignItems: "center",
                justifyContent: "flex-end",
                padding: "0 2rem",
                marginBottom: "2rem",
                borderRadius: "var(--radius-md)",
                marginLeft: "250px", // Offset Sidebar
                width: "calc(100% - 250px)", // Resp. Width
            }}
        >
            <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                <div style={{ textAlign: "right" }}>
                    <p style={{ fontSize: "0.875rem", fontWeight: 600, color: "var(--color-text-main)" }}>
                        {user?.email}
                    </p>
                    <p style={{ fontSize: "0.75rem", color: "var(--color-text-muted)" }}>
                        Administrador
                    </p>
                </div>
                <div style={{ width: "1px", height: "30px", background: "rgba(255,255,255,0.1)" }}></div>
                <Button variant="ghost" size="sm" onClick={() => signOut()}>
                    Sair
                </Button>
            </div>
        </header>
    );
}
