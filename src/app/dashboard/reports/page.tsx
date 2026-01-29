"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import {
    FileText,
    Calendar,
    Download,
    TrendingUp,
    DollarSign,
    Package,
    Filter,
    ArrowRight,
    Wallet,
    PieChart,
    Users
} from "lucide-react";
import { format, startOfMonth, endOfMonth, isWithinInterval, eachDayOfInterval, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    AreaChart,
    Area,
    ComposedChart,
    Line
} from "recharts";

// Types
interface ReportSale {
    id: string;
    created_at: string;
    total_amount: number;
    payment_method: string;
    status: string;
    client_name?: string;
}

interface ReportTransaction {
    id: string;
    date: string;
    description: string;
    category: string;
    type: 'INCOME' | 'EXPENSE';
    amount: number;
    source: 'SALE' | 'MANUAL';
}

interface ReportStock {
    id: string;
    name: string;
    size: string;
    quantity_sold: number;
    total_revenue: number;
    current_stock: number;
}

interface ReportEmployee {
    employee_id: string;
    name: string;
    sales_count: number;
    total_sales: number;
    total_commission: number;
}

interface ChartData {
    name: string; // Date or Label
    fullDate?: string;
    value?: number;
    income?: number;
    expense?: number;
    profit?: number;
    balance?: number;
    [key: string]: any;
}

