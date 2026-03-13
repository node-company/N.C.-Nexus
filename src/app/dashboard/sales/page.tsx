"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import { Search, ShoppingCart, Trash2, Plus, Minus, Package, X, Briefcase, Edit, History, Store, FileText, Printer, CheckCircle, Percent, MessageSquare } from "lucide-react";
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
    const [viewMode, setViewMode] = useState<'POS' | 'PENDING' | 'HISTORY'>('POS');
    const [mobileTab, setMobileTab] = useState<'CATALOG' | 'CART'>('CATALOG');
    const [pendingTab, setPendingTab] = useState<'FIADO' | 'CATALOG' | 'QUOTES'>('FIADO');
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
    const filteredHistory = salesHistory.filter(s => {
        if (viewMode === 'HISTORY') return s.status === 'completed';
        if (viewMode === 'PENDING') {
            if (pendingTab === 'FIADO') return s.payment_method === 'FIADO' && s.status === 'pending';
            if (pendingTab === 'CATALOG') return s.status === 'pending' && s.payment_method !== 'FIADO';
            if (pendingTab === 'QUOTES') return s.status === 'quote';
        }
        return false;
    });

    // UI States
    const [searchTerm, setSearchTerm] = useState("");
    const [cart, setCart] = useState<CartItem[]>([]);
    const [selectedClient, setSelectedClient] = useState<string>("");
    const [selectedSellerId, setSelectedSellerId] = useState<string>("");
    const [paymentMethod, setPaymentMethod] = useState<string>("PIX");
    const [filterType, setFilterType] = useState<'ALL' | 'PRODUCT' | 'SERVICE'>('ALL');

    // Client Selection Mode
    const [isManualClient, setIsManualClient] = useState(false);
    const [manualClientName, setManualClientName] = useState("");

    // Discount State
    const [discountType, setDiscountType] = useState<'FIXED' | 'PERCENTAGE'>('FIXED');
    const [discountValue, setDiscountValue] = useState<number>(0);
    const [installments, setInstallments] = useState<number>(1);

    // Variant Selection Modal
    const [variantModalOpen, setVariantModalOpen] = useState(false);
    const [productForVariantSel, setProductForVariantSel] = useState<Product | null>(null);

    // Receipt Modal
    const [receiptModalOpen, setReceiptModalOpen] = useState(false);
    const [selectedSaleForReceipt, setSelectedSaleForReceipt] = useState<any>(null);

    // Checkout State
    const [processing, setProcessing] = useState(false);

    const [notification, setNotification] = useState<string | null>(null);
    const [showMobileSearch, setShowMobileSearch] = useState(false);

    // Notification Timer
    useEffect(() => {
        if (notification) {
            const timer = setTimeout(() => setNotification(null), 2000);
            return () => clearTimeout(timer);
        }
    }, [notification]);

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
        if (viewMode === 'HISTORY' || viewMode === 'PENDING') {
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
            .select(`
                id, created_at, total_amount, status, payment_method, customer_name, customer_phone, discount, installments, paid_installments,
                clients(name, document), 
                employees(name), 
                sale_items(*, products(name), services(name), product_variants(size))
            `)
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
        setNotification(`${item.name} adicionado!`);
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
                    client_id: (!isManualClient && selectedClient) ? selectedClient : null,
                    customer_name: isManualClient ? manualClientName : null,
                    total_amount: finalTotal,
                    discount: finalDiscount,
                    payment_method: paymentMethod,
                    status: (targetStatus === 'completed' && paymentMethod === 'FIADO') ? 'pending' : targetStatus,
                    employee_id: selectedSellerId || null,
                    commission_amount: 0,
                    installments: paymentMethod === 'FIADO' ? installments : 1,
                    paid_installments: 0
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

    const handleMarkInstallmentPaid = async (sale: any) => {
        if (sale.paid_installments >= sale.installments) return;
        setProcessing(true);
        try {
            const newPaid = sale.paid_installments + 1;
            const isCompleted = newPaid >= sale.installments;
            
            const { error } = await supabase.from("sales").update({ 
                paid_installments: newPaid,
                status: isCompleted ? 'completed' : 'pending'
            }).eq("id", sale.id);

            if (error) throw error;
            fetchHistory();
            alert(isCompleted ? "Venda concluída!" : "Parcela marcada como paga!");
        } catch (error) {
            console.error(error);
            alert("Erro ao atualizar parcelas.");
        } finally {
            setProcessing(false);
        }
    };

    const handleCompleteSale = async (saleId: string) => {
        setProcessing(true);
        try {
            const { error } = await supabase.from("sales").update({ 
                status: 'completed'
            }).eq("id", saleId);
            if (error) throw error;
            fetchHistory();
            alert("Venda concluída!");
        } catch (error) {
            console.error(error);
            alert("Erro ao concluir venda.");
        } finally {
            setProcessing(false);
        }
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

        <div style={{ 
            minHeight: 'calc(100vh - 2rem)', 
            display: 'flex', 
            flexDirection: 'column', 
            gap: '1rem', 
            padding: '1rem 0',
            width: '100%',
            maxWidth: '100%',
            margin: '0 auto',
            overflowX: 'hidden',
            boxSizing: 'border-box',
            animation: 'fadeIn 0.5s ease',
            position: 'relative'
        }}>

            <ReceiptModal
                isOpen={receiptModalOpen}
                onClose={() => setReceiptModalOpen(false)}
                sale={selectedSaleForReceipt}
                companySettings={companySettings}
            />

            {/* Top Bar with Tabs */}
            <div style={{ 
                display: 'flex', 
                flexDirection: 'column',
                alignItems: 'stretch', 
                gap: '1rem',
                width: '100%',
                boxSizing: 'border-box'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <h1 style={{ fontSize: '1.75rem', fontWeight: 800, background: 'linear-gradient(to right, white, #9ca3af)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', margin: 0 }}>
                        {editingSaleId ? `Venda #${editingSaleId.slice(0, 8)}` : 'Vendas'}
                    </h1>
                </div>

                <div className="mobile-tabs-scroll" style={{ 
                    display: 'flex', 
                    background: 'rgba(255,255,255,0.05)', 
                    borderRadius: '12px', 
                    padding: '4px',
                    flexShrink: 1,
                    width: '100%',
                    maxWidth: '100%',
                    overflowX: 'auto',
                    WebkitOverflowScrolling: 'touch',
                    minWidth: 0,
                    justifyContent: 'center' // Center tabs if space allows
                }}>
                    <button
                        onClick={() => {
                            if (editingSaleId && !confirm("Sair sem salvar?")) return;
                            setEditingSaleId(null); setCart([]); setDiscountValue(0); setViewMode('POS');
                        }}
                        style={{
                            padding: '6px 16px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem',
                            background: viewMode === 'POS' ? 'var(--color-primary)' : 'transparent', color: viewMode === 'POS' ? 'white' : '#9ca3af', transition: 'all 0.2s',
                            whiteSpace: 'nowrap'
                        }}
                    >
                        <Store size={16} /> Nova Venda
                    </button>
                    <button
                        onClick={() => {
                            if (editingSaleId && !confirm("Sair sem salvar?")) return;
                            setEditingSaleId(null); setCart([]); setDiscountValue(0); setViewMode('PENDING');
                        }}
                        style={{
                            padding: '6px 16px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem',
                            background: viewMode === 'PENDING' ? 'var(--color-primary)' : 'transparent', color: viewMode === 'PENDING' ? 'white' : '#9ca3af', transition: 'all 0.2s',
                            whiteSpace: 'nowrap'
                        }}
                    >
                        <MessageSquare size={16} /> Pendentes
                    </button>
                    <button
                        onClick={() => {
                            if (editingSaleId && !confirm("Sair sem salvar?")) return;
                            setEditingSaleId(null); setCart([]); setDiscountValue(0); setViewMode('HISTORY');
                        }}
                        style={{
                            padding: '6px 16px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem',
                            background: viewMode === 'HISTORY' ? 'var(--color-primary)' : 'transparent', color: viewMode === 'HISTORY' ? 'white' : '#9ca3af', transition: 'all 0.2s',
                            whiteSpace: 'nowrap'
                        }}
                    >
                        <History size={16} /> Histórico
                    </button>
                </div>
            </div>

            {/* Content Switch */}
            {/* Content Switch */}
            {
                viewMode === 'POS' ? (
                    <div className="sales-container mobile-stack" style={{ display: 'flex', flexDirection: 'row', gap: '1rem', flex: 1, padding: 0, height: '100%', overflow: 'hidden' }}>

                        {/* Mobile Tab Switcher */}
                        <div className="mobile-only" style={{ display: 'flex', gap: '1rem', marginBottom: '1rem', width: '100%' }}>
                            <button
                                onClick={() => setMobileTab('CATALOG')}
                                style={{
                                    flex: 1, padding: '12px', borderRadius: '8px', border: 'none', fontWeight: 700,
                                    background: mobileTab === 'CATALOG' ? 'var(--color-primary)' : 'rgba(255,255,255,0.05)',
                                    color: mobileTab === 'CATALOG' ? 'black' : '#9ca3af'
                                }}
                            >
                                Catálogo
                            </button>
                            <button
                                onClick={() => setMobileTab('CART')}
                                style={{
                                    flex: 1, padding: '12px', borderRadius: '8px', border: 'none', fontWeight: 700,
                                    background: mobileTab === 'CART' ? 'var(--color-primary)' : 'rgba(255,255,255,0.05)',
                                    color: mobileTab === 'CART' ? 'black' : '#9ca3af',
                                    position: 'relative'
                                }}
                            >
                                Carrinho
                                {cart.length > 0 && <span style={{ position: 'absolute', top: -5, right: -5, background: '#ef4444', color: 'white', fontSize: '0.7rem', width: '20px', height: '20px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{cart.length}</span>}
                            </button>
                        </div>

                        {/* Left: Product/Service Catalog */}
                        <div className={`sales-catalog ${mobileTab === 'CART' ? 'mobile-hidden' : ''} mobile-full-width`} style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                            {/* Filter & Search Bar */}
                            <div style={{ ...glassStyle, borderRadius: '12px', padding: '0.75rem', display: 'flex', alignItems: 'center', gap: '1rem', background: 'rgba(0,0,0,0.2)' }}>
                                <div className={showMobileSearch ? 'mobile-hidden' : ''} style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', flex: 1, minWidth: 0 }}>
                                    <button onClick={() => setFilterType('ALL')} style={{ padding: '6px 10px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 600, border: 'none', cursor: 'pointer', background: filterType === 'ALL' ? 'var(--color-primary)' : 'rgba(255,255,255,0.05)', color: filterType === 'ALL' ? 'white' : '#9ca3af', whiteSpace: 'nowrap', flexShrink: 0 }}>Todos</button>
                                    <button onClick={() => setFilterType('PRODUCT')} style={{ padding: '6px 10px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 600, border: 'none', cursor: 'pointer', background: filterType === 'PRODUCT' ? 'var(--color-primary)' : 'rgba(255,255,255,0.05)', color: filterType === 'PRODUCT' ? 'white' : '#9ca3af', whiteSpace: 'nowrap', flexShrink: 0 }}>Prod.</button>
                                    <button onClick={() => setFilterType('SERVICE')} style={{ padding: '6px 10px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 600, border: 'none', cursor: 'pointer', background: filterType === 'SERVICE' ? 'var(--color-primary)' : 'rgba(255,255,255,0.05)', color: filterType === 'SERVICE' ? 'white' : '#9ca3af', whiteSpace: 'nowrap', flexShrink: 0 }}>Serv.</button>
                                </div>
                                <div className="desktop-only" style={{ height: '24px', width: '1px', background: 'rgba(255,255,255,0.1)' }}></div>

                                {/* Search Logic */}
                                <div className="mobile-only" style={{ display: 'flex', alignItems: 'center', flex: showMobileSearch ? 1 : 0, transition: 'all 0.3s' }}>
                                    {showMobileSearch ? (
                                        <div style={{ display: 'flex', alignItems: 'center', width: '100%', background: 'rgba(0,0,0,0.3)', borderRadius: '8px', padding: '0 8px', border: '1px solid rgba(255,255,255,0.1)' }}>
                                            <Search size={16} style={{ color: '#9ca3af' }} />
                                            <input
                                                autoFocus
                                                type="text"
                                                placeholder="Buscar..."
                                                style={{ background: 'transparent', border: 'none', outline: 'none', color: 'white', width: '100%', padding: '8px', fontSize: '0.9rem' }}
                                                value={searchTerm}
                                                onChange={(e) => setSearchTerm(e.target.value)}
                                                onBlur={() => !searchTerm && setShowMobileSearch(false)}
                                            />
                                            <button onClick={() => { setSearchTerm(''); setShowMobileSearch(false); }} style={{ background: 'transparent', border: 'none', color: '#6b7280', padding: '4px' }}><X size={14} /></button>
                                        </div>
                                    ) : (
                                        <button
                                            onClick={() => setShowMobileSearch(true)}
                                            style={{ background: 'transparent', border: 'none', color: searchTerm ? 'var(--color-primary)' : '#9ca3af', padding: '8px' }}
                                        >
                                            <Search size={22} />
                                        </button>
                                    )}
                                </div>

                                {/* Desktop Search (Always Visible) */}
                                <div className="desktop-only" style={{ display: 'flex', alignItems: 'center', marginLeft: '1rem', flex: 1 }}>
                                    <Search style={{ color: '#9ca3af', marginRight: '0.75rem', minWidth: '20px' }} size={20} />
                                    <input type="text" placeholder="Buscar..." style={{ background: 'transparent', border: 'none', outline: 'none', color: 'white', width: '100%', fontSize: '1rem' }} value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                                </div>
                            </div>

                            {/* Catalog Grid */}
                            <div style={{ flex: 1, overflowY: 'auto', paddingRight: '0.5rem', marginTop: '1rem', width: '100%', boxSizing: 'border-box' }}>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: '0.5rem' }}>
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
                                            <div key={item.id} onClick={() => addToCart(item)} style={{ ...glassStyle, padding: '0.75rem', cursor: 'pointer', transition: 'transform 0.2s', position: 'relative' }} onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.02)'} onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}>
                                                <div style={{ aspectRatio: '1/1', background: 'rgba(0,0,0,0.2)', borderRadius: '8px', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                                                    {item.image_url ? <img src={item.image_url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : (isProduct ? <Package style={{ color: '#4b5563' }} size={24} /> : <Briefcase style={{ color: '#4b5563' }} size={24} />)}
                                                </div>
                                                <h3 style={{ fontWeight: 600, color: 'white', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontSize: '0.8rem', marginBottom: '2px' }}>{item.name}</h3>
                                                <p style={{ color: '#34d399', fontWeight: 700, fontSize: '0.9rem', margin: 0 }}>R$ {item.price.toFixed(2)}</p>
                                                <div style={{ position: 'absolute', top: '0.5rem', right: '0.5rem', background: 'rgba(0,0,0,0.6)', padding: '2px 4px', borderRadius: '4px', fontSize: '0.65rem', color: isProduct && (parseInt(stockDisplay) || 0) <= 0 ? '#ef4444' : isProduct ? '#d1d5db' : '#60a5fa', backdropFilter: 'blur(4px)' }}>{stockDisplay}</div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>

                        {/* Right: Cart & Checkout */}
                        <div className={`sales-cart ${mobileTab === 'CATALOG' ? 'mobile-hidden' : ''} mobile-full-width`} style={{ ...glassStyle, background: 'rgba(0,0,0,0.2)', width: '400px', display: 'flex', flexDirection: 'column' }}>
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
                                    <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
                                        <button
                                            onClick={() => setIsManualClient(false)}
                                            style={{ flex: 1, padding: '8px', fontSize: '0.8rem', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.1)', background: !isManualClient ? 'rgba(16, 185, 129, 0.1)' : 'transparent', color: !isManualClient ? '#34d399' : '#6b7280', fontWeight: 600 }}
                                        >Cadastrado</button>
                                        <button
                                            onClick={() => setIsManualClient(true)}
                                            style={{ flex: 1, padding: '8px', fontSize: '0.8rem', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.1)', background: isManualClient ? 'rgba(16, 185, 129, 0.1)' : 'transparent', color: isManualClient ? '#34d399' : '#6b7280', fontWeight: 600 }}
                                        >Manual/Avulso</button>
                                    </div>

                                    {isManualClient ? (
                                        <input
                                            type="text"
                                            placeholder="Nome do Cliente"
                                            value={manualClientName}
                                            onChange={(e) => setManualClientName(e.target.value)}
                                            style={{ ...inputStyle, background: 'rgba(255,255,255,0.05)' }}
                                        />
                                    ) : (
                                        <select style={{ ...inputStyle, background: 'rgba(255,255,255,0.05)', cursor: 'pointer' }} value={selectedClient} onChange={(e) => setSelectedClient(e.target.value)}>
                                            <option value="" style={{ background: '#111827' }}>Cliente (Opcional)</option>
                                            {clients.map(c => <option key={c.id} value={c.id} style={{ background: '#111827' }}>{c.name}</option>)}
                                        </select>
                                    )}
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

                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '0.4rem' }}>
                                    {['PIX', 'CREDIT', 'DEBIT', 'CASH', 'FIADO'].map(method => (
                                        <button key={method} onClick={() => setPaymentMethod(method)} style={{ padding: '0.5rem', borderRadius: '8px', fontSize: '0.65rem', fontWeight: 700, border: paymentMethod === method ? '1px solid var(--color-primary)' : '1px solid rgba(255,255,255,0.1)', background: paymentMethod === method ? 'rgba(16, 185, 129, 0.1)' : 'transparent', color: paymentMethod === method ? 'var(--color-primary)' : '#9ca3af', cursor: 'pointer', transition: 'all 0.2s', whiteSpace: 'nowrap' }}>
                                            {method === 'CREDIT' ? 'CRÉD' : method === 'DEBIT' ? 'DÉB' : method === 'CASH' ? 'DIN' : method === 'FIADO' ? 'FIADO' : method}
                                        </button>
                                    ))}
                                </div>

                                {paymentMethod === 'FIADO' && (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                                        <label style={{ fontSize: '0.75rem', color: '#9ca3af', fontWeight: 600 }}>Número de Parcelas</label>
                                        <input
                                            type="number"
                                            min="1"
                                            max="48"
                                            value={installments}
                                            onChange={(e) => setInstallments(Math.max(1, parseInt(e.target.value) || 1))}
                                            style={{ ...inputStyle, padding: '8px', fontSize: '0.9rem' }}
                                            placeholder="Ex: 3"
                                        />
                                    </div>
                                )}

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
                    <div style={{ 
                        flex: 1, 
                        ...glassStyle, 
                        padding: '0', 
                        display: 'flex', 
                        flexDirection: 'column', 
                        width: '100%',
                        maxWidth: '100%', 
                        boxSizing: 'border-box',
                        overflow: 'hidden' 
                    }}>

                        {viewMode === 'PENDING' ? (
                            <div style={{ 
                                padding: '0.75rem 0.5rem', 
                                borderBottom: '1px solid rgba(255,255,255,0.05)', 
                                display: 'flex', 
                                gap: '0.75rem', 
                                overflowX: 'auto', 
                                width: '100%', 
                                boxSizing: 'border-box', 
                                WebkitOverflowScrolling: 'touch',
                                justifyContent: 'center' // Centering sub-tabs
                            }}>
                                <button
                                    onClick={() => setPendingTab('FIADO')}
                                    style={{ background: 'transparent', border: 'none', color: pendingTab === 'FIADO' ? '#fbbf24' : '#9ca3af', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer', paddingBottom: '4px', borderBottom: pendingTab === 'FIADO' ? '2px solid #fbbf24' : '2px solid transparent', whiteSpace: 'nowrap' }}
                                >
                                    Fiado {salesHistory.filter(s => s.status === 'pending' && s.payment_method === 'FIADO').length > 0 && `(${salesHistory.filter(s => s.status === 'pending' && s.payment_method === 'FIADO').length})`}
                                </button>
                                <button
                                    onClick={() => setPendingTab('CATALOG')}
                                    style={{ background: 'transparent', border: 'none', color: pendingTab === 'CATALOG' ? 'white' : '#9ca3af', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer', paddingBottom: '4px', borderBottom: pendingTab === 'CATALOG' ? '2px solid var(--color-primary)' : '2px solid transparent', whiteSpace: 'nowrap' }}
                                >
                                    Pendente {salesHistory.filter(s => s.status === 'pending' && s.payment_method !== 'FIADO').length > 0 && `(${salesHistory.filter(s => s.status === 'pending' && s.payment_method !== 'FIADO').length})`}
                                </button>
                                <button
                                    onClick={() => setPendingTab('QUOTES')}
                                    style={{ background: 'transparent', border: 'none', color: pendingTab === 'QUOTES' ? 'white' : '#9ca3af', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer', paddingBottom: '4px', borderBottom: pendingTab === 'QUOTES' ? '2px solid var(--color-primary)' : '2px solid transparent', whiteSpace: 'nowrap' }}
                                >
                                    Orçamentos {salesHistory.filter(s => s.status === 'quote').length > 0 && `(${salesHistory.filter(s => s.status === 'quote').length})`}
                                </button>
                            </div>
                        ) : (
                                <div style={{ 
                                    padding: '0.75rem 0.5rem', 
                                    borderBottom: '1px solid rgba(255,255,255,0.05)', 
                                    display: 'flex', 
                                    gap: '0.75rem', 
                                    overflowX: 'auto', 
                                    width: '100%', 
                                    boxSizing: 'border-box', 
                                    WebkitOverflowScrolling: 'touch',
                                    justifyContent: 'center' // Centering header
                                }}>
                                    <div style={{ color: 'white', fontWeight: 700, fontSize: '0.85rem', paddingBottom: '4px', borderBottom: '2px solid var(--color-primary)', whiteSpace: 'nowrap' }}>Histórico de Vendas Concluídas</div>
                                </div>
                        )}

                        {/* Desktop Table */}
                        <div className="desktop-table-view" style={{ flex: 1, overflowY: 'auto' }}>
                            <div className="table-responsive">
                                <table style={{ width: '100%', minWidth: '800px', borderCollapse: 'collapse' }}>
                                    <thead style={{ background: 'rgba(255,255,255,0.02)' }}>
                                        <tr>
                                            <th className="responsive-table-header">ID / Data</th>
                                            <th className="responsive-table-header">Cliente</th>
                                            <th className="responsive-table-header">Vendedor</th>
                                            <th className="responsive-table-header">Itens</th>
                                            <th className="responsive-table-header">Pagamento</th>
                                            <th className="responsive-table-header" style={{ textAlign: 'right' }}>Total</th>
                                            <th className="responsive-table-header" style={{ textAlign: 'right' }}>Ações</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredHistory.map(sale => (
                                            <tr key={sale.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', transition: 'background 0.2s' }} onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'} onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}>
                                                <td className="responsive-table-cell">
                                                    <div style={{ fontWeight: 700 }}>#{sale.id.slice(0, 8)}</div>
                                                    <div style={{ fontSize: '0.8rem', color: '#9ca3af' }}>{new Date(sale.created_at).toLocaleDateString()} {new Date(sale.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</div>
                                                </td>
                                                <td className="responsive-table-cell" style={{ color: '#d1d5db' }}>
                                                    <div style={{ fontWeight: 700 }}>{sale.clients?.name || sale.customer_name || 'Cliente Balcão'}</div>
                                                    {sale.customer_phone ? (
                                                        <div style={{ fontSize: '0.8rem', color: '#9ca3af' }}>{sale.customer_phone}</div>
                                                    ) : (
                                                        <div style={{ fontSize: '0.7rem', color: '#4b5563', fontStyle: 'italic' }}>Sem telefone</div>
                                                    )}
                                                </td>
                                                <td className="responsive-table-cell" style={{ color: '#d1d5db' }}>
                                                    {sale.employees?.name || '-'}
                                                </td>
                                                <td className="responsive-table-cell" style={{ color: '#9ca3af', fontSize: '0.85rem' }}>
                                                    {sale.sale_items?.map((si: any, idx: number) => (
                                                        <div key={idx}>
                                                            {si.quantity}x {si.products?.name || si.services?.name || 'Item'}
                                                            {si.product_variants?.size && (
                                                                <span style={{ fontSize: '0.75rem', color: 'var(--color-primary)', marginLeft: '4px', fontWeight: 600 }}>
                                                                    ({si.product_variants.size})
                                                                </span>
                                                            )}
                                                        </div>
                                                    ))}
                                                    {sale.discount > 0 && (
                                                        <div style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: '4px' }}>
                                                            - Desconto: R$ {sale.discount.toFixed(2)}
                                                        </div>
                                                    )}
                                                </td>
                                                <td className="responsive-table-cell">
                                                    <span style={{ padding: '4px 8px', borderRadius: '4px', background: 'rgba(255,255,255,0.05)', fontSize: '0.8rem', color: '#d1d5db' }}>
                                                        {sale.payment_method}
                                                    </span>
                                                </td>
                                                <td className="responsive-table-cell" style={{ textAlign: 'right', color: '#34d399', fontWeight: 700 }}>
                                                    R$ {sale.total_amount.toFixed(2)}
                                                </td>
                                                <td className="responsive-table-cell" style={{ textAlign: 'right' }}>
                                                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                                                        <Button
                                                            title="Imprimir Recibo"
                                                            onClick={() => { setSelectedSaleForReceipt(sale); setReceiptModalOpen(true); }}
                                                            style={{ padding: '8px', height: 'auto', background: 'rgba(59, 130, 246, 0.1)', border: 'none', color: '#3b82f6' }}
                                                        >
                                                            <Printer size={16} />
                                                        </Button>

                                                        {sale.customer_phone && (
                                                            <Button
                                                                title="Abrir WhatsApp"
                                                                onClick={() => window.open(`https://wa.me/${sale.customer_phone.replace(/\D/g, '')}`, '_blank')}
                                                                style={{ padding: '8px', height: 'auto', background: 'rgba(37, 211, 102, 0.1)', border: 'none', color: '#25D366' }}
                                                            >
                                                                <MessageSquare size={16} />
                                                            </Button>
                                                        )}

                                                        {viewMode === 'PENDING' && (
                                                            <>
                                                                {pendingTab === 'FIADO' && (
                                                                    <Button
                                                                        title="Pagar Parcela"
                                                                        onClick={() => handleMarkInstallmentPaid(sale)}
                                                                        disabled={sale.paid_installments >= sale.installments}
                                                                        style={{ padding: '8px', height: 'auto', background: 'rgba(52, 211, 153, 0.1)', border: 'none', color: '#34d399' }}
                                                                    >
                                                                        <CheckCircle size={16} />
                                                                    </Button>
                                                                )}
                                                                {(pendingTab === 'CATALOG' || pendingTab === 'QUOTES') && (
                                                                    <Button
                                                                        title={pendingTab === 'CATALOG' ? "Aprovar Pedido" : "Converter em Venda"}
                                                                        onClick={() => setPendingAction({ type: 'CONVERT', sale })}
                                                                        style={{ padding: '8px', height: 'auto', background: pendingTab === 'CATALOG' ? 'rgba(59, 130, 246, 0.1)' : 'rgba(16, 185, 129, 0.1)', border: 'none', color: pendingTab === 'CATALOG' ? '#3b82f6' : '#10b981' }}
                                                                    >
                                                                        <CheckCircle size={16} />
                                                                    </Button>
                                                                )}
                                                            </>
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
                                                <td colSpan={7} style={{ padding: '2rem', textAlign: 'center', color: '#6b7280' }}>
                                                    Nenhum registro encontrado.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        <div className="mobile-card-view">
                            <div style={{ padding: '1rem', paddingBottom: '3rem', display: 'flex', flexDirection: 'column', gap: '1.25rem', width: '100%', boxSizing: 'border-box' }}>
                                {filteredHistory.map(sale => (
                                    <div key={sale.id} className="mobile-card" style={{ 
                                        background: 'rgba(255, 255, 255, 0.02)', 
                                        border: '1px solid rgba(255, 255, 255, 0.05)', 
                                        borderRadius: '16px',
                                        padding: '1rem',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        gap: '0.75rem',
                                        backdropFilter: 'blur(10px)',
                                        position: 'relative',
                                        overflow: 'hidden'
                                    }}>
                                        {/* Status Badge - Floating Top Right */}
                                        <div style={{ 
                                            position: 'absolute', top: 0, right: 0, 
                                            padding: '0.4rem 1rem', 
                                            fontSize: '0.65rem', fontWeight: 800, textTransform: 'uppercase',
                                            background: sale.status === 'quote' ? '#3b82f6' : sale.status === 'pending' ? '#fbbf24' : '#10b981',
                                            color: 'white', borderRadius: '0 0 0 12px',
                                            boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
                                        }}>
                                            {sale.status === 'quote' ? 'Orçamento' : sale.status === 'pending' ? 'Pendente' : 'Concluída'}
                                        </div>

                                        {/* Header: ID and Date */}
                                        <div style={{ marginTop: '0.25rem' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.1rem' }}>
                                                <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--color-primary)' }}></div>
                                                <span style={{ fontWeight: 800, color: 'white', fontSize: '0.9rem', letterSpacing: '0.5px' }}>#{sale.id.slice(0, 8)}</span>
                                            </div>
                                            <div style={{ fontSize: '0.8rem', color: '#9ca3af', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                                <History size={14} style={{ opacity: 0.6 }} />
                                                {new Date(sale.created_at).toLocaleDateString()} às {new Date(sale.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                                            </div>
                                        </div>

                                        {/* Body: Client & Total */}
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', background: 'rgba(0,0,0,0.2)', padding: '0.75rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.03)' }}>
                                            <div style={{ minWidth: 0 }}>
                                                <span style={{ fontSize: '0.6rem', color: '#6b7280', textTransform: 'uppercase', fontWeight: 800, display: 'block', marginBottom: '0.15rem' }}>Cliente</span>
                                                <div style={{ color: 'white', fontSize: '0.9rem', fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                    {sale.clients?.name || sale.customer_name || 'Cliente Balcão'}
                                                </div>
                                                {sale.customer_phone && <div style={{ color: '#9ca3af', fontSize: '0.75rem', marginTop: '0.1rem' }}>{sale.customer_phone}</div>}
                                            </div>
                                            <div style={{ textAlign: 'right', flexShrink: 0 }}>
                                                <span style={{ fontSize: '0.6rem', color: '#6b7280', textTransform: 'uppercase', fontWeight: 800, display: 'block', marginBottom: '0.15rem' }}>Total</span>
                                                <div style={{ fontWeight: 900, color: '#34d399', fontSize: '1.1rem' }}>R$ {sale.total_amount.toFixed(2)}</div>
                                            </div>
                                        </div>

                                        {/* Details Grid: Seller & Payment */}
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                            <div style={{ paddingLeft: '0.5rem' }}>
                                                <span style={{ fontSize: '0.65rem', color: '#6b7280', textTransform: 'uppercase', fontWeight: 800, display: 'block', marginBottom: '0.25rem' }}>Vendedor</span>
                                                <div style={{ color: '#d1d5db', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                                    <Briefcase size={14} style={{ opacity: 0.5 }} /> {sale.employees?.name || 'Loja'}
                                                </div>
                                            </div>
                                            <div>
                                                <span style={{ fontSize: '0.65rem', color: '#6b7280', textTransform: 'uppercase', fontWeight: 800, display: 'block', marginBottom: '0.25rem' }}>Pagamento</span>
                                                <div style={{ color: '#d1d5db', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                                    <div style={{ padding: '2px 8px', background: 'rgba(255,255,255,0.05)', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 700 }}>{sale.payment_method || 'N/A'}</div>
                                                    {sale.payment_method === 'FIADO' && (
                                                        <div style={{ color: '#fbbf24', fontSize: '0.75rem', fontWeight: 700 }}>{sale.paid_installments}/{sale.installments}</div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Items List */}
                                        <div style={{ background: 'rgba(255,255,255,0.02)', padding: '0.75rem', borderRadius: '12px' }}>
                                            <span style={{ fontSize: '0.65rem', color: '#6b7280', textTransform: 'uppercase', fontWeight: 800, display: 'block', marginBottom: '0.5rem' }}>Resumo dos Itens</span>
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                                                {sale.sale_items?.map((si: any, idx: number) => (
                                                    <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: '#d1d5db' }}>
                                                        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginRight: '0.5rem' }}>
                                                            {si.products?.name || si.services?.name || 'Item'}
                                                            {si.product_variants?.size && (
                                                                <span style={{ fontSize: '0.75rem', color: 'var(--color-primary)', marginLeft: '4px', fontWeight: 700 }}>
                                                                    ({si.product_variants.size})
                                                                </span>
                                                            )}
                                                        </span>
                                                        <span style={{ fontWeight: 800, color: 'var(--color-primary)', flexShrink: 0 }}>{si.quantity}x</span>
                                                    </div>
                                                ))}
                                                {sale.discount > 0 && (
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: '#ef4444', borderTop: '1px dashed rgba(239, 68, 68, 0.2)', paddingTop: '0.4rem', marginTop: '0.2rem' }}>
                                                        <span>Desconto</span>
                                                        <span style={{ fontWeight: 700 }}>- R$ {sale.discount.toFixed(2)}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Actions: Flexible layout */}
                                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                                            <button
                                                onClick={() => { setSelectedSaleForReceipt(sale); setReceiptModalOpen(true); }}
                                                style={{ flex: '1', minWidth: '40px', height: '44px', background: 'rgba(59, 130, 246, 0.1)', border: '1px solid rgba(59, 130, 246, 0.2)', color: '#3b82f6', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s' }}
                                                title="Recibo"
                                            >
                                                <Printer size={18} />
                                            </button>

                                            {sale.customer_phone && (
                                                <button
                                                    onClick={() => window.open(`https://wa.me/${sale.customer_phone.replace(/\D/g, '')}`, '_blank')}
                                                    style={{ flex: '1', minWidth: '45px', height: '48px', background: 'rgba(37, 211, 102, 0.1)', border: '1px solid rgba(37, 211, 102, 0.2)', color: '#25D366', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                                    title="WhatsApp"
                                                >
                                                    <MessageSquare size={20} />
                                                </button>
                                            )}

                                            {viewMode === 'PENDING' && (
                                                <>
                                                    {pendingTab === 'FIADO' && (
                                                        <button
                                                            onClick={() => handleMarkInstallmentPaid(sale)}
                                                            disabled={sale.paid_installments >= sale.installments}
                                                            style={{ flex: '2', minWidth: '100px', height: '48px', background: 'rgba(52, 211, 153, 0.1)', border: '1px solid rgba(52, 211, 153, 0.2)', color: '#34d399', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', fontWeight: 700, fontSize: '0.85rem' }}
                                                        >
                                                            <CheckCircle size={18} /> Pagar {sale.paid_installments + 1}ª
                                                        </button>
                                                    )}
                                                    {(pendingTab === 'CATALOG' || pendingTab === 'QUOTES') && (
                                                        <button
                                                            onClick={() => setPendingAction({ type: 'CONVERT', sale })}
                                                            style={{ flex: '2', minWidth: '100px', height: '48px', background: pendingTab === 'CATALOG' ? 'rgba(59, 130, 246, 0.1)' : 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.2)', color: pendingTab === 'CATALOG' ? '#3b82f6' : '#10b981', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', fontWeight: 700, fontSize: '0.85rem' }}
                                                        >
                                                            <CheckCircle size={18} /> {pendingTab === 'CATALOG' ? 'Aprovar' : 'Vender'}
                                                        </button>
                                                    )}
                                                </>
                                            )}

                                            <button
                                                onClick={() => setPendingAction({ type: 'EDIT', sale })}
                                                style={{ flex: '1.5', minWidth: '80px', height: '48px', background: 'rgba(251, 191, 36, 0.1)', border: '1px solid rgba(251, 191, 36, 0.2)', color: '#fbbf24', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', fontWeight: 700, fontSize: '0.85rem' }}
                                            >
                                                <Edit size={18} /> Editar
                                            </button>

                                            <button
                                                onClick={() => setPendingAction({ type: 'DELETE', sale })}
                                                style={{ flex: '1', minWidth: '45px', height: '48px', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', color: '#ef4444', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                                title="Cancelar"
                                            >
                                                <Trash2 size={20} />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                                {filteredHistory.length === 0 && (
                                    <div style={{ textAlign: 'center', color: '#6b7280', padding: '4rem 1rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
                                        <History size={48} style={{ opacity: 0.2 }} />
                                        <p>Nenhum registro encontrado nesta aba.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )
            }

            {/* Confirmation Modal */}
            {
                pendingAction && (
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
                            <div style={{ display: 'flex', gap: '1rem' }}>
                                <Button onClick={() => setPendingAction(null)} style={{ flex: 1, background: 'transparent', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }}>Cancelar</Button>
                                <Button onClick={confirmAction} style={{ flex: 1, background: 'var(--color-primary)', border: 'none', color: 'white' }}>Confirmar</Button>
                            </div>
                        </div>
                    </div>
                )
            }

            {/* Internal Notification Toast */}
            {notification && (
                <div style={{
                    position: 'fixed', bottom: '2rem', left: '50%', transform: 'translateX(-50%)',
                    background: '#10b981', color: 'white', padding: '12px 24px', borderRadius: '24px',
                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
                    zIndex: 200, fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem',
                    animation: 'fadeIn 0.3s ease-out'
                }}>
                    <CheckCircle size={18} />
                    {notification}
                </div>
            )}
        </div>
    );
}
