"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import {
    TrendingUp,
    Users,
    Package,
    Wallet,
    ShoppingCart,
    ArrowRight,
    DollarSign,
    Briefcase,
    AlertTriangle
} from "lucide-react";
import { format, subDays, startOfDay, endOfDay, eachDayOfInterval } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer
} from "recharts";

// Types
interface ChartDataPoint {
    date: string; // dd/MM
    fullDate: string; // YYYY-MM-DD (for sorting/key)
    income: number;
    expense: number;
}

interface DashboardStats {
    salesToday: { count: number; value: number };
    newClientsMonth: number;
    totalStockItems: number;
    financialBalance: number;
    chartData: ChartDataPoint[];
}

interface RecentSale {
    id: string;
    total_amount: number;
    created_at: string;
    status: string;
}

interface LowStockProduct {
    id: string;
    name: string;
    stock: number;
    image_url?: string;
}

// Custom Tooltip for Chart
// Custom Tooltip for Chart
const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        return (
            <div style={{ background: 'rgba(23, 23, 23, 0.9)', border: '1px solid rgba(255,255,255,0.1)', padding: '12px', borderRadius: '12px', backdropFilter: 'blur(4px)' }}>
                <p style={{ color: '#9ca3af', fontSize: '0.8rem', marginBottom: '8px' }}>{label}</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#34d399' }} />
                        <span style={{ color: '#d1d5db', fontSize: '0.85rem' }}>Entradas:</span>
                        <span style={{ color: '#34d399', fontWeight: 700, fontSize: '0.9rem' }}>R$ {payload[0].value?.toFixed(2)}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#f87171' }} />
                        <span style={{ color: '#d1d5db', fontSize: '0.85rem' }}>Saídas:</span>
                        <span style={{ color: '#f87171', fontWeight: 700, fontSize: '0.9rem' }}>R$ {payload[1].value?.toFixed(2)}</span>
                    </div>
                </div>
            </div>
        );
    }
    return null;
};