export default function ReportsPage() {
    const supabase = createClient();
    const [loading, setLoading] = useState(false);
    const [reportType, setReportType] = useState<'SALES' | 'FINANCIAL' | 'CASH' | 'PROFIT' | 'STOCK' | 'EMPLOYEES'>('SALES');

    // Filters
    const [startDate, setStartDate] = useState(format(startOfMonth(new Date()), 'yyyy-MM-dd'));
    const [endDate, setEndDate] = useState(format(endOfMonth(new Date()), 'yyyy-MM-dd'));

    // Data
    const [salesData, setSalesData] = useState<ReportSale[]>([]);
    const [financialData, setFinancialData] = useState<ReportTransaction[]>([]);
    const [stockData, setStockData] = useState<ReportStock[]>([]);
    const [employeeData, setEmployeeData] = useState<ReportEmployee[]>([]);
    const [chartData, setChartData] = useState<ChartData[]>([]);

    // Summary
    const [summary, setSummary] = useState({ label: '', value: '' });

    // Styles
    const glassStyle = {
        background: 'rgba(255, 255, 255, 0.03)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        backdropFilter: 'blur(12px)',
        borderRadius: '16px',
    };

    const inputStyle = {
        background: 'rgba(255, 255, 255, 0.05)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: '8px',
        padding: '8px 12px',
        color: 'white',
        outline: 'none',
        fontSize: '0.9rem'
    };

    const buttonStyle = (active: boolean, color: string = 'var(--color-primary)') => ({
        padding: '10px 20px',
        borderRadius: '8px',
        fontWeight: 600,
        fontSize: '0.9rem',
        cursor: 'pointer',
        border: active ? `1px solid ${color}` : '1px solid transparent',
        background: active ? `${color}1A` : 'transparent', // 1A is ~10% opacity hex
        color: active ? color : '#9ca3af',
        transition: 'all 0.2s',
        display: 'flex',
        alignItems: 'center',
        gap: '8px'
    });

    useEffect(() => {
        fetchReportData();
    }, [reportType, startDate, endDate]);

    const fetchReportData = async () => {
        setLoading(true);
        try {
            // Common Date Range Logic
            const start = `${startDate}T00:00:00`;
            const end = `${endDate}T23:59:59`;

            if (reportType === 'SALES') {
                const { data, error } = await supabase
                    .from('sales')
                    .select('*, clients(name)')
                    .gte('created_at', start)
                    .lte('created_at', end)
                    .eq('status', 'completed')
                    .order('created_at', { ascending: false });

                if (error) throw error;

                const formatted: ReportSale[] = (data || []).map(s => ({
                    id: s.id,
                    created_at: s.created_at,
                    total_amount: s.total_amount,
                    payment_method: s.payment_method,
                    status: s.status,
                    client_name: s.clients?.name || 'Cliente Não Identificado'
                }));
                setSalesData(formatted);

                // Chart Data: Daily Sales
                const days = eachDayOfInterval({ start: parseISO(startDate), end: parseISO(endDate) });
                const chart = days.map(d => {
                    const dateStr = format(d, 'yyyy-MM-dd');
                    const dayTotal = formatted
                        .filter(s => s.created_at.startsWith(dateStr))
                        .reduce((acc, curr) => acc + curr.total_amount, 0);
                    return { name: format(d, 'dd/MM'), fullDate: dateStr, value: dayTotal };
                });
                setChartData(chart);

                const total = formatted.reduce((acc, curr) => acc + curr.total_amount, 0);
                setSummary({ label: 'Total Vendido', value: `R$ ${total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` });

            } else if (['FINANCIAL', 'CASH', 'PROFIT'].includes(reportType)) {
                // Fetch Sales AND Transactions
                const [salesRes, transRes] = await Promise.all([
                    supabase.from('sales').select('*').gte('created_at', start).lte('created_at', end).eq('status', 'completed'),
                    supabase.from('transactions').select('*').gte('date', startDate).lte('date', endDate)
                ]);

                if (salesRes.error) throw salesRes.error;
                if (transRes.error) throw transRes.error;

                const integrated: ReportTransaction[] = [];

                salesRes.data?.forEach(s => {
                    integrated.push({
                        id: s.id,
                        date: s.created_at, // timestamp
                        description: `Venda #${s.id.slice(0, 8)}`,
                        category: 'Vendas',
                        type: 'INCOME',
                        amount: s.total_amount,
                        source: 'SALE'
                    });
                });

                transRes.data?.forEach(t => {
                    integrated.push({
                        id: t.id,
                        date: t.date, // YYYY-MM-DD
                        description: t.description,
                        category: t.category || 'Geral',
                        type: t.type,
                        amount: t.amount,
                        source: 'MANUAL'
                    });
                });

                // Sort by date desc
                integrated.sort((a, b) => {
                    const dateA = a.date.includes('T') ? a.date : `${a.date}T00:00:00`;
                    const dateB = b.date.includes('T') ? b.date : `${b.date}T00:00:00`;
                    return new Date(dateB).getTime() - new Date(dateA).getTime();
                });

                setFinancialData(integrated);

                // Chart Data Generation
                const days = eachDayOfInterval({ start: parseISO(startDate), end: parseISO(endDate) });
                let cumulativeBalance = 0; // Reset for period (or we could fetch previous balance)

                const chart = days.map(d => {
                    const dateStr = format(d, 'yyyy-MM-dd');

                    // Filter items for this day
                    const dayItems = integrated.filter(i => {
                        const iDate = i.date.includes('T') ? i.date.split('T')[0] : i.date;
                        return iDate === dateStr;
                    });

                    const income = dayItems.filter(i => i.type === 'INCOME').reduce((acc, curr) => acc + curr.amount, 0);
                    const expense = dayItems.filter(i => i.type === 'EXPENSE').reduce((acc, curr) => acc + curr.amount, 0);
                    const profit = income - expense;

                    cumulativeBalance += profit;

                    return {
                        name: format(d, 'dd/MM'),
                        fullDate: dateStr,
                        income,
                        expense,
                        profit,
                        balance: cumulativeBalance
                    };
                });
                setChartData(chart);

                // Summary Logic
                const totalIncome = integrated.filter(i => i.type === 'INCOME').reduce((acc, curr) => acc + curr.amount, 0);
                const totalExpense = integrated.filter(i => i.type === 'EXPENSE').reduce((acc, curr) => acc + curr.amount, 0);
                const result = totalIncome - totalExpense;

                if (reportType === 'FINANCIAL') {
                    setSummary({ label: 'Movimentação Total', value: `${integrated.length} Transações` });
                } else if (reportType === 'CASH') {
                    setSummary({ label: 'Saldo do Período', value: `R$ ${result.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` });
                } else if (reportType === 'PROFIT') {
                    setSummary({ label: 'Lucro Líquido', value: `R$ ${result.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` });
                }

            } else if (reportType === 'STOCK') {
                // Best Sellers Logic: Fetch Sale Items + Product/Variant Info
                // 1. Fetch sale_items for sales in period
                // We need sales IDs first
                const { data: salesPeriod } = await supabase
                    .from('sales')
                    .select('id')
                    .gte('created_at', start)
                    .lte('created_at', end)
                    .eq('status', 'completed');

                const saleIds = salesPeriod?.map(s => s.id) || [];

                if (saleIds.length > 0) {
                    const { data: items, error } = await supabase
                        .from('sale_items')
                        .select('*, products(name), product_variants(size, stock_quantity)')
                        .in('sale_id', saleIds);

                    if (error) throw error;

                    // Aggregate by Product + Variant
                    const aggregation = new Map<string, ReportStock>();

                    items?.forEach(item => {
                        const key = `${item.product_id}-${item.variant_id || 'novar'}`;
                        const existing = aggregation.get(key);

                        const productName = item.products?.name || 'Desconhecido';
                        const size = item.product_variants?.size || 'Único';
                        const currentStock = item.product_variants?.stock_quantity || 0;

                        if (existing) {
                            existing.quantity_sold += item.quantity;
                            existing.total_revenue += item.subtotal;
                        } else {
                            aggregation.set(key, {
                                id: item.product_id || '',
                                name: productName,
                                size: size,
                                quantity_sold: item.quantity,
                                total_revenue: item.subtotal,
                                current_stock: currentStock
                            });
                        }
                    });

                    const stockReport = Array.from(aggregation.values())
                        .sort((a, b) => b.quantity_sold - a.quantity_sold); // Sort by Qty Sold

                    setStockData(stockReport);

                    // Chart Data: Top 10 Products
                    const top10 = stockReport.slice(0, 10).map(i => ({
                        name: `${i.name} (${i.size})`,
                        value: i.quantity_sold,
                        revenue: i.total_revenue
                    }));
                    setChartData(top10);

                    const totalSold = stockReport.reduce((acc, curr) => acc + curr.quantity_sold, 0);
                    setSummary({ label: 'Itens Vendidos', value: totalSold.toString() });

                } else {
                    setStockData([]);
                    setChartData([]);
                    setSummary({ label: 'Itens Vendidos', value: '0' });
                }
            } else if (reportType === 'EMPLOYEES') {
                const { data: sales, error } = await supabase
                    .from('sales')
                    .select('total_amount, commission_amount, employees(id, name)')
                    .gte('created_at', start)
                    .lte('created_at', end)
                    .eq('status', 'completed');

                if (error) throw error;

                const aggregation = new Map<string, ReportEmployee>();

                sales?.forEach((s: any) => {
                    const empId = s.employees?.id || 'store';
                    const empName = s.employees?.name || 'Loja / Sem Vendedor';

                    const existing = aggregation.get(empId);
                    if (existing) {
                        existing.sales_count += 1;
                        existing.total_sales += s.total_amount;
                        existing.total_commission += s.commission_amount || 0;
                    } else {
                        aggregation.set(empId, {
                            employee_id: empId,
                            name: empName,
                            sales_count: 1,
                            total_sales: s.total_amount,
                            total_commission: s.commission_amount || 0
                        });
                    }
                });

                const report = Array.from(aggregation.values()).sort((a, b) => b.total_sales - a.total_sales);
                setEmployeeData(report);

                // Chart Data
                const chart = report.map(r => ({
                    name: r.name,
                    value: r.total_sales,
                    commission: r.total_commission
                }));
                setChartData(chart);

                const totalComm = report.reduce((acc, curr) => acc + curr.total_commission, 0);
                setSummary({ label: 'Comissões Pagas', value: `R$ ${totalComm.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` });
            }

        } catch (error) {
            console.error("Error fetching report:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleExportCSV = () => {
        let csvContent = "data:text/csv;charset=utf-8,";

        if (reportType === 'SALES') {
            csvContent += "ID,Data,Cliente,Valor,Pagamento,Status\n";
            salesData.forEach(row => {
                csvContent += `${row.id},${format(new Date(row.created_at), 'dd/MM/yyyy HH:mm')},${row.client_name},${row.total_amount.toFixed(2)},${row.payment_method},${row.status}\n`;
            });
        } else if (['FINANCIAL', 'CASH', 'PROFIT'].includes(reportType)) {
            csvContent += "Data,Descrição,Categoria,Tipo,Valor,Origem\n";
            financialData.forEach(row => {
                const dateClean = row.date.includes('T') ? row.date.split('T')[0] : row.date;
                csvContent += `${format(parseISO(dateClean), 'dd/MM/yyyy')},${row.description},${row.category},${row.type === 'INCOME' ? 'Receita' : 'Despesa'},${row.amount.toFixed(2)},${row.source}\n`;
            });
        } else if (reportType === 'STOCK') {
            csvContent += "Produto,Tamanho,Qtd Vendida,Receita Total,Estoque Atual\n";
            stockData.forEach(row => {
                csvContent += `${row.name},${row.size},${row.quantity_sold},${row.total_revenue.toFixed(2)},${row.current_stock}\n`;
            });
        } else if (reportType === 'EMPLOYEES') {
            csvContent += "Funcionário,Qtd Vendas,Total Vendas,Comissão\n";
            employeeData.forEach(row => {
                csvContent += `${row.name},${row.sales_count},${row.total_sales.toFixed(2)},${row.total_commission.toFixed(2)}\n`;
            });
        }

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `relatorio_${reportType.toLowerCase()}_${format(new Date(), 'yyyyMMdd')}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div style={{ maxWidth: '1200px', width: '100%', margin: '0 auto', paddingBottom: '3rem', animation: 'fadeIn 0.6s ease', overflowX: 'hidden' }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                    <h1 style={{ fontSize: '2.25rem', fontWeight: 800, background: 'linear-gradient(to right, white, #9ca3af)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', margin: 0 }}>
                        Relatórios
                    </h1>
                    <p style={{ color: '#9ca3af', marginTop: '0.25rem' }}>Análise detalhada de performance.</p>
                </div>
                <button
                    onClick={handleExportCSV}
                    style={{
                        background: '#3b82f6', color: 'white', border: 'none', borderRadius: '8px',
                        padding: '10px 16px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px',
                        boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)',
                        flexShrink: 0
                    }}
                >
                    <Download size={18} /> <span className="desktop-only">Exportar CSV</span><span className="mobile-only">CSV</span>
                </button>
            </div>

            {/* Controls Bar */}
            <div style={{ ...glassStyle, padding: '1.5rem', marginBottom: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

                {/* 1. Report Type Selector (Vertical Dropdown for Mobile) */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#9ca3af', textTransform: 'uppercase' }}>Tipo de Relatório</label>
                    <div style={{ position: 'relative', width: '100%' }}>
                        <select
                            value={reportType}
                            onChange={(e) => setReportType(e.target.value as any)}
                            style={{
                                width: '100%', padding: '16px', fontSize: '1rem', fontWeight: 600,
                                background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px',
                                color: 'white', appearance: 'none', cursor: 'pointer', outline: 'none'
                            }}
                        >
                            <option value="SALES" style={{ color: 'black' }}>Vendas</option>
                            <option value="FINANCIAL" style={{ color: 'black' }}>Financeiro</option>
                            <option value="CASH" style={{ color: 'black' }}>Fluxo de Caixa</option>
                            <option value="PROFIT" style={{ color: 'black' }}>Lucros e Resultados</option>
                            <option value="STOCK" style={{ color: 'black' }}>Estoque</option>
                            <option value="EMPLOYEES" style={{ color: 'black' }}>Equipe / Colaboradores</option>
                        </select>
                        <div style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: '#9ca3af' }}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
                        </div>
                    </div>
                </div>

                {/* 2. Date Filter (Stacked Vertical) */}
                <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#9ca3af', marginBottom: '0.5rem' }}>
                        <Calendar size={18} />
                        <span style={{ fontSize: '0.9rem', fontWeight: 700, textTransform: 'uppercase' }}>Período de Análise</span>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            <label style={{ fontSize: '0.8rem', color: '#6b7280' }}>Data Inicial</label>
                            <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} style={{ ...inputStyle, padding: '14px', borderRadius: '10px' }} />
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            <label style={{ fontSize: '0.8rem', color: '#6b7280' }}>Data Final</label>
                            <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} style={{ ...inputStyle, padding: '14px', borderRadius: '10px' }} />
                        </div>
                    </div>
                </div>
            </div>

            {/* Summary & Charts Area */}
            {loading ? (
                <div style={{ padding: '4rem', textAlign: 'center', color: '#9ca3af' }}>
                    <div className="animate-spin" style={{ display: 'inline-block', marginBottom: '1rem' }}><Package size={24} /></div>
                    <p>Processando dados...</p>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>

                    {/* Summary KPI */}
                    <div style={{ ...glassStyle, padding: '2rem', borderLeft: 'none', borderTop: '4px solid var(--color-primary)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', textAlign: 'center' }}>
                        <div style={{ padding: '1.5rem', background: 'rgba(255,255,255,0.05)', borderRadius: '50%', marginBottom: '0.5rem' }}>
                            <FileText size={40} color="var(--color-primary)" />
                        </div>
                        <div>
                            <p style={{ color: '#9ca3af', fontWeight: 700, fontSize: '1rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{summary.label}</p>
                            <h2 style={{ color: 'white', fontSize: '2.5rem', fontWeight: 800, margin: '0.5rem 0 0 0' }}>{summary.value}</h2>
                        </div>
                    </div>

                    {/* CHART CONTAINER */}
                    {chartData.length > 0 && (
                        <div style={{ ...glassStyle, padding: '1.5rem', display: 'block', maxWidth: '100%', overflowX: 'hidden' }}>
                            <h3 style={{
                                color: 'white', fontSize: '1.25rem', marginBottom: '1.5rem', fontWeight: 700,
                                textAlign: 'center', lineHeight: 1.4, paddingBottom: '1rem', borderBottom: '1px solid rgba(255,255,255,0.05)'
                            }}>
                                {reportType === 'SALES' && 'Evolução de Vendas'}
                                {reportType === 'FINANCIAL' && 'Entradas vs Saídas'}
                                {reportType === 'CASH' && 'Saldo em Caixa'}
                                {reportType === 'PROFIT' && 'Lucros e Resultados'}
                                {reportType === 'STOCK' && 'Produtos Mais Vendidos'}
                                {reportType === 'EMPLOYEES' && 'Vendas por Equipe'}
                            </h3>
                            <div style={{ width: '100%', height: '400px', position: 'relative' }}>
                                <ResponsiveContainer width="100%" height="100%">
                                    {reportType === 'SALES' ? (
                                        <BarChart data={chartData}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                                            <XAxis dataKey="name" stroke="#6b7280" style={{ fontSize: '0.8rem' }} />
                                            <YAxis stroke="#6b7280" style={{ fontSize: '0.8rem' }} width={40} />
                                            <Tooltip contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151', color: 'white' }} />
                                            <Bar dataKey="value" name="Vendas" fill="#34d399" radius={[4, 4, 0, 0]} />
                                        </BarChart>
                                    ) : reportType === 'FINANCIAL' ? (
                                        <BarChart data={chartData}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                                            <XAxis dataKey="name" stroke="#6b7280" style={{ fontSize: '0.8rem' }} />
                                            <YAxis stroke="#6b7280" style={{ fontSize: '0.8rem' }} width={40} />
                                            <Tooltip contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151', color: 'white' }} />
                                            <Legend wrapperStyle={{ paddingTop: '20px' }} />
                                            <Bar dataKey="income" name="Entradas" fill="#34d399" radius={[4, 4, 0, 0]} />
                                            <Bar dataKey="expense" name="Saídas" fill="#f87171" radius={[4, 4, 0, 0]} />
                                        </BarChart>
                                    ) : reportType === 'CASH' ? (
                                        <AreaChart data={chartData}>
                                            <defs>
                                                <linearGradient id="colorBalance" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                                                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                                </linearGradient>
                                            </defs>
                                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                                            <XAxis dataKey="name" stroke="#6b7280" style={{ fontSize: '0.8rem' }} />
                                            <YAxis stroke="#6b7280" style={{ fontSize: '0.8rem' }} width={40} />
                                            <Tooltip contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151', color: 'white' }} />
                                            <Area type="monotone" dataKey="balance" name="Saldo Acumulado" stroke="#3b82f6" fillOpacity={1} fill="url(#colorBalance)" />
                                        </AreaChart>
                                    ) : reportType === 'PROFIT' ? (
                                        <ComposedChart data={chartData}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                                            <XAxis dataKey="name" stroke="#6b7280" style={{ fontSize: '0.8rem' }} />
                                            <YAxis stroke="#6b7280" style={{ fontSize: '0.8rem' }} width={40} />
                                            <Tooltip contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151', color: 'white' }} />
                                            <Legend wrapperStyle={{ paddingTop: '20px' }} />
                                            <Bar dataKey="income" name="Receita" fill="#34d399" barSize={20} radius={[4, 4, 0, 0]} stackId="a" />
                                            <Bar dataKey="expense" name="Despesa" fill="#f87171" barSize={20} radius={[4, 4, 0, 0]} stackId="a" />
                                            <Line type="monotone" dataKey="profit" name="Lucro Líquido" stroke="#a855f7" strokeWidth={3} dot={{ r: 4 }} />
                                        </ComposedChart>
                                    ) : reportType === 'STOCK' ? (
                                        <BarChart data={chartData} layout="vertical" margin={{ left: 0, right: 30 }}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={false} />
                                            <XAxis type="number" stroke="#6b7280" style={{ fontSize: '0.8rem' }} />
                                            <YAxis dataKey="name" type="category" stroke="#6b7280" width={100} tick={{ fontSize: 10 }} />
                                            <Tooltip contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151', color: 'white' }} />
                                            <Bar dataKey="value" name="Qtd. Vendida" fill="#ec4899" radius={[0, 4, 4, 0]} />
                                        </BarChart>
                                    ) : ( // EMPLOYEES
                                        <BarChart data={chartData} layout="vertical" margin={{ left: 0, right: 30 }}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={false} />
                                            <XAxis type="number" stroke="#6b7280" style={{ fontSize: '0.8rem' }} />
                                            <YAxis dataKey="name" type="category" stroke="#6b7280" width={100} tick={{ fontSize: 10 }} />
                                            <Tooltip contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151', color: 'white' }} />
                                            <Bar dataKey="value" name="Vendas" fill="#8b5cf6" radius={[0, 4, 4, 0]} />
                                        </BarChart>
                                    )}
                                </ResponsiveContainer>
                            </div>
                        </div>
                    )}

                    {/* Table Data */}
                    <div style={{ ...glassStyle, padding: 0, overflow: 'hidden' }}>

                        {/* Desktop Table View */}
                        <div className="desktop-table-view">
                            <div className="table-responsive">
                                <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '600px' }}>
                                    <thead style={{ background: 'rgba(255,255,255,0.02)' }}>
                                        <tr>
                                            {['FINANCIAL', 'CASH', 'PROFIT'].includes(reportType) ? (
                                                <>
                                                    <th className="responsive-table-header">Data</th>
                                                    <th className="responsive-table-header">Descrição</th>
                                                    <th className="responsive-table-header">Categoria</th>
                                                    <th className="responsive-table-header" style={{ textAlign: 'right' }}>Valor</th>
                                                </>
                                            ) : reportType === 'STOCK' ? (
                                                <>
                                                    <th className="responsive-table-header">Produto</th>
                                                    <th className="responsive-table-header" style={{ textAlign: 'center' }}>Tamanho</th>
                                                    <th className="responsive-table-header" style={{ textAlign: 'center' }}>Qtd. Vendida</th>
                                                    <th className="responsive-table-header" style={{ textAlign: 'right' }}>Estoque Atual</th>
                                                </>
                                            ) : reportType === 'EMPLOYEES' ? (
                                                <>
                                                    <th className="responsive-table-header">Funcionário</th>
                                                    <th className="responsive-table-header" style={{ textAlign: 'center' }}>Qtd. Vendas</th>
                                                    <th className="responsive-table-header" style={{ textAlign: 'right' }}>Total Vendido</th>
                                                    <th className="responsive-table-header" style={{ textAlign: 'right' }}>Comissão</th>
                                                </>
                                            ) : ( // SALES
                                                <>
                                                    <th className="responsive-table-header">Data</th>
                                                    <th className="responsive-table-header">Cliente</th>
                                                    <th className="responsive-table-header">Pagamento</th>
                                                    <th className="responsive-table-header" style={{ textAlign: 'right' }}>Valor</th>
                                                </>
                                            )}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {reportType === 'SALES' && salesData.map(sale => (
                                            <tr key={sale.id} style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                                                <td className="responsive-table-cell" style={{ color: '#d1d5db' }}>{format(new Date(sale.created_at), 'dd/MM/yyyy HH:mm')}</td>
                                                <td className="responsive-table-cell" style={{ color: 'white', fontWeight: 500 }}>{sale.client_name}</td>
                                                <td className="responsive-table-cell">
                                                    <span style={{ padding: '2px 8px', borderRadius: '4px', background: 'rgba(255,255,255,0.05)', fontSize: '0.75rem', color: '#9ca3af' }}>
                                                        {sale.payment_method}
                                                    </span>
                                                </td>
                                                <td className="responsive-table-cell" style={{ textAlign: 'right', fontWeight: 700, color: '#34d399' }}>R$ {sale.total_amount.toFixed(2)}</td>
                                            </tr>
                                        ))}

                                        {['FINANCIAL', 'CASH', 'PROFIT'].includes(reportType) && financialData.map(item => (
                                            <tr key={item.id} style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                                                <td className="responsive-table-cell" style={{ color: '#d1d5db' }}>{format(parseISO(item.date.includes('T') ? item.date.split('T')[0] : item.date), 'dd/MM/yyyy')}</td>
                                                <td className="responsive-table-cell" style={{ color: 'white', fontWeight: 500 }}>
                                                    {item.description}
                                                    <div style={{ fontSize: '0.7rem', color: '#6b7280' }}>
                                                        {item.source === 'SALE' ? 'Origem: Vendas' : 'Origem: Manual'}
                                                    </div>
                                                </td>
                                                <td className="responsive-table-cell" style={{ color: '#9ca3af' }}>{item.category}</td>
                                                <td className="responsive-table-cell" style={{ textAlign: 'right', fontWeight: 700, color: item.type === 'INCOME' ? '#34d399' : '#f87171' }}>
                                                    {item.type === 'INCOME' ? '+' : '-'} R$ {item.amount.toFixed(2)}
                                                </td>
                                            </tr>
                                        ))}

                                        {reportType === 'STOCK' && stockData.map(item => (
                                            <tr key={`${item.id}-${item.size}`} style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                                                <td className="responsive-table-cell" style={{ color: 'white', fontWeight: 500 }}>{item.name}</td>
                                                <td className="responsive-table-cell" style={{ textAlign: 'center', color: '#d1d5db' }}>{item.size}</td>
                                                <td className="responsive-table-cell" style={{ textAlign: 'center', color: '#ec4899', fontWeight: 700 }}>{item.quantity_sold}</td>
                                                <td className="responsive-table-cell" style={{ textAlign: 'right', color: '#d1d5db' }}>{item.current_stock}</td>
                                            </tr>
                                        ))}

                                        {reportType === 'EMPLOYEES' && employeeData.map(item => (
                                            <tr key={item.employee_id} style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                                                <td className="responsive-table-cell" style={{ color: 'white', fontWeight: 500 }}>{item.name}</td>
                                                <td className="responsive-table-cell" style={{ textAlign: 'center', color: '#d1d5db' }}>{item.sales_count}</td>
                                                <td className="responsive-table-cell" style={{ textAlign: 'right', color: '#34d399', fontWeight: 700 }}>R$ {item.total_sales.toFixed(2)}</td>
                                                <td className="responsive-table-cell" style={{ textAlign: 'right', color: '#facc15' }}>R$ {item.total_commission.toFixed(2)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Mobile Card View */}
                        <div className="mobile-card-view">
                            <div style={{ padding: '1rem' }}>
                                {reportType === 'SALES' && salesData.map(sale => (
                                    <div key={sale.id} className="mobile-card">
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                            <span style={{ fontSize: '0.8rem', color: '#9ca3af' }}>{format(new Date(sale.created_at), 'dd/MM/yyyy HH:mm')}</span>
                                            <span style={{ fontWeight: 700, color: '#34d399' }}>R$ {sale.total_amount.toFixed(2)}</span>
                                        </div>
                                        <div style={{ fontWeight: 600, color: 'white', marginBottom: '0.5rem' }}>{sale.client_name}</div>
                                        <div style={{ fontSize: '0.8rem', color: '#9ca3af', padding: '4px 8px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', display: 'inline-block' }}>
                                            {sale.payment_method}
                                        </div>
                                    </div>
                                ))}

                                {['FINANCIAL', 'CASH', 'PROFIT'].includes(reportType) && financialData.map(item => (
                                    <div key={item.id} className="mobile-card">
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                            <span style={{ fontSize: '0.8rem', color: '#9ca3af' }}>{format(parseISO(item.date.includes('T') ? item.date.split('T')[0] : item.date), 'dd/MM/yyyy')}</span>
                                            <span style={{ fontWeight: 700, color: item.type === 'INCOME' ? '#34d399' : '#f87171' }}>
                                                {item.type === 'INCOME' ? '+' : '-'} R$ {item.amount.toFixed(2)}
                                            </span>
                                        </div>
                                        <div style={{ fontWeight: 600, color: 'white', marginBottom: '0.25rem' }}>{item.description}</div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8rem', color: '#6b7280' }}>
                                            <span>{item.category}</span>
                                            <span style={{ fontStyle: 'italic' }}>{item.source === 'SALE' ? 'Venda' : 'Manual'}</span>
                                        </div>
                                    </div>
                                ))}

                                {reportType === 'STOCK' && stockData.map(item => (
                                    <div key={`${item.id}-${item.size}`} className="mobile-card">
                                        <div style={{ fontWeight: 600, color: 'white', marginBottom: '0.5rem', fontSize: '1.1rem' }}>{item.name}</div>
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.5rem' }}>
                                            <div style={{ background: 'rgba(255,255,255,0.05)', padding: '8px', borderRadius: '8px', textAlign: 'center' }}>
                                                <div style={{ fontSize: '0.7rem', color: '#9ca3af' }}>Tamanho</div>
                                                <div style={{ color: 'white', fontWeight: 700 }}>{item.size}</div>
                                            </div>
                                            <div style={{ background: 'rgba(236, 72, 153, 0.1)', padding: '8px', borderRadius: '8px', textAlign: 'center' }}>
                                                <div style={{ fontSize: '0.7rem', color: '#ec4899' }}>Vendidos</div>
                                                <div style={{ color: '#ec4899', fontWeight: 700 }}>{item.quantity_sold}</div>
                                            </div>
                                            <div style={{ background: 'rgba(255,255,255,0.05)', padding: '8px', borderRadius: '8px', textAlign: 'center' }}>
                                                <div style={{ fontSize: '0.7rem', color: '#9ca3af' }}>Estoque</div>
                                                <div style={{ color: 'white', fontWeight: 700 }}>{item.current_stock}</div>
                                            </div>
                                        </div>
                                    </div>
                                ))}

                                {reportType === 'EMPLOYEES' && employeeData.map(item => (
                                    <div key={item.employee_id} className="mobile-card">
                                        <div style={{ fontWeight: 600, color: 'white', marginBottom: '1rem', fontSize: '1.1rem' }}>{item.name}</div>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                            <div className="mobile-card-row">
                                                <span className="mobile-card-label">Qtd. Vendas</span>
                                                <span className="mobile-card-value">{item.sales_count}</span>
                                            </div>
                                            <div className="mobile-card-row">
                                                <span className="mobile-card-label">Total Vendido</span>
                                                <span className="mobile-card-value" style={{ color: '#34d399' }}>R$ {item.total_sales.toFixed(2)}</span>
                                            </div>
                                            <div className="mobile-card-row">
                                                <span className="mobile-card-label">Comissão</span>
                                                <span className="mobile-card-value" style={{ color: '#facc15' }}>R$ {item.total_commission.toFixed(2)}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Empty State */}
                        {((reportType === 'SALES' && salesData.length === 0) ||
                            (['FINANCIAL', 'CASH', 'PROFIT'].includes(reportType) && financialData.length === 0) ||
                            (reportType === 'STOCK' && stockData.length === 0) ||
                            (reportType === 'EMPLOYEES' && employeeData.length === 0)) && (
                                <div style={{ padding: '3rem', textAlign: 'center', color: '#6b7280' }}>
                                    Nenhum dado encontrado para o período.
                                </div>
                            )}
                    </div>
                </div>
            )}
        </div>
    );
}
