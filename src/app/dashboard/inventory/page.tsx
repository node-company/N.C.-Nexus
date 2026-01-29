"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import { Search, ArrowUpCircle, ArrowDownCircle, History, X } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { usePermissions } from "@/hooks/usePermissions";

// Types
interface ProductVariant {
    id: string;
    size: string;
    stock_quantity: number;
}

interface Product {
    id: string;
    name: string;
    image_url?: string;
    product_variants: ProductVariant[];
}

interface InventoryLog {
    id: string;
    type: 'IN' | 'OUT' | 'ADJUST';
    quantity: number;
    reason: string;
    created_at: string;
    product: { name: string };
    variant?: { size: string };
}

export default function InventoryPage() {
    const supabase = createClient();
    const [products, setProducts] = useState<Product[]>([]);
    const [logs, setLogs] = useState<InventoryLog[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const { can_manage_products } = usePermissions();

    // Modal State
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [adjustmentData, setAdjustmentData] = useState({
        variantId: "",
        type: "IN" as "IN" | "OUT",
        quantity: 0,
        reason: "",
        unitCost: "",      // New: Custo unitário (Entrada)
        shippingCost: "",  // New: Frete (Entrada)
        exitValue: ""      // New: Valor de saída (Saída)
    });
    const [modalOpen, setModalOpen] = useState(false);
    const [saving, setSaving] = useState(false);

    // Initial Fetch
    useEffect(() => {
        fetchInventory();
        fetchLogs();
    }, []);

    async function fetchInventory() {
        const { data } = await supabase
            .from("products")
            .select(`
                id, name, image_url,
                product_variants (id, size, stock_quantity)
            `)
            .eq('active', true) // Filter active only
            .order("name");

        if (data) setProducts(data as any);
        setLoading(false);
    }

    async function fetchLogs() {
        const { data } = await supabase
            .from("inventory_movements")
            .select(`
                id, type, quantity, reason, created_at,
                product:products(name),
                variant:product_variants(size)
            `)
            .order("created_at", { ascending: false })
            .limit(10);

        if (data) setLogs(data as any);
    }

    // Handlers
    const openAdjustmentModal = (product: Product) => {
        setSelectedProduct(product);
        setAdjustmentData({
            variantId: product.product_variants[0]?.id || "",
            type: "IN",
            quantity: 1,
            reason: "",
            unitCost: "",
            shippingCost: "",
            exitValue: ""
        });
        setModalOpen(true);
    };

    const handleSaveAdjustment = async () => {
        if (!selectedProduct || !adjustmentData.variantId || adjustmentData.quantity <= 0) return;
        setSaving(true);

        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error("Auth error");

            const variant = selectedProduct.product_variants.find(v => v.id === adjustmentData.variantId);
            if (!variant) throw new Error("Variant not found");

            const currentStock = variant.stock_quantity;
            const change = adjustmentData.type === 'IN' ? adjustmentData.quantity : -adjustmentData.quantity;
            const newStock = currentStock + change;

            if (newStock < 0) {
                alert("Estoque não pode ficar negativo.");
                setSaving(false);
                return;
            }

            // 1. Atualizar Estoque
            const { error: updateError } = await supabase
                .from("product_variants")
                .update({ stock_quantity: newStock })
                .eq("id", adjustmentData.variantId);

            if (updateError) throw updateError;

            // 2. Criar Log de Movimentação
            const { error: logError } = await supabase
                .from("inventory_movements")
                .insert({
                    user_id: user.id,
                    product_id: selectedProduct.id,
                    variant_id: adjustmentData.variantId,
                    type: adjustmentData.type,
                    quantity: adjustmentData.quantity,
                    reason: adjustmentData.reason || "Ajuste Manual"
                });

            if (logError) throw logError;

            // 3. Integração Financeira
            const today = new Date().toISOString().split('T')[0];

            if (adjustmentData.type === 'IN') {
                const uCost = parseFloat(adjustmentData.unitCost) || 0;
                const shipping = parseFloat(adjustmentData.shippingCost) || 0;
                const totalProductCost = uCost * adjustmentData.quantity;

                // Transação do Custo dos Produtos
                if (totalProductCost > 0) {
                    await supabase.from("transactions").insert({
                        user_id: user.id,
                        description: `Compra de Estoque: ${selectedProduct.name} (${variant.size}) x${adjustmentData.quantity}`,
                        amount: totalProductCost,
                        type: 'EXPENSE',
                        category: 'Compra de Produto',
                        date: today
                    });
                }

                // Transação do Frete
                if (shipping > 0) {
                    await supabase.from("transactions").insert({
                        user_id: user.id,
                        description: `Frete Entrada Estoque: ${selectedProduct.name}`,
                        amount: shipping,
                        type: 'EXPENSE',
                        category: 'Frete',
                        date: today
                    });
                }
            } else if (adjustmentData.type === 'OUT') {
                const outValue = parseFloat(adjustmentData.exitValue) || 0;

                // Transação de Saída (Receita ou Valor Recuperado)
                if (outValue > 0) {
                    await supabase.from("transactions").insert({
                        user_id: user.id,
                        description: `Saída Estoque: ${selectedProduct.name} (${variant.size}) x${adjustmentData.quantity}`,
                        amount: outValue,
                        type: 'INCOME', // Assumindo entrada de valor (venda manual)
                        category: 'Venda Manual',
                        date: today
                    });
                }
            }

            await fetchInventory();
            await fetchLogs();
            setModalOpen(false);

        } catch (error) {
            console.error("Error adjusting stock:", error);
            alert("Erro ao ajustar estoque");
        } finally {
            setSaving(false);
        }
    };

    const filteredProducts = products.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase())
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
            {/* Header */}
            <div style={{ marginBottom: '3rem' }}>
                <h1 style={{ fontSize: '2.5rem', fontWeight: 800, background: 'linear-gradient(to right, white, #9ca3af)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', margin: 0 }}>
                    Estoque
                </h1>
                <p style={{ color: '#9ca3af', marginTop: '0.5rem', fontSize: '1rem' }}>Controle de entradas, saídas e auditoria.</p>
            </div>

            <div className="inventory-grid mobile-stack">
                {/* Left: Product List */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', width: '100%' }}>

                    {/* Search */}
                    <div style={{
                        ...glassStyle,
                        padding: '1rem',
                        display: 'flex',
                        alignItems: 'center',
                    }}>
                        <Search style={{ color: '#9ca3af', marginRight: '1rem' }} size={20} />
                        <input
                            type="text"
                            placeholder="Buscar produto..."
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

                    {/* Content */}
                    <div style={{ ...glassStyle, padding: 0, overflow: 'hidden' }}>

                        {/* Desktop Table View */}
                        <div className="desktop-table-view desktop-only">
                            <div className="table-responsive">
                                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                    <thead>
                                        <tr>
                                            <th className="responsive-table-header">Produto</th>
                                            <th className="responsive-table-header">Variações / Estoque</th>
                                            <th className="responsive-table-header" style={{ textAlign: 'right' }}>Ação</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredProducts.map((product) => (
                                            <tr key={product.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)', transition: 'background 0.2s' }}
                                                onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
                                                onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
                                            >
                                                <td className="responsive-table-cell">
                                                    <div style={{ fontSize: '1.1rem', fontWeight: 600, color: 'white' }}>{product.name}</div>
                                                    <div style={{ fontSize: '0.8rem', color: '#6b7280', marginTop: '4px' }}>ID: {product.id.slice(0, 8)}...</div>
                                                </td>
                                                <td className="responsive-table-cell">
                                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                                                        {product.product_variants && product.product_variants.length > 0 ? (
                                                            product.product_variants.map(v => (
                                                                <div key={v.id} style={{
                                                                    padding: '6px 12px', borderRadius: '8px', fontSize: '0.875rem',
                                                                    display: 'flex', alignItems: 'center', gap: '8px',
                                                                    border: v.stock_quantity > 0 ? '1px solid rgba(16, 185, 129, 0.2)' : '1px solid rgba(239, 68, 68, 0.2)',
                                                                    background: v.stock_quantity > 0 ? 'rgba(16, 185, 129, 0.05)' : 'rgba(239, 68, 68, 0.05)',
                                                                    color: v.stock_quantity > 0 ? '#34d399' : '#f87171'
                                                                }}>
                                                                    <span style={{ fontWeight: 700 }}>{v.size}</span>
                                                                    <span style={{ opacity: 0.3 }}>|</span>
                                                                    <span>{v.stock_quantity}</span>
                                                                </div>
                                                            ))
                                                        ) : (
                                                            <span style={{ color: '#6b7280', fontStyle: 'italic' }}>Sem variantes</span>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="responsive-table-cell" style={{ textAlign: 'right' }}>
                                                    {can_manage_products && (
                                                        <Button
                                                            onClick={() => openAdjustmentModal(product)}
                                                            disabled={!product.product_variants || product.product_variants.length === 0}
                                                            style={{
                                                                background: 'transparent',
                                                                border: '1px solid rgba(255,255,255,0.1)',
                                                                color: '#d1d5db',
                                                                fontSize: '0.875rem',
                                                                padding: '8px 16px'
                                                            }}
                                                        >
                                                            Ajustar
                                                        </Button>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Mobile Card View */}
                        <div className="mobile-card-view mobile-only">
                            <div style={{ padding: '1rem' }}>
                                {filteredProducts.map((product) => (
                                    <div key={product.id} className="mobile-card">
                                        <div style={{ marginBottom: '1rem' }}>
                                            <div style={{ fontSize: '1.2rem', fontWeight: 600, color: 'white' }}>{product.name}</div>
                                            <div style={{ fontSize: '0.8rem', color: '#6b7280', marginTop: '4px' }}>ID: {product.id.slice(0, 8)}...</div>
                                        </div>

                                        <div style={{ marginBottom: '1rem' }}>
                                            <span className="mobile-card-label" style={{ display: 'block', marginBottom: '0.5rem' }}>Variações / Estoque</span>
                                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                                                {product.product_variants && product.product_variants.length > 0 ? (
                                                    product.product_variants.map(v => (
                                                        <div key={v.id} style={{
                                                            padding: '6px 12px', borderRadius: '8px', fontSize: '0.875rem',
                                                            display: 'flex', alignItems: 'center', gap: '8px',
                                                            border: v.stock_quantity > 0 ? '1px solid rgba(16, 185, 129, 0.2)' : '1px solid rgba(239, 68, 68, 0.2)',
                                                            background: v.stock_quantity > 0 ? 'rgba(16, 185, 129, 0.05)' : 'rgba(239, 68, 68, 0.05)',
                                                            color: v.stock_quantity > 0 ? '#34d399' : '#f87171'
                                                        }}>
                                                            <span style={{ fontWeight: 700 }}>{v.size}</span>
                                                            <span style={{ opacity: 0.3 }}>|</span>
                                                            <span>{v.stock_quantity}</span>
                                                        </div>
                                                    ))
                                                ) : (
                                                    <span style={{ color: '#6b7280', fontStyle: 'italic' }}>Sem variantes</span>
                                                )}
                                            </div>
                                        </div>

                                        {can_manage_products && (
                                            <Button
                                                onClick={() => openAdjustmentModal(product)}
                                                disabled={!product.product_variants || product.product_variants.length === 0}
                                                style={{
                                                    width: '100%',
                                                    height: '40px',
                                                    background: 'rgba(255,255,255,0.05)',
                                                    border: '1px solid rgba(255,255,255,0.1)',
                                                    color: '#d1d5db',
                                                    fontSize: '0.9rem',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center'
                                                }}
                                            >
                                                Ajustar Estoque
                                            </Button>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {filteredProducts.length === 0 && !loading && (
                            <p style={{ padding: '3rem', textAlign: 'center', color: '#6b7280' }}>Nenhum produto encontrado.</p>
                        )}
                        {loading && (
                            <div style={{ padding: '3rem', textAlign: 'center', color: '#6b7280' }}>Carregando estoque...</div>
                        )}
                    </div>
                </div>

                {/* Right: Recent History */}
                <div>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'white', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <History size={20} style={{ color: 'var(--color-primary)' }} /> Histórico Recente
                    </h3>

                    <div style={{ ...glassStyle, padding: 0, overflow: 'hidden' }}>
                        {logs.map((log) => (
                            <div key={log.id} style={{ padding: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
                                <div style={{
                                    padding: '0.5rem', borderRadius: '50%', flexShrink: 0,
                                    background: log.type === 'IN' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                                    color: log.type === 'IN' ? '#34d399' : '#ef4444'
                                }}>
                                    {log.type === 'IN' ? <ArrowUpCircle size={20} /> : <ArrowDownCircle size={20} />}
                                </div>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.25rem' }}>
                                        <p style={{ fontSize: '0.95rem', fontWeight: 600, color: 'white', margin: 0 }}>{log.product?.name}</p>
                                        <span style={{ fontSize: '0.75rem', color: '#6b7280' }}>{format(new Date(log.created_at), "HH:mm dd/MM", { locale: ptBR })}</span>
                                    </div>
                                    <p style={{ fontSize: '0.85rem', color: '#9ca3af', margin: '0 0 0.25rem 0' }}>
                                        {log.type === 'IN' ? 'Entrada' : 'Saída'} de <span style={{ fontFamily: 'monospace', fontWeight: 700, color: 'white' }}>{log.quantity}</span> ({log.variant?.size})
                                    </p>
                                    <p style={{ fontSize: '0.8rem', color: '#6b7280', fontStyle: 'italic', margin: 0 }}>
                                        Motivo: {log.reason}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Adjustment Modal */}
            {
                modalOpen && selectedProduct && (
                    <div style={{
                        position: 'fixed', inset: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center',
                        background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(5px)'
                    }}>
                        <div style={{
                            ...glassStyle,
                            background: '#111',
                            width: '100%', maxWidth: '450px', padding: '2rem', margin: '1rem', position: 'relative',
                            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
                        }}>
                            <Button
                                onClick={() => setModalOpen(false)}
                                style={{ position: 'absolute', right: '1rem', top: '1rem', background: 'transparent', border: 'none', color: '#6b7280', cursor: 'pointer' }}
                            >
                                <X size={24} />
                            </Button>

                            <div style={{ marginBottom: '2rem' }}>
                                <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'white', marginBottom: '0.5rem' }}>Ajuste de Estoque</h2>
                                <p style={{ color: '#9ca3af' }}>{selectedProduct.name}</p>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                {/* Variant Select */}
                                <div>
                                    <label style={{ display: 'block', textTransform: 'uppercase', fontSize: '0.75rem', fontWeight: 700, color: '#6b7280', marginBottom: '0.5rem' }}>Variação</label>
                                    <select
                                        style={{
                                            width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px',
                                            padding: '12px', color: 'white', outline: 'none'
                                        }}
                                        value={adjustmentData.variantId}
                                        onChange={(e) => setAdjustmentData({ ...adjustmentData, variantId: e.target.value })}
                                    >
                                        {selectedProduct.product_variants.map(v => (
                                            <option key={v.id} value={v.id} style={{ background: '#222' }}>
                                                {v.size} (Atual: {v.stock_quantity})
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Type Select */}
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                    <label style={{
                                        cursor: 'pointer', border: '1px solid', borderRadius: '12px', padding: '1rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', transition: 'all 0.2s',
                                        borderColor: adjustmentData.type === 'IN' ? 'rgba(16, 185, 129, 0.5)' : 'rgba(255,255,255,0.1)',
                                        background: adjustmentData.type === 'IN' ? 'rgba(16, 185, 129, 0.1)' : 'transparent',
                                        color: adjustmentData.type === 'IN' ? '#34d399' : '#6b7280'
                                    }} onClick={() => setAdjustmentData({ ...adjustmentData, type: 'IN' })}>
                                        <input type="radio" name="type" className="hidden" />
                                        <ArrowUpCircle size={28} />
                                        <span style={{ fontWeight: 700 }}>Entrada</span>
                                    </label>
                                    <label style={{
                                        cursor: 'pointer', border: '1px solid', borderRadius: '12px', padding: '1rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', transition: 'all 0.2s',
                                        borderColor: adjustmentData.type === 'OUT' ? 'rgba(239, 68, 68, 0.5)' : 'rgba(255,255,255,0.1)',
                                        background: adjustmentData.type === 'OUT' ? 'rgba(239, 68, 68, 0.1)' : 'transparent',
                                        color: adjustmentData.type === 'OUT' ? '#ef4444' : '#6b7280'
                                    }} onClick={() => setAdjustmentData({ ...adjustmentData, type: 'OUT' })}>
                                        <input type="radio" name="type" className="hidden" />
                                        <ArrowDownCircle size={28} />
                                        <span style={{ fontWeight: 700 }}>Saída</span>
                                    </label>
                                </div>

                                {/* Quantity */}
                                <div>
                                    <label style={{ display: 'block', textTransform: 'uppercase', fontSize: '0.75rem', fontWeight: 700, color: '#6b7280', marginBottom: '0.5rem' }}>Quantidade</label>
                                    <input
                                        type="number"
                                        min="1"
                                        style={{
                                            width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px',
                                            padding: '12px', color: 'white', outline: 'none', fontFamily: 'monospace', fontSize: '1.25rem'
                                        }}
                                        value={adjustmentData.quantity}
                                        onChange={(e) => setAdjustmentData({ ...adjustmentData, quantity: parseInt(e.target.value) || 0 })}
                                    />
                                </div>

                                {/* Campos Financeiros Condicionais */}
                                {adjustmentData.type === 'IN' && (
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                        <div>
                                            <label style={{ display: 'block', textTransform: 'uppercase', fontSize: '0.7rem', fontWeight: 700, color: '#6b7280', marginBottom: '0.5rem' }}>Custo Unitário (R$)</label>
                                            <input
                                                type="number"
                                                step="0.01"
                                                placeholder="0,00"
                                                style={{
                                                    width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px',
                                                    padding: '12px', color: 'white', outline: 'none'
                                                }}
                                                value={adjustmentData.unitCost}
                                                onChange={(e) => setAdjustmentData({ ...adjustmentData, unitCost: e.target.value })}
                                            />
                                        </div>
                                        <div>
                                            <label style={{ display: 'block', textTransform: 'uppercase', fontSize: '0.7rem', fontWeight: 700, color: '#6b7280', marginBottom: '0.5rem' }}>Frete Total (R$)</label>
                                            <input
                                                type="number"
                                                step="0.01"
                                                placeholder="0,00"
                                                style={{
                                                    width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px',
                                                    padding: '12px', color: 'white', outline: 'none'
                                                }}
                                                value={adjustmentData.shippingCost}
                                                onChange={(e) => setAdjustmentData({ ...adjustmentData, shippingCost: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                )}

                                {adjustmentData.type === 'OUT' && (
                                    <div>
                                        <label style={{ display: 'block', textTransform: 'uppercase', fontSize: '0.7rem', fontWeight: 700, color: '#6b7280', marginBottom: '0.5rem' }}>Valor Total da Saída (R$)</label>
                                        <input
                                            type="number"
                                            step="0.01"
                                            placeholder="0,00"
                                            style={{
                                                width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px',
                                                padding: '12px', color: 'white', outline: 'none'
                                            }}
                                            value={adjustmentData.exitValue}
                                            onChange={(e) => setAdjustmentData({ ...adjustmentData, exitValue: e.target.value })}
                                        />
                                        <p style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '4px' }}>
                                            Caso tenha gerado receita (Ex: venda externa), informe o valor. Deixe 0 se foi perda.
                                        </p>
                                    </div>
                                )}


                                {/* Reason */}
                                <div>
                                    <label style={{ display: 'block', textTransform: 'uppercase', fontSize: '0.75rem', fontWeight: 700, color: '#6b7280', marginBottom: '0.5rem' }}>Motivo</label>
                                    <input
                                        type="text"
                                        style={{
                                            width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px',
                                            padding: '12px', color: 'white', outline: 'none'
                                        }}
                                        placeholder="Ex: Compra, Inventário, Perda..."
                                        value={adjustmentData.reason}
                                        onChange={(e) => setAdjustmentData({ ...adjustmentData, reason: e.target.value })}
                                    />
                                </div>

                                <Button
                                    onClick={handleSaveAdjustment}
                                    disabled={saving}
                                    style={{
                                        width: '100%', background: 'var(--color-primary)', border: 'none', borderRadius: '8px', padding: '14px',
                                        color: 'white', fontWeight: 700, fontSize: '1rem', marginTop: '1rem'
                                    }}
                                >
                                    {saving ? "Salvando..." : "Confirmar Ajuste"}
                                </Button>
                            </div>
                        </div>
                    </div>
                )
            }
        </div >
    );
}
