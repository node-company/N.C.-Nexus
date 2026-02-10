"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import { Plus, Edit, Trash2, Search, Package } from "lucide-react";
import { useRouter } from "next/navigation";
import { usePermissions } from "@/hooks/usePermissions";
import { useAuth } from "@/context/AuthContext";

interface Product {
    id: string;
    name: string;
    description: string;
    price: number;
    stock_quantity: number;
    category?: string;
    image_url?: string;
    product_variants?: { id: string; stock_quantity: number }[];
}

export default function ProductsPage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const { user } = useAuth();
    const supabase = createClient();
    const router = useRouter();

    // Use permissions hook
    const { can_manage_products, loading: permissionsLoading } = usePermissions();

    useEffect(() => {
        if (user) {
            fetchProducts();
        }
    }, [user]);

    async function fetchProducts() {
        try {
            if (!user) return;
            const { data, error } = await supabase
                .from("products")
                .select("*, product_variants(id, stock_quantity)")
                .eq('user_id', user.id)
                .eq('active', true) // Filter active products
                .order("created_at", { ascending: false });

            if (error) {
                if (error.code !== 'PGRST205') throw error;
            }
            setProducts(data || []);
        } catch (error) {
            console.error("Error fetching products:", error);
        } finally {
            setLoading(false);
        }
    }

    async function handleDelete(id: string) {
        if (!confirm("Tem certeza que deseja excluir este produto?")) return;

        try {
            // 1. Encontrar o produto para pegar a URL da imagem
            const productToDelete = products.find(p => p.id === id);

            // 2. Se tiver imagem, deletar do Storage
            if (productToDelete?.image_url) {
                const fileName = productToDelete.image_url.split('/').pop();
                if (fileName) {
                    await supabase.storage
                        .from("company-images")
                        .remove([fileName]);
                    console.log("Imagem deletada do storage:", fileName);
                }
            }

            // 3. Soft Delete (Marcar como inativo)
            const { error } = await supabase
                .from("products")
                .update({ active: false, image_url: null })
                .eq("id", id);

            if (error) throw error;

            setProducts(products.filter((p) => p.id !== id));
        } catch (error) {
            console.error("Error deleting product:", error);
            alert("Erro ao excluir produto. Verifique se existem pendências.");
        }
    }

    const filteredProducts = products.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase())
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
            {/* Header Section */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                    <h1 className="responsive-title" style={{ fontWeight: 800, background: 'linear-gradient(to right, white, #9ca3af)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', margin: 0 }}>
                        Produtos
                    </h1>
                    <p style={{ color: '#9ca3af', marginTop: '0.25rem', fontSize: '0.95rem' }}>Gerencie seu catálogo de produtos e estoque.</p>
                </div>
                {can_manage_products && (
                    <div className="desktop-only">
                        <Link href="/dashboard/products/new">
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
                                Novo Produto
                            </Button>
                        </Link>
                    </div>
                )}
            </div>

            {/* Mobile FAB */}
            {can_manage_products && (
                <div className="mobile-only" style={{ position: 'fixed', bottom: '2rem', right: '1.5rem', zIndex: 100 }}>
                    <Link href="/dashboard/products/new">
                        <button style={{
                            width: '60px',
                            height: '60px',
                            borderRadius: '50%',
                            background: 'linear-gradient(135deg, var(--color-primary), var(--color-accent))',
                            border: 'none',
                            color: 'white',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4), 0 0 15px var(--color-primary-glow)',
                            cursor: 'pointer',
                            transition: 'transform 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
                        }}
                            onMouseDown={(e) => e.currentTarget.style.transform = 'scale(0.9) rotate(-10deg)'}
                            onMouseUp={(e) => e.currentTarget.style.transform = 'scale(1) rotate(0)'}
                        >
                            <Plus size={32} strokeWidth={2.5} />
                        </button>
                    </Link>
                </div>
            )}

            {/* Search Bar */}
            {/* Search Bar */}
            <div className="mobile-full-width" style={{
                ...glassStyle,
                marginBottom: '2rem',
                padding: '0.875rem 1.25rem',
                display: 'flex',
                alignItems: 'center',
                width: '100%',
                maxWidth: '500px'
            }}>
                <Search style={{ color: '#9ca3af', marginRight: '0.75rem' }} size={18} />
                <input
                    type="text"
                    placeholder="Buscar produtos..."
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
            {loading || permissionsLoading ? (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '5rem', color: '#6b7280' }}>
                    <div style={{ width: '3rem', height: '3rem', border: '3px solid rgba(255,255,255,0.1)', borderTopColor: 'var(--color-primary)', borderRadius: '50%', animation: 'spin 1s linear infinite', marginBottom: '1rem' }}></div>
                    <p>Carregando catálogo...</p>
                </div>
            ) : (
                <div style={{ ...glassStyle, padding: 0, overflow: 'hidden' }}>

                    {/* Desktop Table View */}
                    <div className="desktop-only" style={{ overflowX: 'auto' }}>
                        <div className="table-responsive">
                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                <thead>
                                    <tr>
                                        <th className="responsive-table-header">Produto</th>
                                        <th className="responsive-table-header">Preço</th>
                                        <th className="responsive-table-header">Estoque</th>
                                        <th className="responsive-table-header">Status</th>
                                        <th className="responsive-table-header" style={{ textAlign: 'right' }}>Ações</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredProducts.map((product) => {
                                        const totalStock = product.product_variants && product.product_variants.length > 0
                                            ? product.product_variants.reduce((acc, v) => acc + v.stock_quantity, 0)
                                            : product.stock_quantity || 0;

                                        return (
                                            <tr key={product.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)', transition: 'background 0.2s' }}
                                                onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
                                                onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
                                            >
                                                <td className="responsive-table-cell">
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                                                        <div style={{
                                                            width: '80px', height: '80px', borderRadius: '12px',
                                                            background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.05)',
                                                            display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', flexShrink: 0
                                                        }}>
                                                            {product.image_url ? (
                                                                <img src={product.image_url} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.9 }} />
                                                            ) : (
                                                                <Package size={32} color="#6b7280" />
                                                            )}
                                                        </div>
                                                        <div>
                                                            <div style={{ fontWeight: 600, fontSize: '1.1rem', color: 'white' }}>{product.name}</div>
                                                            <div style={{ color: '#9ca3af', fontSize: '0.9rem' }}>{product.category || 'Geral'}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="responsive-table-cell" style={{ fontSize: '1.1rem', fontWeight: 600, color: '#34d399' }}>
                                                    R$ {product.price.toFixed(2)}
                                                </td>
                                                <td className="responsive-table-cell" style={{ color: '#d1d5db' }}>
                                                    {totalStock} un
                                                </td>
                                                <td className="responsive-table-cell">
                                                    <span style={{ padding: '4px 12px', borderRadius: '20px', background: 'rgba(16, 185, 129, 0.1)', color: '#34d399', fontSize: '0.85rem', fontWeight: 600 }}>Ativo</span>
                                                </td>
                                                <td className="responsive-table-cell" style={{ textAlign: 'right' }}>
                                                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                                                        {can_manage_products && (
                                                            <>
                                                                <Link href={`/dashboard/products/${product.id}`}>
                                                                    <Button style={{ background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6', border: 'none', padding: '8px', height: 'auto' }}>
                                                                        <Edit size={18} />
                                                                    </Button>
                                                                </Link>
                                                                <Button
                                                                    onClick={() => handleDelete(product.id)}
                                                                    style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: 'none', padding: '8px', height: 'auto' }}
                                                                >
                                                                    <Trash2 size={18} />
                                                                </Button>
                                                            </>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Mobile Card View */}
                    <div className="mobile-only mobile-card-view" style={{ padding: '1rem' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {filteredProducts.map((product) => {
                                const totalStock = product.product_variants && product.product_variants.length > 0
                                    ? product.product_variants.reduce((acc, v) => acc + v.stock_quantity, 0)
                                    : product.stock_quantity || 0;

                                return (
                                    <div key={product.id} className="mobile-card" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '14px', padding: '1rem', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
                                        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
                                            <div style={{
                                                width: '70px', height: '70px', borderRadius: '10px', overflow: 'hidden', background: 'rgba(0,0,0,0.2)', flexShrink: 0,
                                                display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(255,255,255,0.05)'
                                            }}>
                                                {product.image_url ? (
                                                    <img src={product.image_url} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                ) : (
                                                    <Package size={26} color="#4b5563" />
                                                )}
                                            </div>
                                            <div style={{ flex: 1, minWidth: 0 }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem' }}>
                                                    <h3 style={{ fontWeight: 700, fontSize: '1rem', color: 'white', margin: 0, marginBottom: '0.2rem', overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                                                        {product.name}
                                                    </h3>
                                                    <span style={{ fontSize: '0.65rem', fontWeight: 700, color: '#34d399', background: 'rgba(16, 185, 129, 0.15)', padding: '2px 8px', borderRadius: '10px', textTransform: 'uppercase', flexShrink: 0 }}>Ativo</span>
                                                </div>
                                                <div style={{ color: '#6b7280', fontSize: '0.8rem', fontWeight: 500 }}>{product.category || 'Sem categoria'}</div>
                                            </div>
                                        </div>

                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '1rem', background: 'rgba(255,255,255,0.02)', padding: '0.75rem', borderRadius: '10px' }}>
                                            <div>
                                                <span style={{ fontSize: '0.7rem', color: '#9ca3af', textTransform: 'uppercase', fontWeight: 600, display: 'block', marginBottom: '2px' }}>Preço Unitário</span>
                                                <span style={{ fontWeight: 800, color: '#34d399', fontSize: '1.25rem' }}>R$ {product.price.toFixed(2)}</span>
                                            </div>
                                            <div style={{ textAlign: 'right' }}>
                                                <span style={{ fontSize: '0.7rem', color: '#9ca3af', textTransform: 'uppercase', fontWeight: 600, display: 'block', marginBottom: '2px' }}>Estoque</span>
                                                <span style={{ fontSize: '0.95rem', color: 'white', fontWeight: 700 }}>{totalStock} <span style={{ fontSize: '0.75rem', color: '#6b7280' }}>un</span></span>
                                            </div>
                                        </div>

                                        <div style={{ display: 'flex', gap: '0.75rem' }}>
                                            {can_manage_products && (
                                                <>
                                                    <Link href={`/dashboard/products/${product.id}`} style={{ flex: 1 }}>
                                                        <Button style={{ width: '100%', background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6', border: '1px solid rgba(59, 130, 246, 0.15)', padding: '10px', height: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', fontWeight: 600, fontSize: '0.9rem' }}>
                                                            <Edit size={16} /> Editar
                                                        </Button>
                                                    </Link>
                                                    <Button
                                                        onClick={() => handleDelete(product.id)}
                                                        style={{ flex: 1, background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.15)', padding: '10px', height: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', fontWeight: 600, fontSize: '0.9rem' }}
                                                    >
                                                        <Trash2 size={16} /> Excluir
                                                    </Button>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
