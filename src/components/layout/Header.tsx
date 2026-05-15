import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/Button";
import { Menu } from "lucide-react";

export function Header({ onMenuClick }: { onMenuClick: () => void }) {
    const { user, signOut } = useAuth();

    return (
        <header
            className="glass-panel dashboard-header"
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

            {/* Spacer for desktop */}
            <div className="desktop-only" />

            <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                {/* User info moved to sidebar */}
            </div>
        </header>
    );
}
