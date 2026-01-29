"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import { Plus, Edit, Trash2, Search, Package } from "lucide-react";
import { useRouter } from "next/navigation";
import { usePermissions } from "@/hooks/usePermissions";

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
    const supabase = createClient();
    const router = useRouter();

    // Use permissions hook
    const { can_manage_products, loading: permissionsLoading } = usePermissions();

    useEffect(() => {
        fetchProducts();
    }, []);

    async function fetchProducts() {
        try {
            const { data, error } = await supabase
                .from("products")
                .select("*, product_variants(id, stock_quantity)")
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
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                    <h1 style={{ fontSize: '2.5rem', fontWeight: 800, background: 'linear-gradient(to right, white, #9ca3af)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', margin: 0 }}>
                        Produtos
                    </h1>
                    <p style={{ color: '#9ca3af', marginTop: '0.5rem', fontSize: '1rem' }}>Gerencie seu catálogo de produtos e estoque.</p>
                </div>
                {can_manage_products && (
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
                )}
            </div>

            {/* Search Bar */}
            <div style={{
                ...glassStyle,
                marginBottom: '2rem',
                padding: '1rem',
                display: 'flex',
                alignItems: 'center',
                width: '100%',
                maxWidth: '500px'
            }}>
                <Search style={{ color: '#9ca3af', marginRight: '1rem' }} size={20} />
                <input
                    type="text"
                    placeholder="Buscar por nome, categoria ou código..."
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
                                    <div key={product.id} className="mobile-card" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', padding: '1rem' }}>
                                        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
                                            <div style={{
                                                width: '64px', height: '64px', borderRadius: '8px', overflow: 'hidden', background: 'rgba(0,0,0,0.3)', flexShrink: 0,
                                                display: 'flex', alignItems: 'center', justifyContent: 'center'
                                            }}>
                                                {product.image_url ? (
                                                    <img src={product.image_url} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                ) : (
                                                    <Package size={24} color="#6b7280" />
                                                )}
                                            </div>
                                            <div style={{ flex: 1, minWidth: 0 }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                                    <h3 style={{ fontWeight: 700, fontSize: '1rem', color: 'white', margin: 0, marginBottom: '0.25rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{product.name}</h3>
                                                    <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#34d399', background: 'rgba(16, 185, 129, 0.1)', padding: '2px 6px', borderRadius: '4px' }}>Ativo</span>
                                                </div>
                                                <div style={{ color: '#9ca3af', fontSize: '0.85rem' }}>{product.category || 'Geral'}</div>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.5rem' }}>
                                                    <span style={{ fontWeight: 700, color: '#34d399', fontSize: '1.1rem' }}>R$ {product.price.toFixed(2)}</span>
                                                    <span style={{ fontSize: '0.85rem', color: '#d1d5db' }}>{totalStock} un</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                                            {can_manage_products && (
                                                <>
                                                    <Link href={`/dashboard/products/${product.id}`} style={{ flex: 1 }}>
                                                        <Button style={{ width: '100%', background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6', border: '1px solid rgba(59, 130, 246, 0.2)', padding: '8px', height: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                                                            <Edit size={16} /> Editar
                                                        </Button>
                                                    </Link>
                                                    <Button
                                                        onClick={() => handleDelete(product.id)}
                                                        style={{ flex: 1, background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.2)', padding: '8px', height: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
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