export default function DashboardPage() {
    const supabase = createClient();
    const router = useRouter();
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState<DashboardStats>({
        salesToday: { count: 0, value: 0 },
        newClientsMonth: 0,
        totalStockItems: 0,
        financialBalance: 0,
        chartData: []
    });
    const [recentSales, setRecentSales] = useState<RecentSale[]>([]);
    const [lowStockProducts, setLowStockProducts] = useState<LowStockProduct[]>([]);

    // Styles (Moved to component to avoid recreation if dependency array used, though static here)
    const glassStyle = {
        background: 'rgba(255, 255, 255, 0.03)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        backdropFilter: 'blur(12px)',
        borderRadius: '16px',
    };

    const cardStyle = {
        ...glassStyle,
        padding: '1.5rem',
        display: 'flex',
        flexDirection: 'column' as const,
        justifyContent: 'space-between',
        height: '100%',
        minHeight: '140px'
    };

    useEffect(() => {
        if (!user) return;

        const fetchDashboardData = async () => {
            try {
                const today = new Date();
                const todayStr = today.toISOString().split('T')[0];
                const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1).toISOString();
                const thirtyDaysAgo = subDays(today, 29); // Last 30 days range

                // 1. Sales Today
                const { data: salesTodayData } = await supabase
                    .from('sales')
                    .select('total_amount')
                    .eq('user_id', user.id)
                    .gte('created_at', `${todayStr}T00:00:00`)
                    .lte('created_at', `${todayStr}T23:59:59`)
                    .eq('status', 'completed');

                const salesCount = salesTodayData?.length || 0;
                const salesValue = salesTodayData?.reduce((acc, curr) => acc + curr.total_amount, 0) || 0;

                // 2. New Clients (Month)
                const { count: newClientsCount } = await supabase
                    .from('clients')
                    .select('*', { count: 'exact', head: true })
                    .eq('user_id', user.id)
                    .gte('created_at', firstDayOfMonth);

                // 3. Stock Items
                const { data: products } = await supabase
                    .from('products')
                    .select('id, name, stock_quantity, image_url, product_variants(stock_quantity)')
                    .eq('user_id', user.id)
                    .eq('active', true);

                let totalStock = 0;
                const lowStockList: LowStockProduct[] = [];

                products?.forEach(p => {
                    let pStock = 0;
                    if (p.product_variants && p.product_variants.length > 0) {
                        pStock = p.product_variants.reduce((a: number, b: any) => a + b.stock_quantity, 0);
                    } else {
                        pStock = p.stock_quantity || 0;
                    }
                    totalStock += pStock;

                    if (pStock < 5) {
                        lowStockList.push({ id: p.id, name: p.name, stock: pStock, image_url: p.image_url });
                    }
                });

                // 4. Financial Balance (Total)
                const { data: allSales } = await supabase.from('sales').select('total_amount').eq('user_id', user.id).eq('status', 'completed');
                const totalSalesRevenue = allSales?.reduce((acc, curr) => acc + curr.total_amount, 0) || 0;

                const { data: allTransactions } = await supabase.from('transactions').select('amount, type').eq('user_id', user.id);
                const totalExpenses = allTransactions?.filter(t => t.type === 'EXPENSE').reduce((acc, curr) => acc + curr.amount, 0) || 0;
                const totalManualIncome = allTransactions?.filter(t => t.type === 'INCOME').reduce((acc, curr) => acc + curr.amount, 0) || 0;
                const balance = (totalSalesRevenue + totalManualIncome) - totalExpenses;

                // 5. Chart Data (Last 30 Days)
                const { data: periodSales } = await supabase
                    .from('sales')
                    .select('total_amount, created_at')
                    .eq('user_id', user.id)
                    .eq('status', 'completed')
                    .gte('created_at', thirtyDaysAgo.toISOString());

                const { data: periodTransactions } = await supabase
                    .from('transactions')
                    .select('amount, type, date') // transactions usam 'date' (YYYY-MM-DD) ou 'created_at' se date for null? Schema diz date default CURRENT_DATE
                    .eq('user_id', user.id)
                    .gte('date', thirtyDaysAgo.toISOString().split('T')[0]);

                // Generate map of dates
                const dateMap = new Map<string, { income: number, expense: number }>();
                const interval = eachDayOfInterval({ start: thirtyDaysAgo, end: today });

                interval.forEach(d => {
                    dateMap.set(format(d, 'yyyy-MM-dd'), { income: 0, expense: 0 });
                });

                // Aggregate Sales
                periodSales?.forEach(s => {
                    const d = s.created_at.split('T')[0];
                    if (dateMap.has(d)) {
                        const curr = dateMap.get(d)!;
                        dateMap.set(d, { ...curr, income: curr.income + s.total_amount });
                    }
                });

                // Aggregate Transactions
                periodTransactions?.forEach(t => {
                    const d = t.date; // already YYYY-MM-DD
                    if (dateMap.has(d)) {
                        const curr = dateMap.get(d)!;
                        if (t.type === 'EXPENSE') {
                            dateMap.set(d, { ...curr, expense: curr.expense + t.amount });
                        } else if (t.type === 'INCOME') {
                            dateMap.set(d, { ...curr, income: curr.income + t.amount });
                        }
                    }
                });

                const chartData = Array.from(dateMap.entries()).map(([key, val]) => ({
                    date: format(new Date(key), 'dd/MM'),
                    fullDate: key,
                    income: val.income,
                    expense: val.expense
                })).sort((a, b) => a.fullDate.localeCompare(b.fullDate));


                setStats({
                    salesToday: { count: salesCount, value: salesValue },
                    newClientsMonth: newClientsCount || 0,
                    totalStockItems: totalStock,
                    financialBalance: balance,
                    chartData: chartData
                });

                setLowStockProducts(lowStockList.slice(0, 5));

                // 6. Recent Sales (List)
                const { data: recentSalesData } = await supabase
                    .from('sales')
                    .select('id, total_amount, created_at, status')
                    .eq('user_id', user.id)
                    .order('created_at', { ascending: false })
                    .limit(5);

                if (recentSalesData) {
                    setRecentSales(recentSalesData);
                }

            } catch (error) {
                console.error("Error fetching dashboard data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, [user]);

    if (loading) {
        return <div style={{ padding: '2rem', color: '#9ca3af', textAlign: 'center' }}>Carregando visão geral...</div>;
    }

    return (
        <div style={{ maxWidth: "1200px", margin: "0 auto", paddingBottom: "4rem", animation: 'fadeIn 0.6s ease' }}>
            {/* Header */}
            <div style={{ marginBottom: "2rem" }}>
                <h1 style={{ fontSize: '2.25rem', fontWeight: 800, background: 'linear-gradient(to right, white, #9ca3af)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', margin: 0 }}>
                    Visão Geral
                </h1>
                <p style={{ color: '#9ca3af', marginTop: '0.5rem' }}>
                    Bem-vindo de volta! Aqui está o resumo do seu negócio hoje.
                </p>
            </div>

            {/* QUICK ACCESS (Moved to top) */}
            <div style={{ marginBottom: "2.5rem" }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '1rem' }}>
                    <button onClick={() => router.push('/dashboard/sales')} style={{ ...glassStyle, padding: '1.5rem', border: '1px solid rgba(52, 211, 153, 0.2)', cursor: 'pointer', transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem' }} onMouseOver={(e) => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.borderColor = 'rgba(52, 211, 153, 0.5)'; e.currentTarget.style.background = 'rgba(52, 211, 153, 0.05)'; }} onMouseOut={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)'; e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)'; }}>
                        <div style={{ padding: '12px', background: 'rgba(52, 211, 153, 0.15)', borderRadius: '14px', color: '#34d399', boxShadow: '0 4px 12px rgba(16, 185, 129, 0.1)' }}>
                            <ShoppingCart size={26} />
                        </div>
                        <span style={{ color: 'white', fontWeight: 600, fontSize: '0.95rem' }}>Nova Venda</span>
                    </button>

                    <button onClick={() => router.push('/dashboard/products/new')} style={{ ...glassStyle, padding: '1.5rem', border: '1px solid rgba(59, 130, 246, 0.2)', cursor: 'pointer', transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem' }} onMouseOver={(e) => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.borderColor = 'rgba(59, 130, 246, 0.5)'; e.currentTarget.style.background = 'rgba(59, 130, 246, 0.05)'; }} onMouseOut={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)'; e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)'; }}>
                        <div style={{ padding: '12px', background: 'rgba(59, 130, 246, 0.15)', borderRadius: '14px', color: '#3b82f6', boxShadow: '0 4px 12px rgba(59, 130, 246, 0.1)' }}>
                            <Package size={26} />
                        </div>
                        <span style={{ color: 'white', fontWeight: 600, fontSize: '0.95rem' }}>Novo Produto</span>
                    </button>

                    <button onClick={() => router.push('/dashboard/clients')} style={{ ...glassStyle, padding: '1.5rem', border: '1px solid rgba(236, 72, 153, 0.2)', cursor: 'pointer', transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem' }} onMouseOver={(e) => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.borderColor = 'rgba(236, 72, 153, 0.5)'; e.currentTarget.style.background = 'rgba(236, 72, 153, 0.05)'; }} onMouseOut={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)'; e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)'; }}>
                        <div style={{ padding: '12px', background: 'rgba(236, 72, 153, 0.15)', borderRadius: '14px', color: '#ec4899', boxShadow: '0 4px 12px rgba(236, 72, 153, 0.1)' }}>
                            <Users size={26} />
                        </div>
                        <span style={{ color: 'white', fontWeight: 600, fontSize: '0.95rem' }}>Novo Cliente</span>
                    </button>

                    <button onClick={() => router.push('/dashboard/financial')} style={{ ...glassStyle, padding: '1.5rem', border: '1px solid rgba(249, 115, 22, 0.2)', cursor: 'pointer', transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem' }} onMouseOver={(e) => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.borderColor = 'rgba(249, 115, 22, 0.5)'; e.currentTarget.style.background = 'rgba(249, 115, 22, 0.05)'; }} onMouseOut={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)'; e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)'; }}>
                        <div style={{ padding: '12px', background: 'rgba(249, 115, 22, 0.15)', borderRadius: '14px', color: '#f97316', boxShadow: '0 4px 12px rgba(249, 115, 22, 0.1)' }}>
                            <DollarSign size={26} />
                        </div>
                        <span style={{ color: 'white', fontWeight: 600, fontSize: '0.95rem' }}>Financeiro</span>
                    </button>
                </div>
            </div>

            {/* KPI Cards Grid */}
            <div className="mobile-stack" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem', marginBottom: '2.5rem' }}>
                {/* Cards mantidos iguais... */}
                {/* Sales Today */}
                <div style={cardStyle}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                            <p style={{ color: '#9ca3af', fontSize: '0.875rem', fontWeight: 600, textTransform: 'uppercase' }}>Vendas Hoje</p>
                            <h3 style={{ fontSize: '2rem', fontWeight: 700, color: 'white', marginTop: '0.5rem' }}>
                                R$ {stats.salesToday.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                            </h3>
                        </div>
                        <div style={{ padding: '10px', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '12px', color: '#10b981' }}>
                            <TrendingUp size={24} />
                        </div>
                    </div>
                    <div style={{ marginTop: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ background: 'rgba(16, 185, 129, 0.2)', color: '#34d399', padding: '2px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 700 }}>
                            {stats.salesToday.count} vendas
                        </span>
                        <span style={{ color: '#6b7280', fontSize: '0.8rem' }}>registradas hoje</span>
                    </div>
                </div>

                {/* New Clients */}
                <div style={cardStyle}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                            <p style={{ color: '#9ca3af', fontSize: '0.875rem', fontWeight: 600, textTransform: 'uppercase' }}>Novos Clientes</p>
                            <h3 style={{ fontSize: '2rem', fontWeight: 700, color: 'white', marginTop: '0.5rem' }}>
                                {stats.newClientsMonth}
                            </h3>
                        </div>
                        <div style={{ padding: '10px', background: 'rgba(59, 130, 246, 0.1)', borderRadius: '12px', color: '#3b82f6' }}>
                            <Users size={24} />
                        </div>
                    </div>
                    <span style={{ marginTop: '1rem', color: '#6b7280', fontSize: '0.8rem' }}>Neste mês</span>
                </div>

                {/* Stock Items */}
                <div style={cardStyle}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                            <p style={{ color: '#9ca3af', fontSize: '0.875rem', fontWeight: 600, textTransform: 'uppercase' }}>Produtos em Estoque</p>
                            <h3 style={{ fontSize: '2rem', fontWeight: 700, color: 'white', marginTop: '0.5rem' }}>
                                {stats.totalStockItems}
                            </h3>
                        </div>
                        <div style={{ padding: '10px', background: 'rgba(245, 158, 11, 0.1)', borderRadius: '12px', color: '#f59e0b' }}>
                            <Package size={24} />
                        </div>
                    </div>
                    <span style={{ marginTop: '1rem', color: '#6b7280', fontSize: '0.8rem' }}>Itens totais (incl. variações)</span>
                </div>

                {/* Financial Balance */}
                <div style={cardStyle}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                            <p style={{ color: '#9ca3af', fontSize: '0.875rem', fontWeight: 600, textTransform: 'uppercase' }}>Saldo Atual</p>
                            <h3 style={{ fontSize: '2rem', fontWeight: 700, color: stats.financialBalance >= 0 ? '#34d399' : '#ef4444', marginTop: '0.5rem' }}>
                                R$ {stats.financialBalance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                            </h3>
                        </div>
                        <div style={{ padding: '10px', background: 'rgba(139, 92, 246, 0.1)', borderRadius: '12px', color: '#8b5cf6' }}>
                            <Wallet size={24} />
                        </div>
                    </div>
                    <span style={{ marginTop: '1rem', color: '#6b7280', fontSize: '0.8rem' }}>Caixa acumulado</span>
                </div>
            </div>

            {/* CHART SECTION */}
            <div style={{ marginBottom: '2.5rem' }}>
                <div style={glassStyle}>
                    <div style={{ padding: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'white', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <DollarSign size={18} style={{ color: '#3b82f6' }} />
                            Desempenho Financeiro (30 Dias)
                        </h3>
                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#34d399' }} />
                                <span style={{ fontSize: '0.75rem', color: '#9ca3af' }}>Entradas</span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#f87171' }} />
                                <span style={{ fontSize: '0.75rem', color: '#9ca3af' }}>Saídas</span>
                            </div>
                        </div>
                    </div>
                    <div style={{ padding: '1.5rem', height: '350px' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={stats.chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#34d399" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#34d399" stopOpacity={0} />
                                    </linearGradient>
                                    <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#f87171" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#f87171" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                                <XAxis
                                    dataKey="date"
                                    stroke="#6b7280"
                                    tick={{ fill: '#6b7280', fontSize: 12 }}
                                    tickLine={false}
                                    axisLine={false}
                                    dy={10}
                                />
                                <YAxis
                                    stroke="#6b7280"
                                    tick={{ fill: '#6b7280', fontSize: 12 }}
                                    tickLine={false}
                                    axisLine={false}
                                    tickFormatter={(value) => `R$${value >= 1000 ? `${(value / 1000).toFixed(1)}k` : value}`}
                                    dx={-10}
                                />
                                <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'rgba(255,255,255,0.2)', strokeWidth: 1, strokeDasharray: '4 4' }} />
                                <Area
                                    type="monotone"
                                    dataKey="income"
                                    stroke="#34d399"
                                    strokeWidth={3}
                                    fillOpacity={1}
                                    fill="url(#colorIncome)"
                                    activeDot={{ r: 6, strokeWidth: 0, fill: '#34d399' }}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="expense"
                                    stroke="#f87171"
                                    strokeWidth={3}
                                    fillOpacity={1}
                                    fill="url(#colorExpense)"
                                    activeDot={{ r: 6, strokeWidth: 0, fill: '#f87171' }}
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Dashboard Content Grid */}
            <div className="mobile-stack" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
                {/* Left Column: Recent Sales */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>

                    {/* Recent Sales */}
                    <div style={{ ...glassStyle, padding: '1.5rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'white', margin: 0 }}>Vendas Recentes</h3>
                            <button onClick={() => router.push('/dashboard/sales')} style={{ background: 'transparent', border: 'none', color: '#34d399', fontSize: '0.875rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                Ver todas <ArrowRight size={14} />
                            </button>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            {recentSales.map(sale => (
                                <div key={sale.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                        <div style={{ padding: '8px', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '8px', color: '#10b981' }}>
                                            <Briefcase size={18} />
                                        </div>
                                        <div>
                                            <p style={{ color: 'white', fontWeight: 600, fontSize: '0.9rem', margin: 0 }}>Venda #{sale.id.slice(0, 8)}</p>
                                            <p style={{ color: '#6b7280', fontSize: '0.75rem', margin: 0 }}>
                                                {format(new Date(sale.created_at), "dd 'de' MMM, HH:mm", { locale: ptBR })}
                                            </p>
                                        </div>
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                        <p style={{ color: '#34d399', fontWeight: 700, fontSize: '1rem', margin: 0 }}>R$ {sale.total_amount.toFixed(2)}</p>
                                        <span style={{ fontSize: '0.7rem', color: '#9ca3af', padding: '2px 6px', borderRadius: '4px', background: 'rgba(255,255,255,0.05)' }}>
                                            {sale.status === 'completed' ? 'Concluída' : sale.status}
                                        </span>
                                    </div>
                                </div>
                            ))}
                            {recentSales.length === 0 && <p style={{ color: '#6b7280', textAlign: 'center', padding: '1rem' }}>Nenhuma venda recente.</p>}
                        </div>
                    </div>
                </div>

                {/* Right Column: Low Stock & Tips */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>

                    {/* Low Stock Alert */}
                    <div style={{ ...glassStyle, padding: '1.5rem', border: '1px solid rgba(239, 68, 68, 0.3)' }}>
                        <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: '#f87171', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <AlertTriangle size={18} />
                            Estoque Baixo
                        </h3>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            {lowStockProducts.slice(0, 5).map(prod => (
                                <div key={prod.id} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem', background: 'rgba(239, 68, 68, 0.05)', borderRadius: '8px' }}>
                                    <div style={{ width: '32px', height: '32px', borderRadius: '6px', overflow: 'hidden', background: '#374151' }}>
                                        {prod.image_url
                                            ? <img src={prod.image_url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                            : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Package size={14} color="#9ca3af" /></div>
                                        }
                                    </div>
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <p style={{ color: 'white', fontWeight: 600, fontSize: '0.85rem', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{prod.name}</p>
                                        <p style={{ color: '#f87171', fontSize: '0.75rem', margin: 0, fontWeight: 700 }}>Restam: {prod.stock}</p>
                                    </div>
                                    <button onClick={() => router.push(`/dashboard/products?search=${prod.name}`)} style={{ background: 'transparent', border: 'none', color: '#9ca3af', cursor: 'pointer' }}>
                                        <ArrowRight size={14} />
                                    </button>
                                </div>
                            ))}
                            {lowStockProducts.length === 0 && (
                                <div style={{ textAlign: 'center', padding: '1rem', color: '#34d399', fontSize: '0.9rem' }}>
                                    <Package size={32} style={{ marginBottom: '0.5rem', opacity: 0.5 }} />
                                    <p>Tudo certo com seu estoque!</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Pro Tip or Info */}
                    <div style={{ ...glassStyle, padding: '1.5rem', background: 'linear-gradient(145deg, rgba(59, 130, 246, 0.1), rgba(0,0,0,0))' }}>
                        <h4 style={{ color: '#60a5fa', fontWeight: 700, marginBottom: '0.5rem' }}>Dica Pro</h4>
                        <p style={{ color: '#d1d5db', fontSize: '0.875rem' }}>
                            Mantenha seus registros financeiros em dia. Lembre-se de lançar despesas fixas como aluguel e luz no módulo <strong>Financeiro</strong> para ter um saldo real.
                        </p>
                    </div>

                </div>
            </div>
        </div>
    );
}
