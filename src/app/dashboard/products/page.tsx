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
        padding: '2rem 2rem', // Espaçamento Bem Longo (32px)
        color: 'white',
        verticalAlign: 'middle'
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
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr>
                                    <th style={headerCellStyle}>Produto</th>
                                    <th style={headerCellStyle}>Preço</th>
                                    <th style={headerCellStyle}>Estoque</th>
                                    <th style={headerCellStyle}>Status</th>
                                    <th style={{ ...headerCellStyle, textAlign: 'right' }}>Ações</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredProducts.map((product) => {
                                    // Calculate Total Stock (Variants + Main)
                                    const totalStock = product.product_variants && product.product_variants.length > 0
                                        ? product.product_variants.reduce((acc, v) => acc + v.stock_quantity, 0)
                                        : product.stock_quantity || 0;

                                    return (
                                        <tr key={product.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)', transition: 'background 0.2s' }}
                                            onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
                                            onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
                                        >
                                            <td style={cellStyle}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                                                    <div style={{
                                                        width: '80px', height: '80px', borderRadius: '12px',
                                                        background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.05)',
                                                        display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', flexShrink: 0
                                                    }}>
                                                        {product.image_url ? (
                                                            <img src={product.image_url} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.9 }} />
                                                        ) : (
                                                            <Package style={{ color: '#4b5563' }} size={32} />
                                                        )}
                                                    </div>
                                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                                        <span style={{ fontSize: '1.25rem', fontWeight: 700, color: 'white' }}>{product.name}</span>
                                                        <span style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.4)', maxWidth: '300px', lineHeight: '1.4', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                                                            {product.description || "Sem descrição disponível."}
                                                        </span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td style={cellStyle}>
                                                <span style={{ fontFamily: 'monospace', fontSize: '1.25rem', fontWeight: 600, color: '#e5e7eb' }}>
                                                    {new Intl.NumberFormat("pt-BR", {
                                                        style: "currency",
                                                        currency: "BRL",
                                                    }).format(product.price)}
                                                </span>
                                            </td>
                                            <td style={cellStyle}>
                                                <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.25rem' }}>
                                                    <span style={{ fontSize: '1.25rem', fontWeight: 600, color: '#d1d5db' }}>{totalStock}</span>
                                                    <span style={{ fontSize: '0.875rem', color: '#6b7280' }}>un</span>
                                                </div>
                                            </td>
                                            <td style={cellStyle}>
                                                <span style={{
                                                    padding: '6px 16px', borderRadius: '99px', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em',
                                                    border: totalStock > 10 ? '1px solid rgba(16, 185, 129, 0.3)' : totalStock > 0 ? '1px solid rgba(245, 158, 11, 0.3)' : '1px solid rgba(239, 68, 68, 0.3)',
                                                    background: totalStock > 10 ? 'rgba(16, 185, 129, 0.1)' : totalStock > 0 ? 'rgba(245, 158, 11, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                                                    color: totalStock > 10 ? '#34d399' : totalStock > 0 ? '#fbbf24' : '#f87171'
                                                }}>
                                                    {totalStock > 10 ? 'Disponível' : totalStock > 0 ? 'Baixo Estoque' : 'Esgotado'}
                                                </span>
                                            </td>
                                            <td style={{ ...cellStyle, textAlign: 'right' }}>
                                                {can_manage_products && (
                                                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                                                        <Button
                                                            onClick={() => router.push(`/dashboard/products/${product.id}`)}
                                                            style={{ width: '40px', height: '40px', padding: 0, borderRadius: '8px', background: 'rgba(255,255,255,0.05)', color: '#d1d5db', border: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                                            title="Editar"
                                                        >
                                                            <Edit size={18} />
                                                        </Button>
                                                        <Button
                                                            onClick={() => handleDelete(product.id)}
                                                            style={{ width: '40px', height: '40px', padding: 0, borderRadius: '8px', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                                            title="Excluir"
                                                        >
                                                            <Trash2 size={18} />
                                                        </Button>
                                                    </div>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>

                        {filteredProducts.length === 0 && (
                            <div style={{ padding: '4rem', textAlign: 'center' }}>
                                <div style={{ width: '4rem', height: '4rem', background: 'rgba(255,255,255,0.05)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem auto' }}>
                                    <Package style={{ color: '#4b5563' }} size={32} />
                                </div>
                                <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'white', marginBottom: '0.5rem' }}>Nenhum produto encontrado</h3>
                                <p style={{ color: '#9ca3af', marginBottom: '2rem' }}>Comece adicionando seu primeiro produto ao estoque.</p>
                                {can_manage_products && (
                                    <Link href="/dashboard/products/new">
                                        <Button style={{ background: 'transparent', border: '1px solid var(--color-primary)', color: 'var(--color-primary)' }}>
                                            Adicionar Produto
                                        </Button>
                                    </Link>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
