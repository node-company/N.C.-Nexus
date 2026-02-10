"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import { ArrowLeft, Save, Loader2, Image as ImageIcon, DollarSign, Package, FileText, Tag, Truck, Ruler, X, Plus, Trash2 } from "lucide-react";
import Link from "next/link";
import { ImageUpload } from "@/components/ui/ImageUpload";

interface ProductVariant {
    id?: string;
    size: string;
    stock_quantity: number;
}

interface ProductFormProps {
    initialData?: {
        id?: string;
        name: string;
        description: string;
        price: number;
        cost_price?: number;
        stock_quantity: number; // Mantido para retrocompatibilidade ou soma total
        image_url?: string;
        supplier?: string;
        category?: string;
        sizes?: string[]; // Deprecated, mas útil na migração
    };
    isEdit?: boolean;
}

export function ProductForm({ initialData, isEdit = false }: ProductFormProps) {
    const router = useRouter();
    const supabase = createClient();
    const [loading, setLoading] = useState(false);

    // Form States
    const [formData, setFormData] = useState({
        name: initialData?.name || "",
        description: initialData?.description || "",
        price: initialData?.price || 0,
        cost_price: initialData?.cost_price || 0,
        image_url: initialData?.image_url || "",
        supplier: initialData?.supplier || "",
        category: initialData?.category || "",
    });

    // Track temporary uploads to clean up later
    const [tempImages, setTempImages] = useState<string[]>([]);

    // Variants State
    const [variants, setVariants] = useState<ProductVariant[]>([]);

    // Inputs temporários para adicionar nova variante
    const [newVariantSize, setNewVariantSize] = useState("");
    const [newVariantStock, setNewVariantStock] = useState(0);

    // Suggestions States
    const [existingCategories, setExistingCategories] = useState<string[]>([]);
    const [existingSuppliers, setExistingSuppliers] = useState<string[]>([]);

    useEffect(() => {
        const fetchSuggestions = async () => {
            const { data: products } = await supabase
                .from("products")
                .select("category, supplier");

            if (products) {
                const cats = Array.from(new Set(products.map(p => p.category).filter(Boolean))) as string[];
                const sups = Array.from(new Set(products.map(p => p.supplier).filter(Boolean))) as string[];
                setExistingCategories(cats.sort());
                setExistingSuppliers(sups.sort());
            }
        };
        fetchSuggestions();
    }, [supabase]);

    // Se estiver editando, precisaria buscar as variantes. 
    // Como simplificação inicial no frontend, se não houver lógica de fetch variants implemented, 
    // ele começa vazio ou com estoque total no 'Único'. 
    // (Implementação robusta buscaria as variantes no useEffect se isEdit for true)
    useEffect(() => {
        if (isEdit && initialData?.id) {
            // Busca variantes do banco
            const fetchVariants = async () => {
                const { data } = await supabase
                    .from("product_variants")
                    .select("*")
                    .eq("product_id", initialData.id);

                if (data && data.length > 0) {
                    setVariants(data.map(v => ({ id: v.id, size: v.size, stock_quantity: v.stock_quantity })));
                } else if (initialData.stock_quantity > 0) {
                    // Fallback: Se não tem variantes mas tem estoque legado, cria um 'Único'
                    setVariants([{ size: "Único", stock_quantity: initialData.stock_quantity }]);
                }
            };
            fetchVariants();
        }
    }, [isEdit, initialData?.id, supabase]);


    const handleAddVariant = (e?: React.FormEvent) => {
        e?.preventDefault(); // Previne submit do form principal
        if (newVariantSize.trim()) {
            setVariants(prev => [...prev, { size: newVariantSize.trim(), stock_quantity: newVariantStock }]);
            setNewVariantSize("");
            setNewVariantStock(0);

            // Focar de volta no input de tamanho para digitação rápida?
            document.getElementById('variant-size-input')?.focus();
        }
    };

    const removeVariant = (index: number) => {
        setVariants(prev => prev.filter((_, i) => i !== index));
    };

    const [error, setError] = useState<string | null>(null);

    // Calcula estoque total para visualização
    const totalStock = variants.reduce((acc, curr) => acc + curr.stock_quantity, 0);

    // Helper para deletar imagem do Storage
    const deleteImageFromStorage = async (url: string) => {
        try {
            // Extrair o nome do arquivo da URL (assumindo bucket 'company-images' plano)
            // URL típcia: .../storage/v1/object/public/company-images/nome-do-arquivo.png
            const fileName = url.split('/').pop();
            if (!fileName) return;

            await supabase.storage
                .from("company-images")
                .remove([fileName]);

            console.log("Deleted image:", fileName);
        } catch (err) {
            console.error("Error deleting image:", err);
        }
    };

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error("Usuário não autenticado");

            // Validação básica
            if (isNaN(formData.price) || formData.price < 0) throw new Error("Preço inválido");
            if (isNaN(formData.cost_price!) || (formData.cost_price || 0) < 0) throw new Error("Custo inválido");

            // 1. Salva/Atualiza Produto Pai
            const productData = {
                ...formData,
                price: formData.price || 0,
                cost_price: formData.cost_price || 0,
                user_id: user.id,
                stock_quantity: totalStock,
            };

            let productId = initialData?.id;

            if (isEdit && productId) {
                const { error: updateError } = await supabase
                    .from("products")
                    .update(productData)
                    .eq("id", productId);
                if (updateError) throw updateError;
            } else {
                const { data: newProduct, error: insertError } = await supabase
                    .from("products")
                    .insert([productData])
                    .select()
                    .single();
                if (insertError) throw insertError;
                productId = newProduct.id;
            }

            if (!productId) throw new Error("Falha ao obter ID do produto");

            // 2. Salva Variantes (Estratégia Inteligente: Update/Insert/Delete)

            // Buscar variantes existentes no banco para comparar
            const { data: existingVariants } = await supabase
                .from("product_variants")
                .select("id")
                .eq("product_id", productId);

            const existingIds = existingVariants?.map(v => v.id) || [];
            const currentIds = variants.map(v => v.id).filter(Boolean) as string[];

            // A. Deletar os que foram removidos do form
            const idsToDelete = existingIds.filter(id => !currentIds.includes(id));
            if (idsToDelete.length > 0) {
                const { error: deleteError } = await supabase
                    .from("product_variants")
                    .delete()
                    .in("id", idsToDelete);

                if (deleteError) {
                    console.error("Erro ao deletar variantes antigas (provavelmente já movimentadas):", deleteError);
                    // Opcional: Avisar usuario ou ignorar se for constraint. 
                    // Se falhar, elas continuam lá. Ideal seria soft-delete ou bloquear.
                    // Vamos lançar apenas se não for violação de FK, ou lançar warning.
                    // Por enquanto, throw para ver o erro se for grave, ou alert.
                    // throw deleteError; 
                }
            }

            // B. Upsert (Update existing + Insert new with specific ID handling logic or separate calls)
            // Supabase upsert requires primary key match.
            // Para simplicidade, vamos separar em Update (quem tem ID) e Insert (quem não tem)

            const variantsToUpdate = variants.filter(v => v.id);
            const variantsToInsert = variants.filter(v => !v.id);

            // B1. Updates
            for (const v of variantsToUpdate) {
                const { error: updateError } = await supabase
                    .from("product_variants")
                    .update({
                        size: v.size,
                        stock_quantity: v.stock_quantity
                    })
                    .eq("id", v.id!);
                if (updateError) throw updateError;
            }

            // B2. Inserts
            if (variantsToInsert.length > 0) {
                const toInsert = variantsToInsert.map(v => ({
                    product_id: productId,
                    user_id: user.id,
                    size: v.size,
                    stock_quantity: v.stock_quantity
                }));
                const { error: insertError } = await supabase
                    .from("product_variants")
                    .insert(toInsert);
                if (insertError) throw insertError;
            }

            // 3. Integração Financeira (Estoque Inicial)
            // Apenas para criação de novos produtos (!isEdit)
            if (!isEdit && totalStock > 0 && formData.cost_price > 0) {
                const totalInitialCost = totalStock * formData.cost_price;
                const today = new Date().toISOString().split('T')[0];

                await supabase.from("transactions").insert({
                    user_id: user.id,
                    description: `Estoque Inicial: ${formData.name} (${totalStock} un)`,
                    amount: totalInitialCost,
                    type: 'EXPENSE',
                    category: 'Compra de Produto',
                    date: today
                });
            }

            // 4. Limpeza de Imagens (Garbage Collection)
            // Lista de imagens para deletar
            const imagesToDelete = new Set<string>();

            // A. Se a imagem original mudou, deleta a antiga
            if (initialData?.image_url && initialData.image_url !== formData.image_url) {
                imagesToDelete.add(initialData.image_url);
            }

            // B. Deletar imagens temporárias que não foram usadas (upload e depois trocou)
            tempImages.forEach(url => {
                if (url !== formData.image_url) {
                    imagesToDelete.add(url);
                }
            });

            // Executar deleção parallel
            if (imagesToDelete.size > 0) {
                await Promise.all(Array.from(imagesToDelete).map(deleteImageFromStorage));
            }

            router.push("/dashboard/products");
            router.refresh();
        } catch (error: any) {
            console.error("Error saving product:", error);
            setError(error.message || "Erro desconhecido ao salvar.");
        } finally {
            setLoading(false);
        }
    }

    // Styles
    const inputStyle = {
        background: 'rgba(255, 255, 255, 0.03)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: '8px',
        padding: '16px',
        color: 'white',
        width: '100%',
        fontSize: '1rem',
        outline: 'none',
        transition: 'all 0.2s',
        fontFamily: 'inherit'
    };

    const labelStyle = {
        display: 'block',
        fontSize: '0.75rem',
        fontWeight: 600,
        color: '#9ca3af', // gray-400
        textTransform: 'uppercase' as const,
        letterSpacing: '0.05em',
        marginBottom: '0.5rem'
    };

    const glassStyle = {
        background: 'rgba(255, 255, 255, 0.03)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        backdropFilter: 'blur(12px)',
        borderRadius: '16px',
    };

    return (
        <form onSubmit={handleSubmit} style={{
            maxWidth: '1200px',
            margin: '0 auto',
            animation: 'fadeIn 0.5s ease',
            padding: '1rem',
            // @ts-ignore
            '--panel-padding': '2rem'
        }}>
            <style jsx>{`
                @media (max-width: 768px) {
                    form { --panel-padding: 1.25rem !important; }
                }
            `}</style>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <Link href="/dashboard/products">
                        <Button variant="ghost" size="sm" type="button" style={{ borderRadius: '50%', width: '40px', height: '40px', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <ArrowLeft size={20} />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="responsive-title" style={{ fontWeight: 700, background: 'linear-gradient(to right, white, #9ca3af)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', margin: 0 }}>
                            {isEdit ? "Editar Produto" : "Novo Produto"}
                        </h1>
                        <p style={{ color: '#9ca3af', fontSize: '0.875rem', marginTop: '0.25rem' }}>
                            Cadastre detalhes e controle estoque por tamanho.
                        </p>
                    </div>
                </div>
                <div style={{ display: 'flex', gap: '0.75rem', width: '100%', maxWidth: '300px', flex: '1 1 auto', justifyContent: 'flex-end' }}>
                    <Link href="/dashboard/products" className="mobile-hidden">
                        <Button variant="ghost" type="button" style={{ color: '#9ca3af' }}>Cancelar</Button>
                    </Link>
                    <Button type="submit" disabled={loading} style={{ flex: 1, minWidth: '140px', background: 'linear-gradient(90deg, var(--color-primary), var(--color-accent))', height: '48px' }}>
                        {loading ? <Loader2 className="animate-spin" size={20} /> : <><Save size={18} style={{ marginRight: '0.5rem' }} /> Salvar</>}
                    </Button>
                </div>
            </div>

            {error && (
                <div style={{ marginBottom: '1.5rem', padding: '1rem', background: 'rgba(220, 38, 38, 0.1)', border: '1px solid rgba(220, 38, 38, 0.2)', borderRadius: '8px', color: '#ef4444', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <X size={20} />
                    <p style={{ margin: 0, fontWeight: 500 }}>{error}</p>
                </div>
            )}

            <div style={{ display: 'flex', gap: '1.5rem', flexDirection: 'column' }}>

                {/* Main Column */}
                <div style={{ flex: '2', minWidth: '300px', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

                    {/* Basic Info Panel */}
                    <div className="glass-panel" style={{ padding: 'var(--panel-padding, 1.5rem)', borderRadius: '16px', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        <h3 style={{ fontSize: '1.125rem', fontWeight: 600, color: 'white', display: 'flex', alignItems: 'center', gap: '0.5rem', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '1rem', margin: 0 }}>
                            <Tag size={18} style={{ color: 'var(--color-primary)' }} /> Identificação
                        </h3>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.5rem' }}>
                            <div>
                                <label style={labelStyle}>Nome do Produto</label>
                                <input
                                    required
                                    type="text"
                                    style={{ ...inputStyle }}
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="Ex: Tênis Esportivo Nike Air"
                                />
                            </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem' }}>
                            <div>
                                <label style={labelStyle}>Categoria</label>
                                <input
                                    type="text"
                                    style={{ ...inputStyle }}
                                    value={formData.category}
                                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                    placeholder="Ex: Calçados"
                                    list="categories"
                                />
                                <datalist id="categories">
                                    {existingCategories.map(cat => (
                                        <option key={cat} value={cat} />
                                    ))}
                                </datalist>
                            </div>
                            <div>
                                <label style={labelStyle}>Fornecedor</label>
                                <div style={{ position: 'relative' }}>
                                    <input
                                        type="text"
                                        style={{ ...inputStyle, paddingLeft: '3rem' }}
                                        value={formData.supplier}
                                        onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
                                        placeholder="Nome do Fornecedor"
                                        list="suppliers"
                                    />
                                    <datalist id="suppliers">
                                        {existingSuppliers.map(sup => (
                                            <option key={sup} value={sup} />
                                        ))}
                                    </datalist>
                                    <Truck style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'gray' }} size={18} />
                                </div>
                            </div>
                        </div>

                        <div>
                            <label style={labelStyle}>Descrição</label>
                            <div style={{ position: 'relative' }}>
                                <textarea
                                    rows={3}
                                    style={{ ...inputStyle, resize: 'none', lineHeight: '1.6' }}
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    placeholder="Detalhes técnicos, material..."
                                />
                                <FileText style={{ position: 'absolute', right: '1rem', top: '1rem', color: '#4b5563' }} size={18} />
                            </div>
                        </div>
                    </div>

                    {/* Inventory By Size Panel */}
                    <div className="glass-panel" style={{ padding: 'var(--panel-padding, 1.5rem)', borderRadius: '16px', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '1rem', marginBottom: '0.5rem' }}>
                            <h3 style={{ fontSize: '1.125rem', fontWeight: 600, color: 'white', display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0 }}>
                                <Ruler size={18} style={{ color: 'var(--color-accent)' }} /> Estoque por Tamanho
                            </h3>
                            <span style={{ fontSize: '0.875rem', color: 'gray' }}>
                                Total: <strong style={{ color: 'white' }}>{totalStock}</strong> un
                            </span>
                        </div>

                        {/* Add Variant Inputs */}
                        <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-end', background: 'rgba(255,255,255,0.02)', padding: '1rem', borderRadius: '12px', flexWrap: 'wrap' }}>
                            <div style={{ flex: '1 1 150px' }}>
                                <label style={labelStyle}>Tamanho/Variação</label>
                                <input
                                    id="variant-size-input"
                                    type="text"
                                    value={newVariantSize}
                                    onChange={(e) => setNewVariantSize(e.target.value)}
                                    placeholder="Ex: P, 42..."
                                    style={{ ...inputStyle, padding: '12px' }}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                            e.preventDefault();
                                            handleAddVariant();
                                        }
                                    }}
                                />
                            </div>
                            <div style={{ flex: '1 1 100px' }}>
                                <label style={labelStyle}>Qtde</label>
                                <input
                                    type="number"
                                    min="0"
                                    inputMode="numeric"
                                    value={newVariantStock}
                                    onChange={(e) => setNewVariantStock(parseInt(e.target.value) || 0)}
                                    style={{ ...inputStyle, padding: '12px' }}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                            e.preventDefault();
                                            handleAddVariant();
                                        }
                                    }}
                                />
                            </div>
                            <Button type="button" onClick={handleAddVariant} style={{ height: '48px', flex: '1 1 100%', maxWidth: 'none', background: 'rgba(255,255,255,0.1)', fontWeight: 700 }}>
                                <Plus size={20} style={{ marginRight: '0.5rem' }} /> Adicionar
                            </Button>
                        </div>

                        {/* Variants List */}
                        {variants.length > 0 ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                <div className="desktop-only" style={{ border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', overflow: 'hidden' }}>
                                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                        <thead style={{ background: 'rgba(255,255,255,0.05)' }}>
                                            <tr>
                                                <th style={{ padding: '12px', textAlign: 'left', color: 'gray', fontSize: '0.75rem', textTransform: 'uppercase' }}>Tamanho</th>
                                                <th style={{ padding: '12px', textAlign: 'center', color: 'gray', fontSize: '0.75rem', textTransform: 'uppercase' }}>Estoque</th>
                                                <th style={{ padding: '12px', textAlign: 'right', color: 'gray', fontSize: '0.75rem', textTransform: 'uppercase' }}>Ação</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {variants.map((v, idx) => (
                                                <tr key={idx} style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                                                    <td style={{ padding: '12px', fontWeight: 600, color: 'white' }}>{v.size}</td>
                                                    <td style={{ padding: '12px', textAlign: 'center', color: '#a7f3d0' }}>{v.stock_quantity}</td>
                                                    <td style={{ padding: '12px', textAlign: 'right' }}>
                                                        <Button
                                                            type="button"
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => removeVariant(idx)}
                                                            style={{ color: '#ef4444', height: '32px', width: '32px', padding: 0 }}
                                                        >
                                                            <X size={16} />
                                                        </Button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                                <div className="mobile-only" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                    {variants.map((v, idx) => (
                                        <div key={idx} style={{
                                            ...glassStyle,
                                            background: 'rgba(255,255,255,0.02)',
                                            padding: '0.75rem 1rem',
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center',
                                            borderRadius: '12px',
                                            border: '1px solid rgba(255,255,255,0.08)'
                                        }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                                <div style={{ background: 'rgba(255,255,255,0.05)', padding: '4px 10px', borderRadius: '8px', color: 'white', fontWeight: 800 }}>{v.size}</div>
                                                <span style={{ color: '#a7f3d0', fontWeight: 600, fontSize: '0.95rem' }}>{v.stock_quantity} <span style={{ fontSize: '0.75rem', opacity: 0.7 }}>un</span></span>
                                            </div>
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => removeVariant(idx)}
                                                style={{ color: '#ef4444', padding: '8px', height: 'auto' }}
                                            >
                                                <Trash2 size={18} />
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <p style={{ textAlign: 'center', color: 'gray', fontSize: '0.875rem', fontStyle: 'italic', padding: '1rem' }}>
                                Nenhuma variação adicionada.
                            </p>
                        )}
                    </div>

                </div>

                {/* Right Column: Pricing & Media */}
                <div style={{ flex: '1', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

                    {/* Media Panel */}
                    <div className="glass-panel" style={{ padding: 'var(--panel-padding, 1.5rem)', borderRadius: '16px', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        <h3 style={{ fontSize: '1.125rem', fontWeight: 600, color: 'white', display: 'flex', alignItems: 'center', gap: '0.5rem', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '1rem', margin: 0 }}>
                            <ImageIcon size={18} style={{ color: 'var(--color-secondary)' }} /> Imagem
                        </h3>

                        <ImageUpload
                            value={formData.image_url}
                            onChange={(url) => {
                                if (url) {
                                    setTempImages(prev => [...prev, url]);
                                }
                                setFormData({ ...formData, image_url: url });
                            }}
                        />
                    </div>

                    {/* Pricing Panel */}
                    <div className="glass-panel" style={{ padding: 'var(--panel-padding, 1.5rem)', borderRadius: '16px', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        <h3 style={{ fontSize: '1.125rem', fontWeight: 600, color: 'white', display: 'flex', alignItems: 'center', gap: '0.5rem', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '1rem', margin: 0 }}>
                            <DollarSign size={18} style={{ color: '#10b981' }} /> Financeiro
                        </h3>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
                            <div>
                                <label style={labelStyle}>Custo Unitário</label>
                                <div style={{ position: 'relative' }}>
                                    <div style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'gray', fontWeight: 600 }}>R$</div>
                                    <input
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        inputMode="decimal"
                                        style={{ ...inputStyle, paddingLeft: '3rem' }}
                                        value={formData.cost_price}
                                        onChange={(e) => setFormData({ ...formData, cost_price: parseFloat(e.target.value) })}
                                    />
                                </div>
                            </div>

                            <div>
                                <label style={labelStyle}>Preço de Venda</label>
                                <div style={{ position: 'relative' }}>
                                    <div style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#10b981', fontWeight: 600 }}>R$</div>
                                    <input
                                        required
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        inputMode="decimal"
                                        style={{ ...inputStyle, paddingLeft: '3rem', fontFamily: 'monospace', fontSize: '1.15rem', borderColor: 'rgba(16, 185, 129, 0.3)' }}
                                        value={formData.price}
                                        onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Profit Helper */}
                        {(formData.price > 0 && formData.cost_price > 0) && (
                            <div style={{ padding: '1rem', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '12px', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                                    <span style={{ fontSize: '0.75rem', color: '#a7f3d0', fontWeight: 600 }}>Lucro Estimado:</span>
                                    <span style={{ fontSize: '0.9rem', fontWeight: 800, color: '#34d399' }}>
                                        R$ {(formData.price - formData.cost_price).toFixed(2)}
                                    </span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <span style={{ fontSize: '0.75rem', color: '#a7f3d0', fontWeight: 600 }}>Margem:</span>
                                    <span style={{ fontSize: '0.9rem', fontWeight: 800, color: '#34d399' }}>
                                        {(((formData.price - formData.cost_price) / formData.price) * 100).toFixed(1)}%
                                    </span>
                                </div>
                            </div>
                        )}
                    </div>

                </div>
            </div>
        </form>
    );
}
