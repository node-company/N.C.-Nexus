"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import {
    DollarSign,
    TrendingUp,
    TrendingDown,
    Plus,
    Calendar,
    ArrowUpCircle,
    ArrowDownCircle,
    ShoppingBag,
    Wallet,
    X,
    Edit,
    Trash2
} from "lucide-react";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    Cell
} from "recharts";
import { format, subDays, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";

// Types
interface FinancialRecord {
    id: string;
    description: string;
    amount: number;
    type: 'INCOME' | 'EXPENSE';
    date: string;
    source: 'SALE' | 'MANUAL';
    category?: string;
}

interface Summary {
    revenue: number;
    expenses: number;
    balance: number;
}

interface ChartDataPoint {
    name: string;
    income: number;
    expense: number;
}

export default function FinancialPage() {
    const supabase = createClient();
    const [loading, setLoading] = useState(true);
    const [records, setRecords] = useState<FinancialRecord[]>([]);
    const [summary, setSummary] = useState<Summary>({ revenue: 0, expenses: 0, balance: 0 });
    const [chartData, setChartData] = useState<ChartDataPoint[]>([]);

    // Filter State
    const [startDate, setStartDate] = useState(format(startOfMonth(new Date()), "yyyy-MM-dd"));
    const [endDate, setEndDate] = useState(format(endOfMonth(new Date()), "yyyy-MM-dd"));

    // Modal State
    const [modalOpen, setModalOpen] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [newTransaction, setNewTransaction] = useState({
        description: "",
        amount: "",
        type: "EXPENSE" as "INCOME" | "EXPENSE",
        category: "Operacional",
        date: new Date().toISOString().split('T')[0]
    });
    const [saving, setSaving] = useState(false);

    // Styles (Standardized)
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

    const labelStyle = {
        display: 'block',
        fontSize: '0.75rem',
        fontWeight: 600,
        color: '#9ca3af',
        textTransform: 'uppercase' as const,
        letterSpacing: '0.05em',
        marginBottom: '0.5rem'
    };

    useEffect(() => {
        fetchFinancials();
    }, [startDate, endDate]);

    const fetchFinancials = async () => {
        setLoading(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            // 1. Fetch Sales within Range
            const { data: sales, error: salesError } = await supabase
                .from("sales")
                .select("id, total_amount, created_at, status")
                .eq("user_id", user.id)
                .eq("status", "completed")
                .gte("created_at", `${startDate}T00:00:00`)
                .lte("created_at", `${endDate}T23:59:59`);

            if (salesError) throw salesError;

            // 2. Fetch Transactions within Range
            const { data: transactions, error: transError } = await supabase
                .from("transactions")
                .select("*")
                .eq("user_id", user.id)
                .gte("date", startDate)
                .lte("date", endDate);

            if (transError) throw transError;

            // Normalize Data
            const normalizedSales: FinancialRecord[] = (sales || []).map(s => ({
                id: s.id,
                description: `Venda #${s.id.slice(0, 8)}`,
                amount: s.total_amount,
                type: 'INCOME',
                date: s.created_at,
                source: 'SALE',
                category: 'Vendas'
            }));

            const normalizedTransactions: FinancialRecord[] = (transactions || []).map(t => ({
                id: t.id,
                description: t.description,
                amount: t.amount,
                type: t.type,
                date: t.date,
                source: 'MANUAL',
                category: t.category
            }));

            const allRecords = [...normalizedSales, ...normalizedTransactions].sort((a, b) =>
                new Date(b.date).getTime() - new Date(a.date).getTime()
            );

            setRecords(allRecords);

            // Calculate Summary
            const revenue = allRecords
                .filter(r => r.type === 'INCOME')
                .reduce((acc, curr) => acc + curr.amount, 0);

            const expenses = allRecords
                .filter(r => r.type === 'EXPENSE')
                .reduce((acc, curr) => acc + curr.amount, 0);

            setSummary({
                revenue,
                expenses,
                balance: revenue - expenses
            });

            // Generate Chart Data
            const days = eachDayOfInterval({
                start: parseISO(startDate),
                end: parseISO(endDate)
            });

            const dailyData: ChartDataPoint[] = days.map(day => {
                const dayStr = format(day, "yyyy-MM-dd");
                const dayIncome = allRecords
                    .filter(r => r.type === 'INCOME' && r.date.startsWith(dayStr))
                    .reduce((acc, curr) => acc + curr.amount, 0);
                const dayExpense = allRecords
                    .filter(r => r.type === 'EXPENSE' && r.date.startsWith(dayStr))
                    .reduce((acc, curr) => acc + curr.amount, 0);

                return {
                    name: format(day, "dd/MM"),
                    income: dayIncome,
                    expense: dayExpense
                };
            });

            setChartData(dailyData);

        } catch (error) {
            console.error("Error fetching financials:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleOpenModal = (record?: FinancialRecord) => {
        if (record) {
            setEditingId(record.id);
            setNewTransaction({
                description: record.description,
                amount: record.amount.toString(),
                type: record.type,
                category: record.category || "Operacional",
                date: record.date.split('T')[0]
            });
        } else {
            setEditingId(null);
            setNewTransaction({
                description: "",
                amount: "",
                type: "EXPENSE",
                category: "Operacional",
                date: new Date().toISOString().split('T')[0]
            });
        }
        setModalOpen(true);
    };

    const handleSaveTransaction = async () => {
        if (!newTransaction.description || !newTransaction.amount) return;
        setSaving(true);

        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error("No user");

            const amountValue = parseFloat(newTransaction.amount.toString().replace(',', '.'));

            if (editingId) {
                // UPDATE
                const { data, error } = await supabase
                    .from("transactions")
                    .update({
                        description: newTransaction.description,
                        amount: amountValue,
                        type: newTransaction.type,
                        category: newTransaction.category,
                        date: newTransaction.date
                    })
                    .eq("id", editingId)
                    .select();

                if (error) throw error;
                if (!data || data.length === 0) throw new Error("Erro de Permissão: Não foi possível atualizar o registro.");
            } else {
                // INSERT
                const { error } = await supabase.from("transactions").insert({
                    user_id: user.id,
                    description: newTransaction.description,
                    amount: amountValue,
                    type: newTransaction.type,
                    category: newTransaction.category,
                    date: newTransaction.date
                });

                if (error) throw error;
            }

            setModalOpen(false);
            setEditingId(null);
            fetchFinancials();

        } catch (error: any) {
            console.error("Error saving transaction:", error);
            alert(error.message || "Erro ao salvar transação");
        } finally {
            setSaving(false);
        }
    };

    // Confirm Delete State
    const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);

    const handleDeleteClick = (id: string) => {
        console.log("Requesting delete for:", id);
        setPendingDeleteId(id);
    };

    const confirmDelete = async () => {
        if (!pendingDeleteId) return;
        console.log("Confirming delete for:", pendingDeleteId);

        try {
            const { error } = await supabase.from("transactions").delete().eq("id", pendingDeleteId);
            if (error) {
                console.error("Supabase delete error:", error);
                throw error;
            }

            console.log("Delete successful");
            setRecords(prev => prev.filter(r => r.id !== pendingDeleteId));
            fetchFinancials();
        } catch (error: any) {
            console.error("Error deleting transaction:", error);
            alert(`Erro ao excluir: ${error.message || 'Erro desconhecido'}`);
        } finally {
            setPendingDeleteId(null);
        }
    };

    return (
        <div style={{ maxWidth: '1200px', width: '100%', margin: '0 auto', paddingBottom: '5rem', animation: 'fadeIn 0.6s ease', overflowX: 'hidden' }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
                <div style={{ maxWidth: '100%' }}>
                    <h1 style={{ fontSize: '2.25rem', fontWeight: 800, background: 'linear-gradient(to right, #34d399, #22d3ee)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', margin: 0, wordBreak: 'break-word', lineHeight: 1.2 }}>
                        Financeiro
                    </h1>
                    <p style={{ color: '#9ca3af', marginTop: '0.25rem' }}>Fluxo de Caixa e Resultados</p>
                </div>
                <Button
                    onClick={() => handleOpenModal()}
                    style={{ background: '#059669', color: 'white', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 20px', borderRadius: '8px', boxShadow: '0 4px 6px rgba(5, 150, 105, 0.2)' }}
                >
                    <Plus size={20} /> Nova Movimentação
                </Button>
            </div>

            {/* Filters and Search Area */}
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: '1.5rem',
                marginBottom: '2rem',
                flexWrap: 'wrap'
            }}>
                <div style={{
                    ...glassStyle,
                    padding: '0.75rem 1.5rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem',
                    flex: 1,
                    minWidth: '300px'
                }}>
                    <Calendar size={18} style={{ color: '#9ca3af' }} />
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <input
                            type="date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            style={{
                                background: 'transparent',
                                border: 'none',
                                color: 'white',
                                outline: 'none',
                                fontSize: '0.875rem',
                                cursor: 'pointer'
                            }}
                        />
                        <span style={{ color: '#4b5563' }}>até</span>
                        <input
                            type="date"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            style={{
                                background: 'transparent',
                                border: 'none',
                                color: 'white',
                                outline: 'none',
                                fontSize: '0.875rem',
                                cursor: 'pointer'
                            }}
                        />
                    </div>
                </div>

                <div style={{ display: 'flex', gap: '1rem' }}>
                    <Button
                        onClick={() => {
                            setStartDate(format(startOfMonth(new Date()), "yyyy-MM-dd"));
                            setEndDate(format(endOfMonth(new Date()), "yyyy-MM-dd"));
                        }}
                        variant="ghost"
                        style={{ fontSize: '0.875rem' }}
                    >
                        Este Mês
                    </Button>
                    <Button
                        onClick={() => {
                            setStartDate(format(subDays(new Date(), 30), "yyyy-MM-dd"));
                            setEndDate(format(new Date(), "yyyy-MM-dd"));
                        }}
                        variant="ghost"
                        style={{ fontSize: '0.875rem' }}
                    >
                        Últimos 30 dias
                    </Button>
                </div>
            </div>

            {/* KPI Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(100%, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
                {/* Revenue */}
                <div style={{ ...glassStyle, padding: '1.5rem', position: 'relative', overflow: 'hidden' }}>
                    <div style={{ position: 'absolute', top: 0, right: 0, padding: '1rem', opacity: 0.1 }}>
                        <TrendingUp size={100} style={{ color: '#10b981' }} />
                    </div>
                    <p style={{ fontSize: '0.875rem', fontWeight: 600, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Receitas Totais</p>
                    <h2 style={{ fontSize: '2rem', fontWeight: 700, color: 'white', marginTop: '0.5rem', display: 'flex', alignItems: 'baseline', gap: '4px' }}>
                        <span style={{ color: '#34d399' }}>R$</span>
                        {summary.revenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </h2>
                </div>

                {/* Expenses */}
                <div style={{ ...glassStyle, padding: '1.5rem', position: 'relative', overflow: 'hidden' }}>
                    <div style={{ position: 'absolute', top: 0, right: 0, padding: '1rem', opacity: 0.1 }}>
                        <TrendingDown size={100} style={{ color: '#ef4444' }} />
                    </div>
                    <p style={{ fontSize: '0.875rem', fontWeight: 600, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Despesas</p>
                    <h2 style={{ fontSize: '2rem', fontWeight: 700, color: 'white', marginTop: '0.5rem', display: 'flex', alignItems: 'baseline', gap: '4px' }}>
                        <span style={{ color: '#f87171' }}>R$</span>
                        {summary.expenses.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </h2>
                </div>

                {/* Balance */}
                <div style={{ ...glassStyle, padding: '1.5rem', position: 'relative', overflow: 'hidden', border: summary.balance >= 0 ? '1px solid rgba(34, 211, 238, 0.3)' : '1px solid rgba(239, 68, 68, 0.3)' }}>
                    <div style={{ position: 'absolute', top: 0, right: 0, padding: '1rem', opacity: 0.1 }}>
                        <Wallet size={100} style={{ color: summary.balance >= 0 ? '#22d3ee' : '#ef4444' }} />
                    </div>
                    <p style={{ fontSize: '0.875rem', fontWeight: 600, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Saldo Líquido</p>
                    <h2 style={{ fontSize: '2rem', fontWeight: 700, marginTop: '0.5rem', display: 'flex', alignItems: 'baseline', gap: '4px', color: summary.balance >= 0 ? '#22d3ee' : '#f87171' }}>
                        <span>R$</span>
                        {summary.balance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </h2>
                </div>
            </div>

            {/* Financial Charts */}
            <div style={{ ...glassStyle, padding: '2rem', marginBottom: '2rem', minHeight: '400px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                    <div>
                        <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'white', margin: 0 }}>Fluxo de Caixa</h3>
                        <p style={{ color: '#9ca3af', fontSize: '0.875rem', marginTop: '0.25rem' }}>Comparativo diário de Entradas e Saídas</p>
                    </div>
                    <div style={{ display: 'flex', gap: '1.5rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <div style={{ width: '12px', height: '12px', borderRadius: '3px', background: '#34d399' }}></div>
                            <span style={{ fontSize: '0.75rem', color: '#9ca3af', fontWeight: 600 }}>ENTRADAS</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <div style={{ width: '12px', height: '12px', borderRadius: '3px', background: '#f87171' }}></div>
                            <span style={{ fontSize: '0.75rem', color: '#9ca3af', fontWeight: 600 }}>SAÍDAS</span>
                        </div>
                    </div>
                </div>

                <div style={{ width: '100%', height: 300 }}>
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                            <XAxis
                                dataKey="name"
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: '#6b7280', fontSize: 12 }}
                                dy={10}
                            />
                            <YAxis
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: '#6b7280', fontSize: 12 }}
                                tickFormatter={(value) => `R$ ${value}`}
                            />
                            <Tooltip
                                contentStyle={{
                                    background: 'rgba(15, 23, 42, 0.9)',
                                    border: '1px solid rgba(255,255,255,0.1)',
                                    borderRadius: '8px',
                                    backdropFilter: 'blur(8px)'
                                }}
                                itemStyle={{ fontSize: '0.875rem' }}
                                cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                            />
                            <Bar
                                dataKey="income"
                                name="Entradas"
                                fill="#34d399"
                                radius={[4, 4, 0, 0]}
                                barSize={20}
                            />
                            <Bar
                                dataKey="expense"
                                name="Saídas"
                                fill="#f87171"
                                radius={[4, 4, 0, 0]}
                                barSize={20}
                            />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Transactions List */}
            <div style={{ ...glassStyle, padding: 0, overflow: 'hidden' }}>
                <div style={{ padding: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'white', margin: 0 }}>Últimas Movimentações</h3>
                </div>

                {loading ? (
                    <div style={{ padding: '2rem', textAlign: 'center', color: '#6b7280' }}>Carregando dados financeiros...</div>
                ) : (
                    <>
                        {/* Desktop Table View */}
                        <div className="desktop-table-view">
                            <div className="table-responsive">
                                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                    <thead style={{ background: 'rgba(255,255,255,0.02)' }}>
                                        <tr>
                                            <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase' }}>Descrição</th>
                                            <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase' }}>Categoria</th>
                                            <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase' }}>Data</th>
                                            <th style={{ padding: '1rem', textAlign: 'right', fontSize: '0.75rem', fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase' }}>Valor</th>
                                            <th style={{ padding: '1rem', textAlign: 'right', fontSize: '0.75rem', fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase' }}>Ações</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {records.map((rec) => (
                                            <tr key={rec.id} style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                                                <td style={{ padding: '1rem' }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                                        <div style={{
                                                            padding: '8px', borderRadius: '8px',
                                                            background: rec.type === 'INCOME' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                                                            color: rec.type === 'INCOME' ? '#10b981' : '#ef4444'
                                                        }}>
                                                            {rec.source === 'SALE' ? <ShoppingBag size={18} /> : (rec.type === 'INCOME' ? <ArrowUpCircle size={18} /> : <ArrowDownCircle size={18} />)}
                                                        </div>
                                                        <div>
                                                            <p style={{ fontWeight: 600, color: 'white', margin: 0 }}>{rec.description}</p>
                                                            <span style={{ fontSize: '0.75rem', color: '#6b7280' }}>{rec.source === 'SALE' ? 'Venda Automática' : 'Manual'}</span>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td style={{ padding: '1rem' }}>
                                                    <span style={{ padding: '4px 8px', borderRadius: '999px', background: 'rgba(255,255,255,0.05)', fontSize: '0.75rem', color: '#d1d5db', border: '1px solid rgba(255,255,255,0.1)' }}>
                                                        {rec.category || 'Geral'}
                                                    </span>
                                                </td>
                                                <td style={{ padding: '1rem', color: '#9ca3af', fontSize: '0.875rem' }}>
                                                    {format(new Date(rec.date), "dd/MM/yyyy", { locale: ptBR })}
                                                </td>
                                                <td style={{ padding: '1rem', textAlign: 'right', fontWeight: 700, color: rec.type === 'INCOME' ? '#34d399' : '#f87171' }}>
                                                    {rec.type === 'INCOME' ? '+' : '-'} R$ {rec.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                                </td>
                                                <td style={{ padding: '1rem', textAlign: 'right' }}>
                                                    {rec.source === 'MANUAL' && (
                                                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                                                            <button
                                                                onClick={() => handleOpenModal(rec)}
                                                                style={{ background: 'transparent', border: 'none', color: '#9ca3af', cursor: 'pointer', padding: '4px' }}
                                                                title="Editar"
                                                            >
                                                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path></svg>
                                                            </button>
                                                            <button
                                                                onClick={() => handleDeleteClick(rec.id)}
                                                                style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '4px' }}
                                                                title="Excluir"
                                                            >
                                                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                                                            </button>
                                                        </div>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                        {records.length === 0 && (
                                            <tr>
                                                <td colSpan={5} style={{ padding: '2rem', textAlign: 'center', color: '#6b7280' }}>
                                                    Nenhuma movimentação registrada.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Mobile Card View */}
                        <div className="mobile-card-view">
                            <div style={{ padding: '1rem' }}>
                                {records.map((rec) => (
                                    <div key={rec.id} className="mobile-card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '1rem' }}>

                                        {/* Icon */}
                                        <div style={{
                                            padding: '12px', borderRadius: '12px',
                                            background: rec.type === 'INCOME' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                                            color: rec.type === 'INCOME' ? '#10b981' : '#ef4444',
                                            display: 'inline-flex', marginBottom: '0.5rem',
                                            boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
                                        }}>
                                            {rec.source === 'SALE' ? <ShoppingBag size={24} /> : (rec.type === 'INCOME' ? <ArrowUpCircle size={24} /> : <ArrowDownCircle size={24} />)}
                                        </div>

                                        {/* Main Info */}
                                        <div style={{ width: '100%' }}>
                                            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'white', marginBottom: '0.5rem', wordBreak: 'break-word', lineHeight: 1.3 }}>
                                                {rec.description}
                                            </h3>
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '0.85rem', color: '#9ca3af' }}>
                                                <span style={{ textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>{rec.category || 'Geral'}</span>
                                                <span>{format(new Date(rec.date), "dd 'de' MMMM, yyyy", { locale: ptBR })}</span>
                                            </div>
                                        </div>

                                        {/* Amount */}
                                        <div style={{ margin: '0.5rem 0', width: '100%', padding: '1rem', background: 'rgba(0,0,0,0.2)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
                                            <span style={{ fontSize: '0.75rem', color: '#6b7280', display: 'block', marginBottom: '4px', textTransform: 'uppercase' }}>Valor</span>
                                            <span style={{ fontSize: '1.75rem', fontWeight: 800, color: rec.type === 'INCOME' ? '#34d399' : '#f87171' }}>
                                                {rec.type === 'INCOME' ? '+' : '-'} {rec.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                            </span>
                                        </div>

                                        {/* Actions */}
                                        {rec.source === 'MANUAL' && (
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', width: '100%' }}>
                                                <button
                                                    onClick={() => handleOpenModal(rec)}
                                                    style={{ width: '100%', padding: '14px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', cursor: 'pointer', fontWeight: 600, fontSize: '1rem' }}
                                                >
                                                    <Edit size={18} /> Editar Movimentação
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteClick(rec.id)}
                                                    style={{ width: '100%', padding: '14px', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', color: '#ef4444', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', cursor: 'pointer', fontWeight: 600, fontSize: '1rem' }}
                                                >
                                                    <Trash2 size={18} /> Excluir Registro
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                ))}
                                {records.length === 0 && (
                                    <div style={{ padding: '2rem', textAlign: 'center', color: '#6b7280' }}>
                                        Nenhuma movimentação registrada.
                                    </div>
                                )}
                            </div>
                        </div>
                    </>
                )}
            </div>
            {/* Delete Confirmation Modal */}
            {pendingDeleteId && (
                <div style={{
                    position: 'fixed', inset: 0, zIndex: 110, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(4px)', animation: 'fadeIn 0.2s'
                }}>
                    <div style={{
                        ...glassStyle,
                        width: '100%', maxWidth: '350px', padding: '1.5rem',
                        background: 'rgba(20, 20, 20, 0.95)',
                        border: '1px solid rgba(239, 68, 68, 0.3)'
                    }}>
                        <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'white', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <TrendingDown size={20} color="#ef4444" />
                            Excluir Lançamento?
                        </h3>
                        <p style={{ color: '#9ca3af', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
                            Esta ação não pode ser desfeita. O lançamento será removido permanentemente.
                        </p>
                        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                            <button
                                onClick={() => setPendingDeleteId(null)}
                                style={{
                                    padding: '8px 16px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.1)',
                                    background: 'transparent', color: 'white', cursor: 'pointer'
                                }}
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={confirmDelete}
                                style={{
                                    padding: '8px 16px', borderRadius: '6px', border: 'none',
                                    background: '#ef4444', color: 'white', fontWeight: 'bold', cursor: 'pointer'
                                }}
                            >
                                Excluir
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal Nova/Editar Movimentação */}
            {modalOpen && (
                <div style={{
                    position: 'fixed', inset: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(4px)', animation: 'fadeIn 0.2s'
                }}>
                    <div style={{
                        ...glassStyle,
                        width: '100%', maxWidth: '400px', padding: '1.5rem', position: 'relative',
                        background: 'rgba(20, 20, 20, 0.95)'
                    }}>
                        <button onClick={() => setModalOpen(false)} style={{ position: 'absolute', right: '1rem', top: '1rem', background: 'transparent', border: 'none', color: 'gray', cursor: 'pointer' }}>
                            <X size={20} />
                        </button>

                        <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'white', marginBottom: '1.5rem' }}>
                            {editingId ? "Editar Movimentação" : "Nova Movimentação"}
                        </h2>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {/* Tipo */}
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <label style={{
                                    cursor: 'pointer', border: newTransaction.type === 'INCOME' ? '1px solid rgba(16, 185, 129, 0.5)' : '1px solid rgba(255,255,255,0.1)',
                                    background: newTransaction.type === 'INCOME' ? 'rgba(16, 185, 129, 0.1)' : 'transparent',
                                    padding: '0.75rem', borderRadius: '8px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem',
                                    color: newTransaction.type === 'INCOME' ? '#34d399' : '#6b7280'
                                }}>
                                    <input type="radio" name="type" className="hidden" onClick={() => setNewTransaction({ ...newTransaction, type: 'INCOME' })} style={{ display: 'none' }} />
                                    <ArrowUpCircle size={24} />
                                    <span style={{ fontSize: '0.875rem', fontWeight: 700 }}>Receita Extra</span>
                                </label>
                                <label style={{
                                    cursor: 'pointer', border: newTransaction.type === 'EXPENSE' ? '1px solid rgba(239, 68, 68, 0.5)' : '1px solid rgba(255,255,255,0.1)',
                                    background: newTransaction.type === 'EXPENSE' ? 'rgba(239, 68, 68, 0.1)' : 'transparent',
                                    padding: '0.75rem', borderRadius: '8px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem',
                                    color: newTransaction.type === 'EXPENSE' ? '#f87171' : '#6b7280'
                                }}>
                                    <input type="radio" name="type" className="hidden" onClick={() => setNewTransaction({ ...newTransaction, type: 'EXPENSE' })} style={{ display: 'none' }} />
                                    <ArrowDownCircle size={24} />
                                    <span style={{ fontSize: '0.875rem', fontWeight: 700 }}>Despesa</span>
                                </label>
                            </div>

                            <div>
                                <label style={labelStyle}>Descrição</label>
                                <input
                                    type="text"
                                    placeholder="Ex: Conta de Luz, Aluguel..."
                                    style={inputStyle}
                                    value={newTransaction.description}
                                    onChange={(e) => setNewTransaction({ ...newTransaction, description: e.target.value })}
                                />
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <div>
                                    <label style={labelStyle}>Valor (R$)</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        placeholder="0.00"
                                        style={{ ...inputStyle, fontFamily: 'monospace' }}
                                        value={newTransaction.amount}
                                        onChange={(e) => setNewTransaction({ ...newTransaction, amount: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label style={labelStyle}>Data</label>
                                    <input
                                        type="date"
                                        style={inputStyle}
                                        value={newTransaction.date}
                                        onChange={(e) => setNewTransaction({ ...newTransaction, date: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div>
                                <label style={labelStyle}>Categoria</label>
                                <select
                                    style={{ ...inputStyle, cursor: 'pointer' }}
                                    value={newTransaction.category}
                                    onChange={(e) => setNewTransaction({ ...newTransaction, category: e.target.value })}
                                >
                                    <option style={{ background: '#111827' }}>Operacional</option>
                                    <option style={{ background: '#111827' }}>Marketing</option>
                                    <option style={{ background: '#111827' }}>Aluguel</option>
                                    <option style={{ background: '#111827' }}>Salários</option>
                                    <option style={{ background: '#111827' }}>Impostos</option>
                                    <option style={{ background: '#111827' }}>Aporte</option>
                                    <option style={{ background: '#111827' }}>Outros</option>
                                </select>
                            </div>

                            <Button
                                onClick={handleSaveTransaction}
                                disabled={saving}
                                style={{
                                    width: '100%',
                                    marginTop: '1rem',
                                    background: '#059669',
                                    color: 'white',
                                    fontWeight: 'bold',
                                    padding: '12px',
                                    borderRadius: '8px'
                                }}
                            >
                                {saving ? "Salvando..." : (editingId ? "Atualizar Lançamento" : "Confirmar Lançamento")}
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
