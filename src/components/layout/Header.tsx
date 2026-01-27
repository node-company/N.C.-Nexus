import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/Button";
import { Menu } from "lucide-react";

export function Header({ onMenuClick }: { onMenuClick: () => void }) {
    const { user, signOut } = useAuth();

    return (
        <header
            className="glass-panel"
            style={{
                height: "80px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between", // Changed to space-between for Menu button
                padding: "0 2rem",
                marginBottom: "2rem",
                borderRadius: "var(--radius-md)",
                // marginLeft & width removed; handled by parent layout .dashboard-main
            }}
        >
            {/* Mobile Menu Button */}
            <button
                onClick={onMenuClick}
                className="mobile-only"
                style={{
                    background: 'transparent',
                    border: 'none',
                    color: 'white',
                    cursor: 'pointer',
                    display: 'flex', // ensure icon aligns
                    alignItems: 'center'
                }}
            >
                <Menu size={24} />
            </button>

            {/* Spacer for desktop to keep user info on right if menu hidden */}
            <div className="desktop-only" />

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
