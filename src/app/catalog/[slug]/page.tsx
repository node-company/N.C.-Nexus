"use client";

import React, { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import {
    ShoppingCart,
    ChevronRight,
    Clock,
    Search,
    X,
    CheckCircle2,
    MessageSquare,
    ShoppingBag,
    Briefcase,
    Package
} from "lucide-react";
import { Button } from "@/components/ui/Button";

interface Product {
    id: string;
    name: string;
    description: string;
    price: number;
    image_url?: string;
    category?: string;
    type: 'PRODUCT';
}

interface Service {
    id: string;
    name: string;
    description: string;
    price: number;
    image_url?: string;
    type: 'SERVICE';
}

type CatalogItem = Product | Service;

interface Company {
    id: string;
    user_id: string;
    name: string;
    logo_url?: string;
    whatsapp_number?: string;
}

export default function CatalogPage({ params }: { params: { slug: string } }) {
    const { slug } = params;
    const supabase = createClient();

    const [loading, setLoading] = useState(true);
    const [company, setCompany] = useState<Company | null>(null);
    const [items, setItems] = useState<CatalogItem[]>([]);
    const [cart, setCart] = useState<{ item: CatalogItem, quantity: number }[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("Tudo");

    // UI State
    const [showCart, setShowCart] = useState(false);
    const [orderSuccess, setOrderSuccess] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    // Order Form
    const [customerName, setCustomerName] = useState("");
    const [customerPhone, setCustomerPhone] = useState("");
    const [paymentMethod, setPaymentMethod] = useState("A combinar");

    useEffect(() => {
        fetchCatalog();
    }, [slug]);

    async function fetchCatalog() {
        setLoading(true);
        try {
            // 1. Fetch Company
            const { data: companyData, error: companyError } = await supabase
                .from('company_settings')
                .select('id, user_id, name, logo_url, whatsapp_number, catalog_active')
                .eq('catalog_slug', slug)
                .single();

            if (companyError || !companyData || !companyData.catalog_active) {
                setCompany(null);
                setLoading(false);
                return;
            }

            setCompany(companyData);

            // 2. Fetch Products
            const { data: products } = await supabase
                .from('products')
                .select('id, name, description, price, image_url, category')
                .eq('user_id', companyData.user_id)
                .eq('active', true);

            // 3. Fetch Services
            const { data: services } = await supabase
                .from('services')
                .select('id, name, description, price, image_url')
                .eq('user_id', companyData.user_id)
                .eq('active', true);

            const allItems: CatalogItem[] = [
                ...(products || []).map(p => ({ ...p, type: 'PRODUCT' as const })),
                ...(services || []).map(s => ({ ...s, type: 'SERVICE' as const }))
            ];

            setItems(allItems);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }

    const categories = ["Tudo", ...Array.from(new Set(items.map(i => (i as any).category || (i.type === 'SERVICE' ? 'Serviços' : 'Outros'))))];

    const filteredItems = items.filter(item => {
        const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
        const itemCat = (item as any).category || (item.type === 'SERVICE' ? 'Serviços' : 'Outros');
        const matchesCategory = selectedCategory === "Tudo" || itemCat === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    const addToCart = (item: CatalogItem) => {
        setCart(prev => {
            const existing = prev.find(i => i.item.id === item.id);
            if (existing) {
                return prev.map(i => i.item.id === item.id ? { ...i, quantity: i.quantity + 1 } : i);
            }
            return [...prev, { item, quantity: 1 }];
        });
    };

    const cartTotal = cart.reduce((acc, i) => acc + (i.item.price * i.quantity), 0);

    const handleSubmitOrder = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!company || cart.length === 0) return;
        setSubmitting(true);

        try {
            // 1. Create Sale
            const { data: sale, error: saleError } = await supabase
                .from('sales')
                .insert({
                    user_id: company.user_id,
                    total_amount: cartTotal,
                    status: 'pending',
                    customer_name: customerName,
                    payment_method: paymentMethod
                })
                .select()
                .single();

            if (saleError) throw saleError;

            // 2. Create Sale Items
            const saleItemsPayload = cart.map(c => ({
                sale_id: sale.id,
                user_id: company.user_id,
                product_id: c.item.type === 'PRODUCT' ? c.item.id : null,
                service_id: c.item.type === 'SERVICE' ? c.item.id : null,
                quantity: c.quantity,
                unit_price: c.item.price,
                subtotal: c.item.price * c.quantity
            }));

            const { error: itemsError } = await supabase.from('sale_items').insert(saleItemsPayload);
            if (itemsError) throw itemsError;

            setOrderSuccess(true);
            setCart([]);
            setShowCart(false);
        } catch (err) {
            alert("Erro ao enviar pedido. Tente novamente.");
            console.error(err);
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#09090b', color: 'white' }}>
                <div style={{ textAlign: 'center' }}>
                    <ShoppingBag size={48} className="animate-bounce" style={{ margin: '0 auto 1rem', color: '#10b981' }} />
                    <p style={{ fontSize: '1.25rem', fontWeight: 600 }}>Carregando catálogo...</p>
                </div>
            </div>
        );
    }

    if (!company) {
        return (
            <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#09090b', color: 'white', padding: '2rem' }}>
                <div style={{ textAlign: 'center', maxWidth: '400px' }}>
                    <X size={64} style={{ margin: '0 auto 1.5rem', color: '#ef4444' }} />
                    <h2 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '1rem' }}>Ops! Catálogo indisponível.</h2>
                    <p style={{ color: '#9ca3af' }}>O link pode estar incorreto ou o catálogo foi desativado temporariamente pela empresa.</p>
                </div>
            </div>
        );
    }

    // Styles
    const glassStyle = {
        background: 'rgba(255, 255, 255, 0.03)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        backdropFilter: 'blur(16px)',
        borderRadius: '24px',
    };

    const inputStyle = {
        background: 'rgba(255, 255, 255, 0.05)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: '12px',
        padding: '16px',
        color: 'white',
        width: '100%',
        outline: 'none',
        fontSize: '1rem'
    };

    if (orderSuccess) {
        return (
            <div style={{ minHeight: '100vh', background: '#09090b', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
                <div style={{ ...glassStyle, padding: '3rem', textAlign: 'center', maxWidth: '500px' }}>
                    <CheckCircle2 size={80} color="#10b981" style={{ margin: '0 auto 2rem' }} />
                    <h2 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '1rem' }}>Pedido Enviado!</h2>
                    <p style={{ color: '#9ca3af', marginBottom: '2.5rem', lineHeight: 1.6 }}>Seu pedido foi recebido pela <strong>{company.name}</strong>. Em breve eles entrarão em contato com você.</p>

                    {company.whatsapp_number && (
                        <Button
                            onClick={() => window.open(`https://wa.me/${company.whatsapp_number}?text=Olá! Acabei de fazer um pedido no seu catálogo digital.`, '_blank')}
                            style={{ width: '100%', height: '60px', borderRadius: '16px', background: '#25D366', color: 'white', fontSize: '1.1rem', fontWeight: 700 }}
                        >
                            <MessageSquare size={20} style={{ marginRight: '8px' }} /> Falar no WhatsApp
                        </Button>
                    )}
                    <button onClick={() => setOrderSuccess(false)} style={{ background: 'transparent', border: 'none', color: '#9ca3af', marginTop: '1.5rem', cursor: 'pointer', fontWeight: 600 }}>Fazer outro pedido</button>
                </div>
            </div>
        );
    }

    return (
        <div style={{ minHeight: '100vh', background: '#09090b', color: 'white', fontFamily: 'Inter, sans-serif' }}>
            {/* Header */}
            <header style={{ padding: '2rem 1rem', position: 'sticky', top: 0, zIndex: 10, background: 'rgba(9, 9, 11, 0.8)', backdropFilter: 'blur(10px)' }}>
                <div style={{ maxWidth: '600px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        {company.logo_url && <img src={company.logo_url} alt="Logo" style={{ width: '48px', height: '48px', borderRadius: '12px', objectFit: 'cover' }} />}
                        <div>
                            <h1 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0 }}>{company.name}</h1>
                            <p style={{ fontSize: '0.75rem', color: '#10b981', fontWeight: 600, margin: 0 }}>● Aberto para Pedidos</p>
                        </div>
                    </div>
                </div>
            </header>

            <main style={{ maxWidth: '600px', margin: '0 auto', padding: '1rem' }}>

                {/* Search & Filters */}
                <div style={{ marginBottom: '2rem' }}>
                    <div style={{ position: 'relative', marginBottom: '1rem' }}>
                        <Search size={20} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#6b7280' }} />
                        <input
                            type="text"
                            placeholder="Buscar no catálogo..."
                            style={{ ...inputStyle, paddingLeft: '48px' }}
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                        />
                    </div>

                    <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', paddingBottom: '0.5rem', msOverflowStyle: 'none', scrollbarWidth: 'none' }}>
                        {categories.map(cat => (
                            <button
                                key={cat}
                                onClick={() => setSelectedCategory(cat)}
                                style={{
                                    whiteSpace: 'nowrap',
                                    padding: '8px 20px',
                                    borderRadius: '99px',
                                    backgroundColor: selectedCategory === cat ? '#10b981' : 'rgba(255,255,255,0.05)',
                                    color: selectedCategory === cat ? '#000' : '#9ca3af',
                                    border: 'none',
                                    fontWeight: 700,
                                    fontSize: '0.85rem',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s'
                                }}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Categories Sections */}
                {filteredItems.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '4rem 0', color: '#6b7280' }}>
                        <p>Nenhum item encontrado.</p>
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        {filteredItems.map(item => (
                            <div key={item.id} style={{ ...glassStyle, padding: '1rem', display: 'flex', gap: '1rem', alignItems: 'center' }}>
                                <div style={{ width: '80px', height: '80px', borderRadius: '16px', overflow: 'hidden', background: 'rgba(255,255,255,0.05)', flexShrink: 0 }}>
                                    {item.image_url ? (
                                        <img src={item.image_url} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    ) : (
                                        <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            {item.type === 'PRODUCT' ? <Package size={32} opacity={0.2} /> : <Briefcase size={32} opacity={0.2} />}
                                        </div>
                                    )}
                                </div>
                                <div style={{ flex: 1 }}>
                                    <h4 style={{ fontSize: '1rem', fontWeight: 700, margin: '0 0 4px 0' }}>{item.name}</h4>
                                    <p style={{ fontSize: '0.8rem', color: '#6b7280', margin: '0 0 8px 0', lineClamp: 2, display: '-webkit-box', WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{item.description}</p>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <span style={{ fontSize: '1.1rem', fontWeight: 800, color: '#10b981' }}>R$ {item.price.toFixed(2)}</span>
                                        <button
                                            onClick={() => addToCart(item)}
                                            style={{
                                                background: 'rgba(16, 185, 129, 0.1)',
                                                color: '#10b981',
                                                border: 'none',
                                                width: '32px',
                                                height: '32px',
                                                borderRadius: '50%',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                cursor: 'pointer'
                                            }}
                                        >
                                            <ShoppingCart size={16} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>

            {/* Cart Bar Floating */}
            {cart.length > 0 && !showCart && (
                <div style={{ position: 'fixed', bottom: '2rem', left: '50%', transform: 'translateX(-50%)', width: '90%', maxWidth: '500px', zIndex: 100 }}>
                    <button
                        onClick={() => setShowCart(true)}
                        style={{
                            width: '100%',
                            height: '64px',
                            background: 'linear-gradient(90deg, #10b981, #059669)',
                            borderRadius: '20px',
                            boxShadow: '0 10px 25px rgba(16, 185, 129, 0.4)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: '0 1.5rem',
                            color: 'black',
                            fontWeight: 800,
                            border: 'none',
                            cursor: 'pointer'
                        }}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div style={{ background: 'rgba(0,0,0,0.1)', width: '32px', height: '32px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                {cart.reduce((acc, i) => acc + i.quantity, 0)}
                            </div>
                            Ver Carrinho
                        </div>
                        <span>R$ {cartTotal.toFixed(2)}</span>
                    </button>
                </div>
            )}

            {/* Cart Drawer */}
            {showCart && (
                <div style={{ position: 'fixed', inset: 0, zIndex: 200, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}>
                    <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: '#121214', borderTopLeftRadius: '32px', borderTopRightRadius: '32px', maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}>
                        <div style={{ padding: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <h3 style={{ fontSize: '1.25rem', fontWeight: 800 }}>Seu Carrinho</h3>
                            <button onClick={() => setShowCart(false)} style={{ background: 'transparent', border: 'none', color: '#6b7280' }}><X size={24} /></button>
                        </div>

                        <div style={{ padding: '1.5rem', overflowY: 'auto', flex: 1 }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem' }}>
                                {cart.map(i => (
                                    <div key={i.item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <div>
                                            <p style={{ margin: 0, fontWeight: 700 }}>{i.item.name}</p>
                                            <p style={{ margin: 0, fontSize: '0.8rem', color: '#6b7280' }}>R$ {i.item.price.toFixed(2)} un. x {i.quantity}</p>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                            <button
                                                onClick={() => setCart(prev => prev.map(item => item.item.id === i.item.id ? { ...item, quantity: Math.max(0, item.quantity - 1) } : item).filter(item => item.quantity > 0))}
                                                style={{ width: '28px', height: '28px', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: 'none', color: 'white' }}
                                            >-</button>
                                            <span style={{ fontWeight: 700 }}>{i.quantity}</span>
                                            <button
                                                onClick={() => setCart(prev => prev.map(item => item.item.id === i.item.id ? { ...item, quantity: item.quantity + 1 } : item))}
                                                style={{ width: '28px', height: '28px', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: 'none', color: 'white' }}
                                            >+</button>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <form onSubmit={handleSubmitOrder}>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                    <div>
                                        <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', marginBottom: '0.5rem', display: 'block' }}>Seu Nome</label>
                                        <input required type="text" placeholder="Como podemos te chamar?" style={inputStyle} value={customerName} onChange={e => setCustomerName(e.target.value)} />
                                    </div>
                                    <div>
                                        <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', marginBottom: '0.5rem', display: 'block' }}>WhatsApp</label>
                                        <input required type="text" placeholder="(99) 99999-9999" style={inputStyle} value={customerPhone} onChange={e => setCustomerPhone(e.target.value)} />
                                    </div>
                                    <div>
                                        <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', marginBottom: '0.5rem', display: 'block' }}>Forma de Pagamento</label>
                                        <select
                                            style={{ ...inputStyle, cursor: 'pointer', appearance: 'none' }}
                                            value={paymentMethod}
                                            onChange={e => setPaymentMethod(e.target.value)}
                                        >
                                            <option value="A combinar">A combinar / Pagar na Entrega</option>
                                            <option value="PIX">Pix</option>
                                            <option value="CREDIT">Cartão de Crédito</option>
                                            <option value="DEBIT">Cartão de Débito</option>
                                            <option value="CASH">Dinheiro</option>
                                        </select>
                                    </div>

                                    <div style={{ margin: '1rem 0', padding: '1.5rem', borderRadius: '16px', background: 'rgba(16, 185, 129, 0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <span style={{ fontWeight: 600, color: '#10b981' }}>Total do Pedido</span>
                                        <span style={{ fontSize: '1.5rem', fontWeight: 800, color: '#10b981' }}>R$ {cartTotal.toFixed(2)}</span>
                                    </div>

                                    <Button
                                        type="submit"
                                        disabled={submitting}
                                        style={{ width: '100%', height: '64px', borderRadius: '16px', background: 'white', color: 'black', fontWeight: 800, fontSize: '1.1rem' }}
                                    >
                                        {submitting ? "Enviando..." : "ENVIAR PEDIDO"}
                                    </Button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
