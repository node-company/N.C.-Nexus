"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import { Search, ShoppingCart, Trash2, Plus, Minus, Package, X, Briefcase, Edit, History, Store, FileText, Printer, CheckCircle, Percent } from "lucide-react";
import { ReceiptModal } from "@/components/sales/ReceiptModal";

// Types
interface ProductVariant {
    id: string;
    size: string;
    stock_quantity: number;
}

interface Product {
    id: string;
    name: string;
    price: number;
    image_url?: string;
    product_variants: ProductVariant[];
    stock_quantity?: number;
    type: 'PRODUCT';
}

interface Service {
    id: string;
    name: string;
    price: number;
    image_url?: string;
    type: 'SERVICE';
}

type CatalogItem = Product | Service;

interface Client {
    id: string;
    name: string;
}

interface CartItem {
    tempId: string;
    item: CatalogItem;
    variantId?: string;
    variantSize?: string;
    quantity: number;
    unitPrice: number;
}

interface Employee {
    id: string;
    name: string;
    commission_percentage: number;
    auth_id?: string;
}

export default function SalesPDVPage() {
    const supabase = createClient();

    // View State
    const [viewMode, setViewMode] = useState<'POS' | 'HISTORY'>('POS');
    const [historyTab, setHistoryTab] = useState<'SALES' | 'QUOTES'>('SALES');
    const [pendingAction, setPendingAction] = useState<{ type: 'EDIT' | 'DELETE' | 'CONVERT', sale: any } | null>(null);
    const [editingSaleId, setEditingSaleId] = useState<string | null>(null);

    // Data States
    const [catalog, setCatalog] = useState<CatalogItem[]>([]);
    const [clients, setClients] = useState<Client[]>([]);
    const [loading, setLoading] = useState(true);
    const [salesHistory, setSalesHistory] = useState<any[]>([]);
    const [companySettings, setCompanySettings] = useState<any>(null);
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [companyOwnerId, setCompanyOwnerId] = useState<string | null>(null);

    // Filtered History
    const filteredHistory = salesHistory.filter(s =>
        historyTab === 'SALES' ? (s.status === 'completed' || !s.status) : s.status === 'quote'
    );

    // UI States
    const [searchTerm, setSearchTerm] = useState("");
    const [cart, setCart] = useState<CartItem[]>([]);
    const [selectedClient, setSelectedClient] = useState<string>("");
    const [selectedSellerId, setSelectedSellerId] = useState<string>("");
    const [paymentMethod, setPaymentMethod] = useState<string>("PIX");
    const [filterType, setFilterType] = useState<'ALL' | 'PRODUCT' | 'SERVICE'>('ALL');

    // Discount State
    const [discountType, setDiscountType] = useState<'FIXED' | 'PERCENTAGE'>('FIXED');
    const [discountValue, setDiscountValue] = useState<number>(0);

    // Variant Selection Modal
    const [variantModalOpen, setVariantModalOpen] = useState(false);
    const [productForVariantSel, setProductForVariantSel] = useState<Product | null>(null);

    // Receipt Modal
    const [receiptModalOpen, setReceiptModalOpen] = useState(false);
    const [selectedSaleForReceipt, setSelectedSaleForReceipt] = useState<any>(null);

    // Checkout State
    const [processing, setProcessing] = useState(false);

    // Styles
    const glassStyle = {
        background: 'rgba(255, 255, 255, 0.03)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        backdropFilter: 'blur(12px)',
        borderRadius: '16px',
    };

    const inputStyle = {
        background: 'rgba(255, 255, 255, 0.03)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: '8px',
        padding: '12px',
        color: 'white',
        width: '100%',
        fontSize: '1rem',
        outline: 'none',
        transition: 'all 0.2s',
    };

    // Initial Fetch
    useEffect(() => {
        fetchData();
        fetchCompanySettings();
    }, []);

    // Fetch History when tab changes
    useEffect(() => {
        if (viewMode === 'HISTORY') {
            fetchHistory();
        }
    }, [viewMode]);

    async function fetchCompanySettings() {
        const { data } = await supabase.from('company_settings').select('*').single();
        if (data) setCompanySettings(data);
    }

    async function fetchData() {
        setLoading(true);
        const { data: clientsData } = await supabase.from("clients").select("id, name").order("name");
        if (clientsData) setClients(clientsData);

        // Fetch Products and Services
        const { data: productsData } = await supabase
            .from("products")
            .select(`id, name, price, image_url, stock_quantity, product_variants (id, size, stock_quantity)`)
            .eq('active', true) // Only show active products in POS
            .order("name");

        // Fetch Employees for Commission
        const { data: employeesData } = await supabase
            .from("employees")
            .select("id, name, commission_percentage, auth_id")
            .eq("active", true)
            .order("name");

        if (employeesData) {
            setEmployees(employeesData);

            // Auto-select current logged-in employee
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                const currentEmployee = employeesData.find((e: any) => e.auth_id === user.id);
                if (currentEmployee) {
                    setSelectedSellerId(currentEmployee.id);
                }

                // Determine Company Owner ID (for Inserting Records)
                const { data: employeeRecord } = await supabase
                    .from('employees')
                    .select('owner_id')
                    .eq('auth_id', user.id)
                    .single();

                if (employeeRecord) {
                    setCompanyOwnerId(employeeRecord.owner_id);
                } else {
                    setCompanyOwnerId(user.id); // I am the owner
                }
            }
        }

        const { data: servicesData } = await supabase
            .from("services")
            .select(`id, name, price, image_url`)
            .eq('active', true)
            .order("name");

        const allProducts: Product[] = (productsData || []).map((p: any) => ({ ...p, type: 'PRODUCT' }));
        const allServices: Service[] = (servicesData || []).map((s: any) => ({ ...s, type: 'SERVICE' }));

        setCatalog([...allProducts, ...allServices]);
        setLoading(false);
    }

    async function fetchHistory() {
        setLoading(true);
        const { data, error } = await supabase
            .from("sales")
            .select(`*, clients(name, document), employees(name), sale_items(*, products(name), services(name), product_variants(size))`)
            .order("created_at", { ascending: false });

        if (error) {
            console.error("Error fetching history:", error);
        }

        if (data) setSalesHistory(data);
        setLoading(false);
    }

    // Cart Logic
    const addToCart = (item: CatalogItem, variantId?: string, variantSize?: string) => {
        if (item.type === 'PRODUCT') {
            const product = item as Product;
            if (!variantId && product.product_variants && product.product_variants.length > 0) {
                setProductForVariantSel(product);
                setVariantModalOpen(true);
                return;
            }
            const stockAvailable = variantId
                ? product.product_variants.find(v => v.id === variantId)?.stock_quantity || 0
                : product.stock_quantity || 0;

            if (stockAvailable <= 0) {
                alert("Produto sem estoque!");
                return;
            }
        }

        setCart(prev => {
            const existingItem = prev.find(cartItem =>
                cartItem.item.id === item.id && cartItem.variantId === variantId
            );

            if (existingItem) {
                if (item.type === 'PRODUCT') {
                    const product = item as Product;
                    const stockAvailable = variantId
                        ? product.product_variants.find(v => v.id === variantId)?.stock_quantity || 0
                        : product.stock_quantity || 0;
                    if (existingItem.quantity + 1 > stockAvailable) {
                        alert("Estoque insuficiente.");
                        return prev;
                    }
                }
                return prev.map(cartItem =>
                    (cartItem.item.id === item.id && cartItem.variantId === variantId)
                        ? { ...cartItem, quantity: cartItem.quantity + 1 }
                        : cartItem
                );
            }

            return [...prev, {
                tempId: Math.random().toString(36).substr(2, 9),
                item,
                variantId,
                variantSize,
                quantity: 1,
                unitPrice: item.price
            }];
        });

        if (item.type === 'PRODUCT') {
            setVariantModalOpen(false);
            setProductForVariantSel(null);
        }
    };

    const removeFromCart = (tempId: string) => {
        setCart(prev => prev.filter(item => item.tempId !== tempId));
    };

    const updateQuantity = (tempId: string, change: number) => {
        setCart(prev => prev.map(cartItem => {
            if (cartItem.tempId === tempId) {
                const newQty = cartItem.quantity + change;
                if (newQty < 1) return cartItem;
                return { ...cartItem, quantity: newQty };
            }
            return cartItem;
        }));
    };

    // Calculations
    const cartSubtotal = cart.reduce((acc, item) => acc + (item.quantity * item.unitPrice), 0);
    const discountAmount = discountType === 'FIXED'
        ? discountValue
        : (cartSubtotal * discountValue) / 100;

    // Ensure discount isn't more than subtotal
    const finalDiscount = Math.min(Math.max(0, discountAmount), cartSubtotal);
    const finalTotal = cartSubtotal - finalDiscount;

    const handleCheckout = async (targetStatus: 'completed' | 'quote' = 'completed') => {
        if (cart.length === 0) return;
        setProcessing(true);

        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error("User needed");

            const { data: sale, error: saleError } = await supabase
                .from("sales")
                .insert({
                    user_id: companyOwnerId || user.id,
                    client_id: selectedClient || null,
                    total_amount: finalTotal,
                    discount: finalDiscount, // Saving the calculated discount
                    payment_method: paymentMethod,
                    status: targetStatus,
                    employee_id: selectedSellerId || null,
                    commission_amount: 0 // Will be updated if calculated
                })
                .select()
                .single();

            // Calculate Commission
            let commissionAmount = 0;
            if (selectedSellerId) {
                const seller = employees.find(e => e.id === selectedSellerId);
                if (seller && seller.commission_percentage > 0) {
                    commissionAmount = (finalTotal * seller.commission_percentage) / 100;

                    // Update Sale with Commission Amount
                    await supabase.from("sales").update({ commission_amount: commissionAmount }).eq("id", sale.id);

                    // Register Commission Expense (Transaction)
                    if (targetStatus === 'completed') {
                        await supabase.from("transactions").insert({
                            user_id: companyOwnerId || user.id,
                            description: `Comissão Venda #${sale.id.slice(0, 8)} - ${seller.name}`,
                            amount: commissionAmount,
                            type: 'EXPENSE',
                            category: 'Comissão',
                            date: new Date().toISOString().split('T')[0]
                        });
                    }
                }
            }

            if (saleError) throw saleError;

            // --- SAFE EDIT: DEFERRED DELETE ---
            if (editingSaleId) {
                console.log("[Checkout] Safe Edit active. Deleting original sale:", editingSaleId);
                const { data: originalSale } = await supabase.from("sales").select("*, sale_items(*)").eq("id", editingSaleId).single();

                if (originalSale) {
                    const deleteSuccess = await executeDelete(editingSaleId, originalSale.sale_items, originalSale.status);
                    if (!deleteSuccess) {
                        alert("Erro ao atualizar venda original. Operação cancelada.");
                        await supabase.from("sales").delete().eq("id", sale.id);
                        setProcessing(false);
                        return; // Abort
                    }
                }
            }

            for (const cartItem of cart) {
                const productId = cartItem.item.type === 'PRODUCT' ? cartItem.item.id : null;
                const serviceId = cartItem.item.type === 'SERVICE' ? cartItem.item.id : null;

                const { error: itemError } = await supabase.from("sale_items").insert({
                    sale_id: sale.id,
                    user_id: user.id,
                    product_id: productId,
                    service_id: serviceId,
                    variant_id: cartItem.variantId || null,
                    quantity: cartItem.quantity,
                    unit_price: cartItem.unitPrice,
                    subtotal: cartItem.quantity * cartItem.unitPrice
                });

                if (itemError) throw itemError;

                // --- STOCK DEDUCTION ONLY IF COMPLETED ---
                if (targetStatus === 'completed' && cartItem.item.type === 'PRODUCT') {
                    const product = cartItem.item as Product;

                    if (cartItem.variantId) {
                        const { data: freshVariant } = await supabase.from("product_variants").select("stock_quantity").eq("id", cartItem.variantId).single();
                        if (freshVariant) {
                            const newStock = freshVariant.stock_quantity - cartItem.quantity;
                            await supabase.from("product_variants").update({ stock_quantity: newStock }).eq("id", cartItem.variantId);
                            await supabase.from("inventory_movements").insert({
                                user_id: user.id, product_id: product.id, variant_id: cartItem.variantId,
                                type: 'OUT', quantity: cartItem.quantity, reason: `Venda #${sale.id.slice(0, 8)}`
                            });
                        }
                    } else if (product.id) {
                        const { data: freshProduct } = await supabase.from("products").select("stock_quantity").eq("id", product.id).single();
                        if (freshProduct) {
                            const newStock = (freshProduct.stock_quantity || 0) - cartItem.quantity;
                            await supabase.from("products").update({ stock_quantity: newStock }).eq("id", product.id);
                            await supabase.from("inventory_movements").insert({
                                user_id: user.id, product_id: product.id, variant_id: null,
                                type: 'OUT', quantity: cartItem.quantity, reason: `Venda #${sale.id.slice(0, 8)}`
                            });
                        }
                    }
                }
            }

            const successMsg = editingSaleId
                ? (targetStatus === 'quote' ? "Orçamento atualizado!" : "Venda atualizada!")
                : (targetStatus === 'quote' ? "Orçamento salvo!" : "Venda realizada!");

            alert(successMsg);
            setCart([]);
            setDiscountValue(0); // Reset discount
            setSelectedClient("");
            // Keep selected seller or reset? Usually keep.
            setEditingSaleId(null);
            fetchData(); // Refresh catalog stock

        } catch (error) {
            console.error("Checkout error:", error);
            alert("Erro ao finalizar (Verifique se a migração de desconto foi executada).");
        } finally {
            setProcessing(false);
        }
    };

    // --- History Actions ---

    // 1. Delete Logic
    const executeDelete = async (saleId: string, items: any[], status: string): Promise<boolean> => {
        setProcessing(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();

            // ONLY RESTORE STOCK IF IT WAS A COMPLETED SALE
            if (status === 'completed' && items && items.length > 0) {
                for (const item of items) {
                    if (item.variant_id) {
                        const { data: variant } = await supabase.from("product_variants").select("stock_quantity, product_id").eq("id", item.variant_id).single();
                        if (variant) {
                            const newStock = variant.stock_quantity + item.quantity;
                            await supabase.from("product_variants").update({ stock_quantity: newStock }).eq("id", item.variant_id);
                            if (user) await supabase.from("inventory_movements").insert({ user_id: companyOwnerId || user.id, product_id: variant.product_id, variant_id: item.variant_id, type: 'IN', quantity: item.quantity, reason: `Estorno Venda #${saleId.slice(0, 8)}` });
                        }
                    } else if (item.product_id) {
                        const { data: product } = await supabase.from("products").select("stock_quantity").eq("id", item.product_id).single();
                        if (product) {
                            const newStock = (product.stock_quantity || 0) + item.quantity;
                            await supabase.from("products").update({ stock_quantity: newStock }).eq("id", item.product_id);
                            if (user) await supabase.from("inventory_movements").insert({ user_id: companyOwnerId || user.id, product_id: item.product_id, variant_id: null, type: 'IN', quantity: item.quantity, reason: `Estorno Venda #${saleId.slice(0, 8)}` });
                        }
                    }
                }
            }

            const { error } = await supabase.from("sales").delete().eq("id", saleId);
            if (error) throw error;

            await fetchHistory();
            await fetchData();
            return true;

        } catch (error) {
            console.error(error);
            alert("Erro ao cancelar.");
            return false;
        } finally {
            setProcessing(false);
        }
    };

    // 2. Edit/Convert Logic
    const executeEdit = async (sale: any) => {
        console.log("[ExecuteEdit] Loading sale:", sale.id);
        const newCartItems: CartItem[] = sale.sale_items.map((si: any) => {
            const isProduct = !!si.product_id;
            const catalogItem = catalog.find(c => c.id === (isProduct ? si.product_id : si.service_id));
            const item: CatalogItem = catalogItem || {
                id: isProduct ? si.product_id : si.service_id,
                name: isProduct ? (si.products?.name || 'Item Removido') : (si.services?.name || 'Item Removido'),
                price: si.unit_price,
                type: isProduct ? 'PRODUCT' : 'SERVICE',
                product_variants: []
            };

            return {
                tempId: Math.random().toString(36).substr(2, 9),
                item: item,
                variantId: si.variant_id,
                variantSize: si.product_variants?.size || "Original",
                quantity: si.quantity,
                unitPrice: si.unit_price
            };
        });

        setCart(newCartItems);
        // Load existing discount if any (Assuming it was fixed value for simplicity in restoring)
        if (sale.discount) {
            setDiscountType('FIXED');
            setDiscountValue(sale.discount);
        } else {
            setDiscountValue(0);
        }

        if (sale.client_id) setSelectedClient(sale.client_id);
        if (sale.employee_id) setSelectedSellerId(sale.employee_id);
        setEditingSaleId(sale.id);
        setViewMode('POS');
    };

    const confirmAction = async () => {
        if (!pendingAction) return;
        const { type, sale } = pendingAction;

        if (type === 'DELETE') {
            await executeDelete(sale.id, sale.sale_items, sale.status);
        } else if (type === 'EDIT' || type === 'CONVERT') {
            await executeEdit(sale);
        }
        setPendingAction(null);
    };

    const filteredCatalog = catalog.filter(item => {
        const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesType = filterType === 'ALL' || item.type === filterType;
        return matchesSearch && matchesType;
    });

    return (
        <div style={{ height: 'calc(100vh - 2rem)', display: 'flex', flexDirection: 'column', gap: '1rem', overflow: 'hidden', padding: '1rem', animation: 'fadeIn 0.5s ease' }}>

            <ReceiptModal
                isOpen={receiptModalOpen}
                onClose={() => setReceiptModalOpen(false)}
                sale={selectedSaleForReceipt}
                companySettings={companySettings}
            />

            {/* Top Bar with Tabs */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <h1 style={{ fontSize: '1.875rem', fontWeight: 800, background: 'linear-gradient(to right, white, #9ca3af)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', margin: 0 }}>
                        {editingSaleId ? `Editando Venda #${editingSaleId.slice(0, 8)}` : 'PDV'}
                    </h1>
                </div>

                <div style={{ display: 'flex', background: 'rgba(255,255,255,0.05)', borderRadius: '12px', padding: '4px' }}>
                    <button
                        onClick={() => {
                            if (editingSaleId && !confirm("Sair sem salvar?")) return;
                            setEditingSaleId(null); setCart([]); setDiscountValue(0); setViewMode('POS');
                        }}
                        style={{
                            padding: '8px 24px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem',
                            background: viewMode === 'POS' ? 'var(--color-primary)' : 'transparent', color: viewMode === 'POS' ? 'white' : '#9ca3af', transition: 'all 0.2s'
                        }}
                    >
                        <Store size={18} /> Nova Venda
                    </button>
                    <button
                        onClick={() => {
                            if (editingSaleId && !confirm("Sair sem salvar?")) return;
                            setEditingSaleId(null); setCart([]); setDiscountValue(0); setViewMode('HISTORY');
                        }}
                        style={{
                            padding: '8px 24px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem',
                            background: viewMode === 'HISTORY' ? 'var(--color-primary)' : 'transparent', color: viewMode === 'HISTORY' ? 'white' : '#9ca3af', transition: 'all 0.2s'
                        }}
                    >
                        <History size={18} /> Histórico
                    </button>
                </div>
            </div>

            {/* Content Switch */}
            {viewMode === 'POS' ? (
                <div style={{ flex: 1, display: 'flex', gap: '1.5rem', overflow: 'hidden' }}>
                    {/* Left: Product/Service Catalog */}
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '1.5rem', height: '100%', minWidth: 0 }}>
                        {/* Filter & Search Bar */}
                        <div style={{ ...glassStyle, borderRadius: '12px', padding: '1rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <div style={{ display: 'flex', gap: '0.5rem', background: 'rgba(0,0,0,0.2)', padding: '0.25rem', borderRadius: '8px' }}>
                                <button onClick={() => setFilterType('ALL')} style={{ padding: '6px 12px', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 600, border: 'none', cursor: 'pointer', background: filterType === 'ALL' ? 'var(--color-primary)' : 'transparent', color: filterType === 'ALL' ? 'white' : '#9ca3af' }}>Todos</button>
                                <button onClick={() => setFilterType('PRODUCT')} style={{ padding: '6px 12px', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 600, border: 'none', cursor: 'pointer', background: filterType === 'PRODUCT' ? 'var(--color-primary)' : 'transparent', color: filterType === 'PRODUCT' ? 'white' : '#9ca3af' }}>Produtos</button>
                                <button onClick={() => setFilterType('SERVICE')} style={{ padding: '6px 12px', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 600, border: 'none', cursor: 'pointer', background: filterType === 'SERVICE' ? 'var(--color-primary)' : 'transparent', color: filterType === 'SERVICE' ? 'white' : '#9ca3af' }}>Serviços</button>
                            </div>
                            <div style={{ height: '24px', width: '1px', background: 'rgba(255,255,255,0.1)' }}></div>
                            <div style={{ flex: 1, display: 'flex', alignItems: 'center' }}>
                                <Search style={{ color: '#9ca3af', marginRight: '0.75rem' }} size={20} />
                                <input type="text" placeholder="Buscar..." style={{ background: 'transparent', border: 'none', outline: 'none', color: 'white', width: '100%', fontSize: '1rem' }} value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                            </div>
                        </div>

                        {/* Catalog Grid */}
                        <div style={{ flex: 1, overflowY: 'auto', paddingRight: '0.5rem' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '1rem' }}>
                                {filteredCatalog.map(item => {
                                    const isProduct = item.type === 'PRODUCT';
                                    let stockDisplay = null;
                                    if (isProduct) {
                                        const product = item as Product;
                                        const totalStock = product.product_variants && product.product_variants.length > 0
                                            ? product.product_variants.reduce((a, b) => a + b.stock_quantity, 0)
                                            : product.stock_quantity || 0;
                                        stockDisplay = `${totalStock} un`;
                                    } else {
                                        stockDisplay = 'Serviço';
                                    }
                                    return (
                                        <div key={item.id} onClick={() => addToCart(item)} style={{ ...glassStyle, padding: '1rem', cursor: 'pointer', transition: 'transform 0.2s', position: 'relative' }} onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.02)'} onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}>
                                            <div style={{ aspectRatio: '1/1', background: 'rgba(0,0,0,0.2)', borderRadius: '8px', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                                                {item.image_url ? <img src={item.image_url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : (isProduct ? <Package style={{ color: '#4b5563' }} size={32} /> : <Briefcase style={{ color: '#4b5563' }} size={32} />)}
                                            </div>
                                            <h3 style={{ fontWeight: 600, color: 'white', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontSize: '0.9rem' }}>{item.name}</h3>
                                            <p style={{ color: '#34d399', fontWeight: 700, fontSize: '1rem' }}>R$ {item.price.toFixed(2)}</p>
                                            <div style={{ position: 'absolute', top: '0.5rem', right: '0.5rem', background: 'rgba(0,0,0,0.6)', padding: '2px 6px', borderRadius: '4px', fontSize: '0.7rem', color: isProduct && (parseInt(stockDisplay) || 0) <= 0 ? '#ef4444' : isProduct ? '#d1d5db' : '#60a5fa', backdropFilter: 'blur(4px)' }}>{stockDisplay}</div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    {/* Right: Cart & Checkout */}
                    <div style={{ width: '400px', ...glassStyle, display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden', background: 'rgba(0,0,0,0.2)' }}>
                        {/* Cart Header */}
                        <div style={{ padding: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'white', display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0 }}>
                                <ShoppingCart style={{ color: '#34d399' }} size={20} /> Carrinho
                            </h2>
                            {editingSaleId && (
                                <button
                                    onClick={() => { setEditingSaleId(null); setCart([]); setDiscountValue(0); alert("Edição cancelada. Venda original mantida."); }}
                                    style={{ background: 'rgba(239, 68, 68, 0.2)', border: 'none', padding: '4px 8px', borderRadius: '4px', color: '#ef4444', fontSize: '0.75rem', cursor: 'pointer' }}
                                >
                                    Cancelar Edição
                                </button>
                            )}
                        </div>
                        {/* Cart Items */}
                        <div style={{ flex: 1, overflowY: 'auto', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            {cart.map(cartItem => (
                                <div key={cartItem.tempId} style={{ display: 'flex', gap: '0.75rem', background: 'rgba(255,255,255,0.02)', padding: '0.75rem', borderRadius: '8px', alignItems: 'center' }}>
                                    <div style={{ width: '40px', height: '40px', borderRadius: '6px', background: 'rgba(0,0,0,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', flexShrink: 0 }}>
                                        {cartItem.item.image_url ? <img src={cartItem.item.image_url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : (cartItem.item.type === 'PRODUCT' ? <Package size={16} color="gray" /> : <Briefcase size={16} color="gray" />)}
                                    </div>
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <p style={{ fontSize: '0.875rem', fontWeight: 500, color: 'white', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', margin: 0 }}>{cartItem.item.name}</p>
                                        <p style={{ fontSize: '0.75rem', color: '#9ca3af', margin: 0 }}>{cartItem.variantSize ? `Tam: ${cartItem.variantSize}` : (cartItem.item.type === 'SERVICE' ? 'Serviço' : 'Único')} | R$ {cartItem.unitPrice.toFixed(2)}</p>
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
                                        <p style={{ fontWeight: 700, color: '#34d399', fontSize: '0.9rem', margin: 0 }}>R$ {(cartItem.quantity * cartItem.unitPrice).toFixed(2)}</p>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'rgba(0,0,0,0.2)', borderRadius: '4px', padding: '2px' }}>
                                            <button onClick={() => updateQuantity(cartItem.tempId, -1)} style={{ padding: '2px', color: '#9ca3af', background: 'transparent', border: 'none', cursor: 'pointer' }}><Minus size={12} /></button>
                                            <span style={{ fontSize: '0.75rem', color: 'white', width: '16px', textAlign: 'center', fontFamily: 'monospace' }}>{cartItem.quantity}</span>
                                            <button onClick={() => updateQuantity(cartItem.tempId, 1)} style={{ padding: '2px', color: '#9ca3af', background: 'transparent', border: 'none', cursor: 'pointer' }}><Plus size={12} /></button>
                                        </div>
                                    </div>
                                    <button onClick={() => removeFromCart(cartItem.tempId)} style={{ padding: '4px', color: '#ef4444', background: 'transparent', border: 'none', cursor: 'pointer', opacity: 0.7 }}><X size={14} /></button>
                                </div>
                            ))}
                            {cart.length === 0 && <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#4b5563', gap: '1rem' }}><ShoppingCart size={40} style={{ opacity: 0.5 }} /><p style={{ margin: 0 }}>Carrinho vazio</p></div>}
                        </div>
                        {/* Checkout */}
                        <div style={{ padding: '1.5rem', background: 'rgba(0,0,0,0.2)', borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {/* Client & Payment */}
                            <div>
                                <select style={{ ...inputStyle, background: 'rgba(255,255,255,0.05)', cursor: 'pointer' }} value={selectedClient} onChange={(e) => setSelectedClient(e.target.value)}>
                                    <option value="" style={{ background: '#111827' }}>Cliente (Opcional)</option>
                                    {clients.map(c => <option key={c.id} value={c.id} style={{ background: '#111827' }}>{c.name}</option>)}
                                </select>
                            </div>

                            {/* Seller Selection */}
                            <div style={{ marginTop: '0.5rem' }}>
                                <select
                                    style={{ ...inputStyle, background: 'rgba(255,255,255,0.05)', cursor: 'pointer' }}
                                    value={selectedSellerId}
                                    onChange={(e) => setSelectedSellerId(e.target.value)}
                                >
                                    <option value="" style={{ background: '#111827' }}>Vendedor (Loja/Eu)</option>
                                    {employees.map(e => (
                                        <option key={e.id} value={e.id} style={{ background: '#111827' }}>
                                            {e.name} {e.commission_percentage > 0 ? `(${e.commission_percentage}%)` : ''}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.5rem' }}>
                                {['PIX', 'CREDIT', 'DEBIT', 'CASH'].map(method => (
                                    <button key={method} onClick={() => setPaymentMethod(method)} style={{ padding: '0.5rem', borderRadius: '8px', fontSize: '0.7rem', fontWeight: 700, border: paymentMethod === method ? '1px solid var(--color-primary)' : '1px solid rgba(255,255,255,0.1)', background: paymentMethod === method ? 'rgba(16, 185, 129, 0.1)' : 'transparent', color: paymentMethod === method ? 'var(--color-primary)' : '#9ca3af', cursor: 'pointer', transition: 'all 0.2s' }}>{method === 'CREDIT' ? 'CRÉD' : method === 'DEBIT' ? 'DÉB' : method === 'CASH' ? 'DIN' : method}</button>
                                ))}
                            </div>

                            {/* Discount Section */}
                            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                <div style={{ display: 'flex', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', padding: '2px' }}>
                                    <button
                                        onClick={() => setDiscountType('FIXED')}
                                        style={{ padding: '8px 12px', border: 'none', background: discountType === 'FIXED' ? 'rgba(255,255,255,0.1)' : 'transparent', color: discountType === 'FIXED' ? 'white' : '#6b7280', borderRadius: '6px', cursor: 'pointer', fontWeight: 600, fontSize: '0.9rem' }}
                                    >R$</button>
                                    <button
                                        onClick={() => setDiscountType('PERCENTAGE')}
                                        style={{ padding: '8px 12px', border: 'none', background: discountType === 'PERCENTAGE' ? 'rgba(255,255,255,0.1)' : 'transparent', color: discountType === 'PERCENTAGE' ? 'white' : '#6b7280', borderRadius: '6px', cursor: 'pointer', fontWeight: 600, fontSize: '0.9rem' }}
                                    >%</button>
                                </div>
                                <div style={{ flex: 1, position: 'relative' }}>
                                    <input
                                        type="number"
                                        value={discountValue || ''}
                                        onChange={(e) => setDiscountValue(parseFloat(e.target.value) || 0)}
                                        placeholder="Desconto"
                                        style={{ ...inputStyle, paddingRight: '2.5rem' }}
                                        min="0"
                                    />
                                    <div style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: '#6b7280' }}>
                                        {discountType === 'FIXED' ? 'R$' : '%'}
                                    </div>
                                </div>
                            </div>

                            {/* Totals */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', padding: '0.5rem 0', borderTop: '1px dashed rgba(255,255,255,0.1)' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#9ca3af', fontSize: '0.8rem' }}>
                                    <span>Subtotal</span>
                                    <span>R$ {cartSubtotal.toFixed(2)}</span>
                                </div>
                                {finalDiscount > 0 && (
                                    <div style={{ display: 'flex', justifyContent: 'space-between', color: '#ef4444', fontSize: '0.8rem' }}>
                                        <span>Desconto</span>
                                        <span>- R$ {finalDiscount.toFixed(2)}</span>
                                    </div>
                                )}
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: '0.25rem' }}>
                                    <span style={{ color: '#d1d5db', fontSize: '0.9rem', fontWeight: 600 }}>Total Final</span>
                                    <span style={{ fontSize: '1.5rem', fontWeight: 800, color: 'white' }}>R$ {finalTotal.toFixed(2)}</span>
                                </div>
                            </div>

                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                <Button
                                    onClick={() => handleCheckout('quote')}
                                    disabled={processing || cart.length === 0}
                                    style={{ flex: 1, height: '56px', fontSize: '0.9rem', fontWeight: 700, background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }}
                                >
                                    <FileText size={16} style={{ marginRight: '4px' }} />
                                    {processing ? "..." : "Orçar"}
                                </Button>
                                <Button
                                    onClick={() => handleCheckout('completed')}
                                    disabled={processing || cart.length === 0}
                                    style={{ flex: 2, height: '56px', fontSize: '1.125rem', fontWeight: 700, background: 'linear-gradient(90deg, #10b981, #0d9488)', boxShadow: '0 4px 14px 0 rgba(16, 185, 129, 0.3)' }}
                                >
                                    {processing ? "Processando..." : (editingSaleId ? "ATUALIZAR" : "FINALIZAR")}
                                </Button>
                            </div>
                        </div>
                    </div>

                    {/* Variant Selector Modal */}
                    {variantModalOpen && productForVariantSel && (
                        <div style={{ position: 'fixed', inset: 0, zIndex: 100, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', animation: 'fadeIn 0.2s' }}>
                            <div style={{ ...glassStyle, width: '100%', maxWidth: '400px', padding: '1.5rem', background: 'rgba(20, 20, 20, 0.9)', position: 'relative' }}>
                                <button onClick={() => setVariantModalOpen(false)} style={{ position: 'absolute', right: '1rem', top: '1rem', background: 'transparent', border: 'none', color: 'gray', cursor: 'pointer' }}><X size={20} /></button>
                                <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'white', marginBottom: '1.5rem' }}>Selecione o Tamanho</h3>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                                    {productForVariantSel.product_variants.map(v => (
                                        <button key={v.id} onClick={() => addToCart(productForVariantSel, v.id, v.size)} disabled={v.stock_quantity <= 0} style={{ padding: '1rem', borderRadius: '8px', border: v.stock_quantity > 0 ? '1px solid rgba(255,255,255,0.2)' : '1px solid rgba(220, 38, 38, 0.3)', background: v.stock_quantity > 0 ? 'rgba(255,255,255,0.05)' : 'rgba(220, 38, 38, 0.1)', color: v.stock_quantity > 0 ? 'white' : '#ef4444', cursor: v.stock_quantity > 0 ? 'pointer' : 'not-allowed', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                                            <span style={{ fontSize: '1.25rem', fontWeight: 700 }}>{v.size}</span>
                                            <span style={{ fontSize: '0.75rem', opacity: 0.7 }}>{v.stock_quantity} disp.</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            ) : (
                // HISTORY MODE
                <div style={{ flex: 1, ...glassStyle, padding: '0', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>

                    {/* History Tabs */}
                    <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', gap: '2rem' }}>
                        <button
                            onClick={() => setHistoryTab('SALES')}
                            style={{ background: 'transparent', border: 'none', color: historyTab === 'SALES' ? 'white' : '#9ca3af', fontWeight: 700, fontSize: '1rem', cursor: 'pointer', paddingBottom: '4px', borderBottom: historyTab === 'SALES' ? '2px solid var(--color-primary)' : '2px solid transparent' }}
                        >
                            Vendas Concluídas
                        </button>
                        <button
                            onClick={() => setHistoryTab('QUOTES')}
                            style={{ background: 'transparent', border: 'none', color: historyTab === 'QUOTES' ? 'white' : '#9ca3af', fontWeight: 700, fontSize: '1rem', cursor: 'pointer', paddingBottom: '4px', borderBottom: historyTab === 'QUOTES' ? '2px solid var(--color-primary)' : '2px solid transparent' }}
                        >
                            Orçamentos Salvos
                        </button>
                    </div>

                    <div style={{ flex: 1, overflowY: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead style={{ background: 'rgba(255,255,255,0.02)' }}>
                                <tr>
                                    <th style={{ padding: '1rem', textAlign: 'left', color: '#9ca3af', fontSize: '0.8rem', textTransform: 'uppercase' }}>ID / Data</th>
                                    <th style={{ padding: '1rem', textAlign: 'left', color: '#9ca3af', fontSize: '0.8rem', textTransform: 'uppercase' }}>Cliente</th>
                                    <th style={{ padding: '1rem', textAlign: 'left', color: '#9ca3af', fontSize: '0.8rem', textTransform: 'uppercase' }}>Vendedor</th>
                                    <th style={{ padding: '1rem', textAlign: 'left', color: '#9ca3af', fontSize: '0.8rem', textTransform: 'uppercase' }}>Itens</th>
                                    <th style={{ padding: '1rem', textAlign: 'left', color: '#9ca3af', fontSize: '0.8rem', textTransform: 'uppercase' }}>Pagamento</th>
                                    <th style={{ padding: '1rem', textAlign: 'right', color: '#9ca3af', fontSize: '0.8rem', textTransform: 'uppercase' }}>Total</th>
                                    <th style={{ padding: '1rem', textAlign: 'right', color: '#9ca3af', fontSize: '0.8rem', textTransform: 'uppercase' }}>Ações</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredHistory.map(sale => (
                                    <tr key={sale.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', transition: 'background 0.2s' }} onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'} onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}>
                                        <td style={{ padding: '1rem', color: 'white' }}>
                                            <div style={{ fontWeight: 700 }}>#{sale.id.slice(0, 8)}</div>
                                            <div style={{ fontSize: '0.8rem', color: '#9ca3af' }}>{new Date(sale.created_at).toLocaleDateString()} {new Date(sale.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</div>
                                        </td>
                                        <td style={{ padding: '1rem', color: '#d1d5db' }}>
                                            {sale.clients?.name || 'Cliente Balcão'}
                                        </td>
                                        <td style={{ padding: '1rem', color: '#d1d5db' }}>
                                            {sale.employees?.name || '-'}
                                        </td>
                                        <td style={{ padding: '1rem', color: '#9ca3af', fontSize: '0.85rem' }}>
                                            {sale.sale_items?.map((si: any, idx: number) => (
                                                <div key={idx}>
                                                    {si.quantity}x {si.products?.name || si.services?.name || 'Item'}
                                                </div>
                                            ))}
                                            {sale.discount > 0 && (
                                                <div style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: '4px' }}>
                                                    - Desconto: R$ {sale.discount.toFixed(2)}
                                                </div>
                                            )}
                                        </td>
                                        <td style={{ padding: '1rem' }}>
                                            <span style={{ padding: '4px 8px', borderRadius: '4px', background: 'rgba(255,255,255,0.05)', fontSize: '0.8rem', color: '#d1d5db' }}>
                                                {sale.payment_method}
                                            </span>
                                        </td>
                                        <td style={{ padding: '1rem', textAlign: 'right', color: '#34d399', fontWeight: 700 }}>
                                            R$ {sale.total_amount.toFixed(2)}
                                        </td>
                                        <td style={{ padding: '1rem', textAlign: 'right' }}>
                                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                                                <Button
                                                    title="Imprimir Recibo"
                                                    onClick={() => { setSelectedSaleForReceipt(sale); setReceiptModalOpen(true); }}
                                                    style={{ padding: '8px', height: 'auto', background: 'rgba(59, 130, 246, 0.1)', border: 'none', color: '#3b82f6' }}
                                                >
                                                    <Printer size={16} />
                                                </Button>

                                                {historyTab === 'QUOTES' && (
                                                    <Button
                                                        title="Converter em Venda"
                                                        onClick={() => setPendingAction({ type: 'CONVERT', sale })}
                                                        style={{ padding: '8px', height: 'auto', background: 'rgba(16, 185, 129, 0.1)', border: 'none', color: '#10b981' }}
                                                    >
                                                        <CheckCircle size={16} />
                                                    </Button>
                                                )}

                                                <Button
                                                    title="Editar"
                                                    onClick={() => setPendingAction({ type: 'EDIT', sale })}
                                                    style={{ padding: '8px', height: 'auto', background: 'rgba(251, 191, 36, 0.1)', border: 'none', color: '#fbbf24' }}
                                                >
                                                    <Edit size={16} />
                                                </Button>
                                                <Button
                                                    title="Cancelar/Excluir"
                                                    onClick={() => setPendingAction({ type: 'DELETE', sale })}
                                                    style={{ padding: '8px', height: 'auto', background: 'rgba(239, 68, 68, 0.1)', border: 'none', color: '#ef4444' }}
                                                >
                                                    <Trash2 size={16} />
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {filteredHistory.length === 0 && (
                                    <tr>
                                        <td colSpan={6} style={{ padding: '2rem', textAlign: 'center', color: '#6b7280' }}>
                                            Nenhum registro encontrado.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Confirmation Modal */}
            {pendingAction && (
                <div style={{ position: 'fixed', inset: 0, zIndex: 100, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', animation: 'fadeIn 0.2s' }}>
                    <div style={{ ...glassStyle, width: '100%', maxWidth: '400px', padding: '1.5rem', background: 'rgba(20, 20, 20, 0.9)', position: 'relative', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        <div>
                            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'white', marginBottom: '0.5rem' }}>
                                {pendingAction.type === 'EDIT' || pendingAction.type === 'CONVERT' ? 'Carregar Venda?' : 'Cancelar Venda?'}
                            </h3>
                            <p style={{ color: '#9ca3af', fontSize: '0.9rem', lineHeight: '1.5' }}>
                                {pendingAction.type === 'DELETE'
                                    ? 'Isso irá CANCELAR a venda permanentemente. Se for uma venda concluída, os itens voltarão ao estoque.'
                                    : 'Os itens serão carregados no carrinho para ajustes. A versão original será substituída ao finalizar.'}
                            </p>
                        </div>
                        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                            <Button
                                onClick={() => setPendingAction(null)}
                                style={{ background: 'transparent', color: '#d1d5db', border: '1px solid rgba(255,255,255,0.1)' }}
                            >
                                Cancelar
                            </Button>
                            <Button
                                onClick={confirmAction}
                                disabled={processing}
                                style={{
                                    background: pendingAction.type === 'DELETE' ? '#ef4444' : '#10b981',
                                    color: 'white',
                                    fontWeight: 700
                                }}
                            >
                                {processing ? 'Processando...' : 'Confirmar'}
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
