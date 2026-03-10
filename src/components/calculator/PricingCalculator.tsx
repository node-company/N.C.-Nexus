"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { Calculator, DollarSign, Percent, TrendingUp, X, Save, Box, AlertCircle } from "lucide-react";

interface PricingCalculatorProps {
    initialProductCost?: number;
    onApplyPrice?: (price: number, cost: number) => void;
    onClose?: () => void;
    isModal?: boolean;
}

export function PricingCalculator({ initialProductCost = 0, onApplyPrice, onClose, isModal = false }: PricingCalculatorProps) {
    // 1. Custos Fixos da Empresa
    const [monthlyExpenses, setMonthlyExpenses] = useState<number>(0);
    const [monthlyRevenue, setMonthlyRevenue] = useState<number>(0);

    // 2. Taxas e Impostos Gerais
    const [taxPisCofins, setTaxPisCofins] = useState<number>(0);
    const [taxOther, setTaxOther] = useState<number>(0);

    // 3. Custos Variáveis do Produto
    const [unitCost, setUnitCost] = useState<number>(initialProductCost);
    const [freightCost, setFreightCost] = useState<number>(0);
    const [additionalCost, setAdditionalCost] = useState<number>(0);

    // 4. Taxas Variáveis do Produto
    const [taxIpi, setTaxIpi] = useState<number>(0);
    const [taxIcms, setTaxIcms] = useState<number>(0);
    const [cardFee, setCardFee] = useState<number>(0);
    const [commission, setCommission] = useState<number>(0);

    // 5. Margem Pretendida
    const [desiredMargin, setDesiredMargin] = useState<number>(20);

    // Load saved data on mount
    useEffect(() => {
        const savedData = localStorage.getItem("pricing_calculator_config");
        if (savedData) {
            try {
                const parsed = JSON.parse(savedData);
                if (parsed.monthlyExpenses) setMonthlyExpenses(parsed.monthlyExpenses);
                if (parsed.monthlyRevenue) setMonthlyRevenue(parsed.monthlyRevenue);
                if (parsed.taxPisCofins) setTaxPisCofins(parsed.taxPisCofins);
                if (parsed.taxOther) setTaxOther(parsed.taxOther);
                if (parsed.cardFee) setCardFee(parsed.cardFee);
                if (parsed.commission) setCommission(parsed.commission);
            } catch (e) {
                console.error("Error loading saved pricing config", e);
            }
        }
    }, []);

    // Save general data
    const saveConfig = () => {
        const config = {
            monthlyExpenses,
            monthlyRevenue,
            taxPisCofins,
            taxOther,
            cardFee,
            commission
        };
        localStorage.setItem("pricing_calculator_config", JSON.stringify(config));
        alert("Configurações da empresa salvas com sucesso!");
    };

    // Calculations
    const fixedCostPercentage = monthlyRevenue > 0 ? (monthlyExpenses / monthlyRevenue) * 100 : 0;
    const totalVariableTaxesPercentage = taxPisCofins + taxOther + taxIpi + taxIcms + cardFee + commission;
    const totalProductCost = (unitCost || 0) + (freightCost || 0) + (additionalCost || 0);

    // Markup = 100 / (100 - %CustoFixo - %DespesasVariaveis - %Margem)
    const divisor = 100 - fixedCostPercentage - totalVariableTaxesPercentage - desiredMargin;

    let markup = 0;
    let recommendedPrice = 0;
    let expectedProfit = 0;
    const isImpossible = divisor <= 0;

    if (!isImpossible && totalProductCost > 0) {
        markup = 100 / divisor;
        recommendedPrice = totalProductCost * markup;
        expectedProfit = recommendedPrice * (desiredMargin / 100);
    }

    const inputStyle = {
        background: 'rgba(255, 255, 255, 0.03)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: '8px',
        padding: '12px',
        color: 'white',
        width: '100%',
        fontSize: '0.95rem',
        outline: 'none',
        transition: 'all 0.2s',
        fontFamily: 'inherit'
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

    const handleApply = () => {
        if (onApplyPrice && recommendedPrice > 0) {
            onApplyPrice(recommendedPrice, totalProductCost);
        }
    };

    return (
        <div className={!isModal ? "glass-panel" : ""} style={{
            padding: isModal ? '0' : '2rem',
            borderRadius: '16px',
            animation: 'fadeIn 0.5s ease',
            color: 'white',
            maxWidth: isModal ? '100%' : '1200px',
            margin: '0 auto'
        }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <div>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 700, margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Calculator size={24} style={{ color: 'var(--color-primary)' }} />
                        Calculadora de Precificação Ideal
                    </h2>
                    <p style={{ color: '#9ca3af', fontSize: '0.875rem', marginTop: '0.25rem', marginBottom: 0 }}>
                        Descubra o preço de venda ideal com base nos seus custos e margem desejada.
                    </p>
                </div>
                {isModal && onClose && (
                    <Button variant="ghost" type="button" onClick={onClose} style={{ padding: '8px' }}>
                        <X size={20} />
                    </Button>
                )}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>

                {/* Lado Esquerdo - Custos e Despesas */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

                    {/* Seção 1: Empresa */}
                    <div style={{ background: 'rgba(255,255,255,0.02)', padding: '1.5rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                            <h3 style={{ fontSize: '1rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0 }}>
                                <DollarSign size={18} style={{ color: '#10b981' }} /> Dados da Empresa
                            </h3>
                            <Button variant="ghost" size="sm" onClick={saveConfig} style={{ fontSize: '0.75rem', height: '28px' }}>
                                <Save size={14} style={{ marginRight: '4px' }} /> Salvar Padrão
                            </Button>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                            <div>
                                <label style={labelStyle}>Faturamento Médio (R$)</label>
                                <input type="number" min="0" step="100" value={monthlyRevenue || ''} onChange={(e) => setMonthlyRevenue(parseFloat(e.target.value) || 0)} style={inputStyle} placeholder="Ex: 50000" />
                            </div>
                            <div>
                                <label style={labelStyle}>Despesas Mensais (R$)</label>
                                <input type="number" min="0" step="100" value={monthlyExpenses || ''} onChange={(e) => setMonthlyExpenses(parseFloat(e.target.value) || 0)} style={inputStyle} placeholder="Ex: 5000" />
                            </div>
                        </div>
                        <div style={{ marginTop: '0.75rem', fontSize: '0.8rem', color: '#a7f3d0' }}>
                            Custo Fixo sobre faturamento: <strong>{fixedCostPercentage.toFixed(2)}%</strong>
                        </div>
                    </div>

                    {/* Seção 2: Impostos e Taxas */}
                    <div style={{ background: 'rgba(255,255,255,0.02)', padding: '1.5rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
                        <h3 style={{ fontSize: '1rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0, marginBottom: '1rem' }}>
                            <Percent size={18} style={{ color: '#f59e0b' }} /> Impostos e Taxas Gerais (%)
                        </h3>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                            <div>
                                <label style={labelStyle}>Simples/PIS/COFINS</label>
                                <input type="number" min="0" step="0.1" value={taxPisCofins || ''} onChange={(e) => setTaxPisCofins(parseFloat(e.target.value) || 0)} style={inputStyle} placeholder="Ex: 6" />
                            </div>
                            <div>
                                <label style={labelStyle}>Outros Impostos (%)</label>
                                <input type="number" min="0" step="0.1" value={taxOther || ''} onChange={(e) => setTaxOther(parseFloat(e.target.value) || 0)} style={inputStyle} placeholder="Ex: 0" />
                            </div>
                            <div>
                                <label style={labelStyle}>Taxas Maquininha/Plat.</label>
                                <input type="number" min="0" step="0.1" value={cardFee || ''} onChange={(e) => setCardFee(parseFloat(e.target.value) || 0)} style={inputStyle} placeholder="Ex: 4.99" />
                            </div>
                            <div>
                                <label style={labelStyle}>Comissão Vendas (%)</label>
                                <input type="number" min="0" step="0.1" value={commission || ''} onChange={(e) => setCommission(parseFloat(e.target.value) || 0)} style={inputStyle} placeholder="Ex: 2" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Lado Direito - Produto e Margem */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

                    {/* Seção 3: Custos do Produto */}
                    <div style={{ background: 'rgba(255,255,255,0.02)', padding: '1.5rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
                        <h3 style={{ fontSize: '1rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0, marginBottom: '1rem' }}>
                            <Box size={18} style={{ color: 'var(--color-primary)' }} /> Custos do Produto (R$)
                        </h3>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                            <div>
                                <label style={labelStyle}>Custo Unitário</label>
                                <input type="number" min="0" step="1" value={unitCost || ''} onChange={(e) => setUnitCost(parseFloat(e.target.value) || 0)} style={inputStyle} />
                            </div>
                            <div>
                                <label style={labelStyle}>Frete/Unidade</label>
                                <input type="number" min="0" step="1" value={freightCost || ''} onChange={(e) => setFreightCost(parseFloat(e.target.value) || 0)} style={inputStyle} />
                            </div>
                            <div>
                                <label style={labelStyle}>Despesas Adicionais</label>
                                <input type="number" min="0" step="1" value={additionalCost || ''} onChange={(e) => setAdditionalCost(parseFloat(e.target.value) || 0)} style={inputStyle} />
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', paddingBottom: '0.5rem' }}>
                                <span style={{ fontSize: '0.8rem', color: '#9ca3af' }}>Custo Total:</span>
                                <span style={{ fontSize: '1.1rem', fontWeight: 700, color: 'white' }}>R$ {totalProductCost.toFixed(2)}</span>
                            </div>
                        </div>
                    </div>

                    {/* Seção 4: Impostos Específicos do Produto e Margem */}
                    <div style={{ background: 'rgba(255,255,255,0.02)', padding: '1.5rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
                        <h3 style={{ fontSize: '1rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0, marginBottom: '1rem' }}>
                            <TrendingUp size={18} style={{ color: '#3b82f6' }} /> Produto & Lucratividade
                        </h3>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                            <div>
                                <label style={labelStyle}>IPI (%)</label>
                                <input type="number" min="0" step="0.1" value={taxIpi || ''} onChange={(e) => setTaxIpi(parseFloat(e.target.value) || 0)} style={inputStyle} />
                            </div>
                            <div>
                                <label style={labelStyle}>ICMS/Outros (%)</label>
                                <input type="number" min="0" step="0.1" value={taxIcms || ''} onChange={(e) => setTaxIcms(parseFloat(e.target.value) || 0)} style={inputStyle} />
                            </div>
                            <div style={{ gridColumn: '1 / -1' }}>
                                <label style={{ ...labelStyle, color: '#34d399' }}>Margem de Lucro Desejada (%)</label>
                                <input type="number" min="0" step="1" value={desiredMargin || ''} onChange={(e) => setDesiredMargin(parseFloat(e.target.value) || 0)} style={{ ...inputStyle, borderColor: 'rgba(52, 211, 153, 0.3)', background: 'rgba(52, 211, 153, 0.05)', fontSize: '1.1rem', fontWeight: 600 }} placeholder="Ex: 20" />
                            </div>
                        </div>
                    </div>
                </div>

            </div>

            {/* Resultado do Cálculo */}
            <div style={{ marginTop: '2rem', padding: '2rem', background: 'linear-gradient(145deg, rgba(var(--color-primary-rgb), 0.1) 0%, rgba(var(--color-accent-rgb), 0.05) 100%)', borderRadius: '16px', border: '1px solid rgba(var(--color-primary-rgb), 0.2)' }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 700, margin: '0 0 1.5rem 0', textAlign: 'center' }}>Resultado</h3>

                {isImpossible ? (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', color: '#ef4444' }}>
                        <AlertCircle size={40} />
                        <div style={{ textAlign: 'center' }}>
                            <p style={{ fontWeight: 600, margin: 0 }}>Margem Inválida!</p>
                            <p style={{ fontSize: '0.9rem', marginTop: '0.5rem' }}>A soma dos custos fixos ({fixedCostPercentage.toFixed(1)}%), variáveis ({totalVariableTaxesPercentage.toFixed(1)}%) e margem ({desiredMargin}%) excede ou iguala 100%. É impossível precificar com essa margem.</p>
                        </div>
                    </div>
                ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>

                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '1rem', background: 'rgba(0,0,0,0.2)', borderRadius: '12px' }}>
                            <span style={{ fontSize: '0.85rem', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Markup</span>
                            <span style={{ fontSize: '1.5rem', fontWeight: 700, color: 'white' }}>{markup.toFixed(3)}</span>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '1rem', background: 'rgba(0,0,0,0.2)', borderRadius: '12px' }}>
                            <span style={{ fontSize: '0.85rem', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Preço Recomendado</span>
                            <span style={{ fontSize: '2rem', fontWeight: 800, color: '#34d399' }}>R$ {recommendedPrice.toFixed(2)}</span>
                            <span style={{ fontSize: '0.75rem', color: '#a7f3d0', marginTop: '4px' }}>Para cobrir todos os custos</span>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '1rem', background: 'rgba(0,0,0,0.2)', borderRadius: '12px' }}>
                            <span style={{ fontSize: '0.85rem', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Lucro Estimado</span>
                            <span style={{ fontSize: '1.5rem', fontWeight: 700, color: '#60a5fa' }}>R$ {expectedProfit.toFixed(2)}</span>
                            <span style={{ fontSize: '0.75rem', color: '#93c5fd', marginTop: '4px' }}>Valor livre por unidade</span>
                        </div>
                    </div>
                )}

                {isModal && !isImpossible && recommendedPrice > 0 && (
                    <div style={{ display: 'flex', justifyContent: 'center', marginTop: '2rem' }}>
                        <Button onClick={handleApply} style={{ background: 'var(--color-primary)', minWidth: '200px', height: '48px', fontWeight: 600 }}>
                            Aplicar R$ {recommendedPrice.toFixed(2)}
                        </Button>
                    </div>
                )}
            </div>

        </div>
    );
}
